import 'package:ghorbari_partner/shared/models/order.dart';
import 'package:ghorbari_partner/features/orders/domain/repositories/partner_order_repository.dart';
import 'package:ghorbari_partner/features/orders/data/datasources/partner_order_remote_data_source.dart';

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
