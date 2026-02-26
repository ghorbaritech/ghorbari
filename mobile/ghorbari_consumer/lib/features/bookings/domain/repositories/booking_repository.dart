import 'package:ghorbari_consumer/shared/models/booking.dart';

abstract class BookingRepository {
  Future<Booking> createBooking(Booking booking);
  Future<List<Booking>> getUserBookings(String userId);
}
