import 'package:ghorbari_consumer/shared/models/category.dart';
import 'package:ghorbari_consumer/shared/models/product.dart';
import 'package:ghorbari_consumer/features/marketplace/domain/repositories/marketplace_repository.dart';
import 'package:ghorbari_consumer/features/marketplace/data/datasources/marketplace_remote_data_source.dart';

class MarketplaceRepositoryImpl implements MarketplaceRepository {
  final MarketplaceRemoteDataSource remoteDataSource;

  MarketplaceRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<Category>> getCategories() async {
    return await remoteDataSource.getCategories();
  }

  @override
  Future<List<Product>> getProducts({String? categoryId}) async {
    return await remoteDataSource.getProducts(categoryId: categoryId);
  }

  @override
  Future<Product> getProductDetails(String productId) async {
    return await remoteDataSource.getProductDetails(productId);
  }
}
