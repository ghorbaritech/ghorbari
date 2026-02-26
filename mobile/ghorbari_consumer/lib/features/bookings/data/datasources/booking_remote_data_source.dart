import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:ghorbari_consumer/core/network/supabase_service.dart';
import 'package:ghorbari_consumer/shared/models/booking.dart';

abstract class BookingRemoteDataSource {
  Future<Booking> createBooking(Booking booking);
  Future<List<Booking>> getUserBookings(String userId);
}

class BookingRemoteDataSourceImpl implements BookingRemoteDataSource {
  @override
  Future<Booking> createBooking(Booking booking) async {
    final response = await SupabaseService.from('bookings')
        .insert(booking.toJson())
        .select()
        .single();
    
    return Booking.fromJson(response);
  }

  @override
  Future<List<Booking>> getUserBookings(String userId) async {
    final response = await SupabaseService.from('bookings')
        .select()
        .eq('user_id', userId)
        .order('created_at', ascending: false);
    
    return (response as List).map((json) => Booking.fromJson(json)).toList();
  }
}
