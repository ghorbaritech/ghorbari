import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:ghorbari_partner/core/network/supabase_service.dart';
import 'package:ghorbari_partner/shared/models/product.dart';

abstract class ProductRemoteDataSource {
  Future<List<Product>> getPartnerProducts(String partnerId);
  Future<Product> addProduct(Product product);
  Future<void> deleteProduct(String productId);
}

class ProductRemoteDataSourceImpl implements ProductRemoteDataSource {
  @override
  Future<List<Product>> getPartnerProducts(String partnerId) async {
    final response = await SupabaseService.from('products')
        .select()
        .eq('seller_id', partnerId)
        .order('created_at', ascending: false);
    
    return (response as List).map((json) => Product.fromJson(json)).toList();
  }

  @override
  Future<Product> addProduct(Product product) async {
    final response = await SupabaseService.from('products')
        .insert(product.toJson())
        .select()
        .single();
    
    return Product.fromJson(response);
  }

  @override
  Future<void> deleteProduct(String productId) async {
    await SupabaseService.from('products')
        .delete()
        .eq('id', productId);
  }
}
