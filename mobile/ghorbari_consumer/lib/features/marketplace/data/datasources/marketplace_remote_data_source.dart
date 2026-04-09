import 'package:ghorbari_consumer/core/network/supabase_service.dart';
import 'package:ghorbari_consumer/shared/models/category.dart';
import 'package:ghorbari_consumer/shared/models/product.dart';

abstract class MarketplaceRemoteDataSource {
  Future<List<Category>> getCategories();
  Future<List<Product>> getProducts({String? categoryId, bool recursive = false});
  Future<Product> getProductDetails(String productId);
  Future<Map<String, dynamic>> getHomeCMSContent();
}

class MarketplaceRemoteDataSourceImpl implements MarketplaceRemoteDataSource {
  @override
  Future<List<Category>> getCategories() async {
    final response = await SupabaseService.from('product_categories')
        .select()
        .order('name');
    
    return (response as List).map((json) => Category.fromJson(json)).toList();
  }

  @override
  Future<List<Product>> getProducts({String? categoryId, bool recursive = false}) async {
    List<String> categoryIds = [];

    if (recursive && categoryId != null) {
      final List<dynamic> allCategories = await SupabaseService.from('product_categories').select('id, parent_id');
      
      List<String> children = [categoryId];
      List<String> searchIds = [categoryId];
      
      while (searchIds.isNotEmpty) {
        List<String> nextIds = allCategories
            .where((c) => c['parent_id'] != null && searchIds.contains(c['parent_id']))
            .map((c) => c['id'] as String)
            .toList();
        children.addAll(nextIds);
        searchIds = nextIds;
      }
      categoryIds = children;
    } else if (categoryId != null) {
      categoryIds = [categoryId];
    }

    // Joining with sellers to get business name dynamically
    var query = SupabaseService.from('products')
        .select('*, seller:sellers(business_name)')
        .eq('status', 'active');
    
    if (categoryIds.isNotEmpty) {
      query = query.filter('category_id', 'in', categoryIds);
    }
    
    final response = await query.order('created_at', ascending: false);
    final rawList = response as List;
    print("DEBUG: Fetched ${rawList.length} products from Supabase before filtering.");
    if (rawList.isNotEmpty) {
      print("DEBUG: First item JSON: ${rawList.first}");
    }
    
    return rawList
        .where((json) {
           final hasTitle = (json['title'] != null || json['name'] != null);
           final hasId = json['id'] != null;
           // Filter out dummy sellers
           final sellerId = json['seller_id'] as String?;
           final isNotDummy = sellerId != 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1' && 
                              sellerId != '886df843-ec20-4413-9654-9352bbc9ee41';
           return hasTitle && hasId && isNotDummy;
        })
        .map((json) {
           try {
             return Product.fromJson(json);
           } catch (e) {
             print("DEBUG: Failed to parse Product: $e");
             return null;
           }
        })
        .where((p) => p != null)
        .cast<Product>()
        .toList();
  }

  @override
  Future<Product> getProductDetails(String productId) async {
    final response = await SupabaseService.from('products')
        .select()
        .eq('id', productId)
        .single();
    
    return Product.fromJson(response);
  }

  @override
  Future<Map<String, dynamic>> getHomeCMSContent() async {
    final List<dynamic> response = await SupabaseService.from('home_content')
        .select('*')
        .eq('is_active', true);
    
    final Map<String, dynamic> contentMap = {};
    for (var item in response) {
      contentMap[item['section_key']] = item['content'];
    }

    // Helper function for category enrichment
    Future<List<dynamic>> enrichItems(List<dynamic> items) async {
       if (items.isEmpty) return items;
       final List<String> ids = items
          .map((i) => (i is Map ? i['id'] : i)?.toString())
          .where((id) => id != null)
          .cast<String>()
          .toList();
      
      if (ids.isEmpty) return items;

      final List<dynamic> categoriesResponse = await SupabaseService.from('product_categories')
          .select('id, name, name_bn, icon, icon_url, type, slug, metadata')
          .filter('id', 'in', ids);
      
       return items.map((item) {
        final itemId = item is Map ? item['id'] : item;
        final matches = categoriesResponse.where((c) => c['id'] == itemId).toList();
        final freshCat = matches.isNotEmpty ? matches.first : null;
        if (freshCat != null) {
          if (item is Map) {
            return {
              ...item,
              'name': freshCat['name'],
              'name_bn': freshCat['name_bn'],
              'icon': freshCat['icon_url'] ?? freshCat['icon'] ?? item['icon'],
              'type': freshCat['type'],
              'slug': freshCat['slug'],
              'metadata': freshCat['metadata'],
            };
          } else {
             return {
              'id': freshCat['id'],
              'name': freshCat['name'],
              'name_bn': freshCat['name_bn'],
              'icon': freshCat['icon_url'] ?? freshCat['icon'],
              'type': freshCat['type'],
              'slug': freshCat['slug'],
              'metadata': freshCat['metadata'],
             };
          }
        }
        return item;
      }).toList();
    }

    // 1. Enrich featured_categories
    final dynamic rawFeatured = contentMap['featured_categories'];
    if (rawFeatured != null) {
      if (rawFeatured is List) {
        contentMap['featured_categories'] = await enrichItems(rawFeatured);
      } else if (rawFeatured['items'] is List) {
        contentMap['featured_categories']['items'] = await enrichItems(rawFeatured['items']);
      }
    }

    // 2. Enrich design_display_config (NEW)
    final dynamic rawDesign = contentMap['design_display_config'];
    if (rawDesign != null && rawDesign['selected_ids'] is List) {
       contentMap['design_display_config']['items'] = await enrichItems(rawDesign['selected_ids']);
    }

    print("DEBUG: CMS CONTENT KEYS: ${contentMap.keys.toList()}");
    if (contentMap['page_layout'] is List) {
      final layout = contentMap['page_layout'] as List;
      for (var item in layout) {
        print("DEBUG: LAYOUT ITEM: type=${item['type']}, key=${item['data_key']}, hidden=${item['hidden']}");
      }
    }

    return contentMap;
  }
}
