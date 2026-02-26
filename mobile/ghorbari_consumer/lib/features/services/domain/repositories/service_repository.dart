import 'package:ghorbari_consumer/shared/models/service_item.dart';

abstract class ServiceRepository {
  Future<List<ServiceItem>> getServices({String? categoryId});
  Future<List<ServiceItem>> getDesignPackages();
  Future<ServiceItem> getServiceDetails(String serviceId);
}
