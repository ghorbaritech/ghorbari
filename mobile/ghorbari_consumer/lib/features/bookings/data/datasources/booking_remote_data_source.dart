import 'package:Dalankotha_consumer/core/network/supabase_service.dart';
import 'package:Dalankotha_consumer/shared/models/booking.dart';

abstract class BookingRemoteDataSource {
  Future<Booking> createBooking(Booking booking);
  Future<List<Booking>> getUserBookings(String userId);
}

class BookingRemoteDataSourceImpl implements BookingRemoteDataSource {
  @override
  Future<Booking> createBooking(Booking booking) async {
    final isGuest = booking.userId == 'guest_user';
    final actualUserId = isGuest ? null : booking.userId;
    
    final guestInfo = booking.metadata?['guest_info'] ?? {};
    final guestName = guestInfo['name'];
    final guestEmail = guestInfo['email'];
    final guestPhone = guestInfo['phone'];
    final guestAddress = guestInfo['address'];

    Map<String, dynamic> insertData;
    String tableName;

    // Route to correct table based on type
    if (booking.type == 'product') {
      tableName = 'orders';
      insertData = {
        'customer_id': actualUserId,
        'customer_name': guestName,
        'customer_email': guestEmail,
        'customer_phone': guestPhone,
        'shipping_address': guestAddress,
        'total_amount': booking.totalAmount,
        'advance_amount': booking.advanceAmount,
        'items': booking.metadata?['items'] ?? [],
        'seller_id': booking.metadata?['seller_id'],
        'status': 'pending',
        'order_number': 'ORD-${DateTime.now().millisecondsSinceEpoch}',
      };
    } else if (booking.type == 'service') {
      tableName = 'service_requests';
      insertData = {
        'customer_id': actualUserId,
        'total_amount': booking.totalAmount,
        'preferred_schedule': {
           'date': booking.metadata?['preferred_date'] ?? booking.metadata?['appointment_date'],
           'slot': booking.metadata?['preferred_time'] ?? booking.metadata?['appointment_time'],
        },
        'service_type': 'App Booking',
        'requirements': {
          ...(booking.metadata ?? {}),
          'customer_name': guestName,
          'customer_email': guestEmail,
          'customer_phone': guestPhone,
          'address': guestAddress,
        },
        'status': 'pending_assignment',
        'request_number': 'SRV-${DateTime.now().millisecondsSinceEpoch}',
      };
    } else {
      tableName = 'design_bookings';
      insertData = {
        'user_id': actualUserId,
        'customer_name': guestName,
        'customer_email': guestEmail,
        'customer_phone': guestPhone,
        'service_type': 'design',
        'status': 'pending',
        'details': booking.metadata,
      };
    }

    // Remove null values so DB defaults apply
    insertData.removeWhere((key, value) => value == null);

    final response = await SupabaseService.from(tableName)
        .insert(insertData)
        .select()
        .single();
    
    // Map response back to Booking model
    return Booking(
      id: response['id'] ?? response['request_number'] ?? '',
      userId: booking.userId,
      type: booking.type,
      status: response['status'] ?? 'pending',
      totalAmount: (response['total_amount'] ?? booking.totalAmount).toDouble(),
      advanceAmount: (response['advance_amount'] ?? booking.advanceAmount).toDouble(),
      metadata: booking.metadata,
      createdAt: response['created_at'] != null ? DateTime.parse(response['created_at']) : DateTime.now(),
    );
  }

  @override
  Future<List<Booking>> getUserBookings(String userId) async {
    // For simplicity, we fetch from orders and service_requests combined, 
    // but the MVP focus is on allowing bookings to go through.
    if (userId == 'guest_user') return [];

    try {
      final orders = await SupabaseService.from('orders')
          .select()
          .eq('customer_id', userId)
          .order('created_at', ascending: false);
      
      final services = await SupabaseService.from('service_requests')
          .select()
          .eq('customer_id', userId)
          .order('created_at', ascending: false);
          
      final List<Booking> results = [];
      
      for (var o in (orders as List)) {
        results.add(Booking(
          id: o['id'],
          userId: userId,
          type: 'product',
          status: o['status'] ?? 'pending',
          totalAmount: (o['total_amount'] ?? 0).toDouble(),
          advanceAmount: (o['advance_amount'] ?? 0).toDouble(),
          createdAt: DateTime.parse(o['created_at']),
        ));
      }
      
      for (var s in (services as List)) {
        results.add(Booking(
          id: s['id'] ?? s['request_number'] ?? '',
          userId: userId,
          type: 'service',
          status: s['status'] ?? 'pending',
          totalAmount: (s['total_amount'] ?? 0).toDouble(),
          advanceAmount: 0,
          createdAt: DateTime.parse(s['created_at']),
        ));
      }

      // Sort combined by date
      results.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      return results;
    } catch (e) {
      print('Error fetching mixed bookings: $e');
      return [];
    }
  }
}
