import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:ghorbari_consumer/core/network/supabase_service.dart';
import 'package:ghorbari_consumer/shared/models/category.dart';
import 'package:ghorbari_consumer/shared/models/product.dart';

abstract class MarketplaceRemoteDataSource {
  Future<List<Category>> getCategories();
  Future<List<Product>> getProducts({String? categoryId});
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
  Future<List<Product>> getProducts({String? categoryId}) async {
    var query = SupabaseService.from('products').select();
    
    if (categoryId != null) {
      query = query.eq('category_id', categoryId);
    }
    
    final response = await query.order('created_at', ascending: false);
    final rawList = response as List;
    
    return rawList
        .where((json) => json['name'] != null && json['id'] != null)
        .map((json) => Product.fromJson(json))
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
          .select('id, name, name_bn, icon, type, slug')
          .filter('id', 'in', ids);
      
       final enrichedItems = itemsToEnrich.map((item) {
        final matches = categoriesResponse.where((c) => c['id'] == item['id']).toList();
        final freshCat = matches.isNotEmpty ? matches.first : null;
        if (freshCat != null) {
          return {
            ...item,
            'name': freshCat['name'],
            'name_bn': freshCat['name_bn'],
            'icon': freshCat['icon'] ?? item['icon'],
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
