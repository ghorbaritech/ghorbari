import 'package:Dalankotha_consumer/shared/models/category.dart';
import 'package:Dalankotha_consumer/shared/models/product.dart';
import 'package:Dalankotha_consumer/features/marketplace/domain/repositories/marketplace_repository.dart';
import 'package:Dalankotha_consumer/features/marketplace/data/datasources/marketplace_remote_data_source.dart';

class MarketplaceRepositoryImpl implements MarketplaceRepository {
  final MarketplaceRemoteDataSource remoteDataSource;

  MarketplaceRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<Category>> getCategories() async {
    return await remoteDataSource.getCategories();
  }

  @override
  Future<List<Product>> getProducts({String? categoryId, bool recursive = false}) async {
    return await remoteDataSource.getProducts(categoryId: categoryId, recursive: recursive);
  }

  @override
  Future<Product> getProductDetails(String productId) async {
    return await remoteDataSource.getProductDetails(productId);
  }

  @override
  Future<Map<String, dynamic>> getHomeCMSContent() async {
    return await remoteDataSource.getHomeCMSContent();
  }
}
