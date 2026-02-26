import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:ghorbari_consumer/core/network/supabase_service.dart';
import 'package:ghorbari_consumer/shared/models/category.dart';
import 'package:ghorbari_consumer/shared/models/product.dart';

abstract class MarketplaceRemoteDataSource {
  Future<List<Category>> getCategories();
  Future<List<Product>> getProducts({String? categoryId});
  Future<Product> getProductDetails(String productId);
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
    return (response as List).map((json) => Product.fromJson(json)).toList();
  }

  @override
  Future<Product> getProductDetails(String productId) async {
    final response = await SupabaseService.from('products')
        .select()
        .eq('id', productId)
        .single();
    
    return Product.fromJson(response);
  }
}
