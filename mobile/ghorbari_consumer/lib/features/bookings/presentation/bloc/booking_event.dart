import 'package:equatable/equatable.dart';
import 'package:ghorbari_consumer/shared/models/booking.dart';

abstract class BookingEvent extends Equatable {
  const BookingEvent();

  @override
  List<Object?> get props => [];
}

class BookingCreateRequested extends BookingEvent {
  final Booking booking;

  const BookingCreateRequested(this.booking);

  @override
  List<Object?> get props => [booking];
}

class BookingFetchUserBookings extends BookingEvent {
  final String userId;

  const BookingFetchUserBookings(this.userId);

  @override
  List<Object?> get props => [userId];
}
