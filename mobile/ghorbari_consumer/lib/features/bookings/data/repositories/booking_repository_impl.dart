import 'package:ghorbari_consumer/shared/models/booking.dart';
import 'package:ghorbari_consumer/features/bookings/domain/repositories/booking_repository.dart';
import 'package:ghorbari_consumer/features/bookings/data/datasources/booking_remote_data_source.dart';

class BookingRepositoryImpl implements BookingRepository {
  final BookingRemoteDataSource remoteDataSource;

  BookingRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Booking> createBooking(Booking booking) async {
    return await remoteDataSource.createBooking(booking);
  }

  @override
  Future<List<Booking>> getUserBookings(String userId) async {
    return await remoteDataSource.getUserBookings(userId);
  }
}
