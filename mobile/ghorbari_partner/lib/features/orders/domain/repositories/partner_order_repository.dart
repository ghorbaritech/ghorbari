import 'package:ghorbari_partner/shared/models/order.dart';

abstract class PartnerOrderRepository {
  Future<List<Order>> getPartnerOrders(String partnerId);
  Future<Order> updateOrderStatus(String orderId, String status);
}
