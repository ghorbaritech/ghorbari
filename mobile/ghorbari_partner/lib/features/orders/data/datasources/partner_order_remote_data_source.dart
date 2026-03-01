import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:ghorbari_partner/core/network/supabase_service.dart';
import 'package:ghorbari_partner/shared/models/order.dart';

abstract class PartnerOrderRemoteDataSource {
  Future<List<Order>> getPartnerOrders(String partnerId);
  Future<Order> updateOrderStatus(String orderId, String status);
}

class PartnerOrderRemoteDataSourceImpl implements PartnerOrderRemoteDataSource {
  @override
  Future<List<Order>> getPartnerOrders(String partnerId) async {
    // In Ghorbari, we filter by seller_id for products/materials
    final response = await SupabaseService.from('orders')
        .select('*')
        .eq('seller_id', partnerId)
        .order('created_at', ascending: false);
    
    return (response as List).map((json) => Order.fromJson(json)).toList();
  }

  @override
  Future<Order> updateOrderStatus(String orderId, String status) async {
    final response = await SupabaseService.from('orders')
        .update({'status': status})
        .eq('id', orderId)
        .select()
        .single();
    
    return Order.fromJson(response);
  }
}
