import 'package:equatable/equatable.dart';
import 'package:ghorbari_consumer/shared/models/booking.dart';

abstract class BookingState extends Equatable {
  const BookingState();

  @override
  List<Object?> get props => [];
}

class BookingInitial extends BookingState {}

class BookingLoading extends BookingState {}

class BookingSuccess extends BookingState {
  final Booking booking;

  const BookingSuccess(this.booking);

  @override
  List<Object?> get props => [booking];
}

class UserBookingsLoaded extends BookingState {
  final List<Booking> bookings;

  const UserBookingsLoaded(this.bookings);

  @override
  List<Object?> get props => [bookings];
}

class BookingFailure extends BookingState {
  final String message;

  const BookingFailure(this.message);

  @override
  List<Object?> get props => [message];
}
