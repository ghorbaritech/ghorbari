import 'package:ghorbari_consumer/shared/models/service_item.dart';
import 'package:ghorbari_consumer/features/services/domain/repositories/service_repository.dart';
import 'package:ghorbari_consumer/features/services/data/datasources/service_remote_data_source.dart';

class ServiceRepositoryImpl implements ServiceRepository {
  final ServiceRemoteDataSource remoteDataSource;

  ServiceRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<ServiceItem>> getServices({String? categoryId}) async {
    return await remoteDataSource.getServices(categoryId: categoryId);
  }

  @override
  Future<List<ServiceItem>> getDesignPackages() async {
    return await remoteDataSource.getDesignPackages();
  }

  @override
  Future<ServiceItem> getServiceDetails(String serviceId) async {
    return await remoteDataSource.getServiceDetails(serviceId);
  }
}
