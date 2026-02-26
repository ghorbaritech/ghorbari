import 'package:ghorbari_partner/shared/models/order.dart';

abstract class PartnerOrderRepository {
  Future<List<Order>> getPartnerOrders(String partnerId);
  Future<Order> updateOrderStatus(String orderId, String status);
}

class PartnerOrderRepositoryImpl implements PartnerOrderRepository {
  final PartnerOrderRemoteDataSource remoteDataSource;

  PartnerOrderRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<Order>> getPartnerOrders(String partnerId) async {
    return await remoteDataSource.getPartnerOrders(partnerId);
  }

  @override
  Future<Order> updateOrderStatus(String orderId, String status) async {
    return await remoteDataSource.updateOrderStatus(orderId, status);
  }
}
