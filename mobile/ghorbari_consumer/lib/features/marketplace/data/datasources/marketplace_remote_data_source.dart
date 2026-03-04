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

    // Enrich featured_categories
    final dynamic rawFeatured = contentMap['featured_categories'];
    List<dynamic> itemsToEnrich = [];

    if (rawFeatured is List) {
      itemsToEnrich = rawFeatured;
    } else if (rawFeatured != null && rawFeatured['items'] is List) {
      itemsToEnrich = rawFeatured['items'];
    }

    if (itemsToEnrich.isNotEmpty) {
      final List<String> ids = itemsToEnrich
          .map((i) => (i['id'] as String))
          .toList();
      
      final List<dynamic> categoriesResponse = await SupabaseService.from('product_categories')
          .select('id, name, name_bn, icon, icon_url, type, slug')
          .filter('id', 'in', ids);
      
       final enrichedItems = itemsToEnrich.map((item) {
        final matches = categoriesResponse.where((c) => c['id'] == item['id']).toList();
        final freshCat = matches.isNotEmpty ? matches.first : null;
        if (freshCat != null) {
          return {
            ...item,
            'name': freshCat['name'],
            'name_bn': freshCat['name_bn'],
            'icon': freshCat['icon_url'] ?? freshCat['icon'] ?? item['icon'],
            'type': freshCat['type'],
            'slug': freshCat['slug'],
          };
        }
        return item;
      }).toList();

      if (rawFeatured is List) {
        contentMap['featured_categories'] = enrichedItems;
      } else if (rawFeatured != null) {
        contentMap['featured_categories']['items'] = enrichedItems;
      }
    }

    return contentMap;
  }
}
