import 'package:ghorbari_consumer/shared/models/category.dart';
import 'package:ghorbari_consumer/shared/models/product.dart';

abstract class MarketplaceRepository {
  Future<List<Category>> getCategories();
  Future<List<Product>> getProducts({String? categoryId});
  Future<Product> getProductDetails(String productId);
  Future<Map<String, dynamic>> getHomeCMSContent();
}
