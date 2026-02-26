import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_consumer/features/bookings/domain/repositories/booking_repository.dart';
import 'package:ghorbari_consumer/features/bookings/presentation/bloc/booking_event.dart';
import 'package:ghorbari_consumer/features/bookings/presentation/bloc/booking_state.dart';

class BookingBloc extends Bloc<BookingEvent, BookingState> {
  final BookingRepository bookingRepository;

  BookingBloc({required this.bookingRepository}) : super(BookingInitial()) {
    on<BookingCreateRequested>(_onCreateRequested);
    on<BookingFetchUserBookings>(_onFetchUserBookings);
  }

  Future<void> _onCreateRequested(
    BookingCreateRequested event,
    Emitter<BookingState> emit,
  ) async {
    emit(BookingLoading());
    try {
      final booking = await bookingRepository.createBooking(event.booking);
      emit(BookingSuccess(booking));
    } catch (e) {
      emit(BookingFailure(e.toString()));
    }
  }

  Future<void> _onFetchUserBookings(
    BookingFetchUserBookings event,
    Emitter<BookingState> emit,
  ) async {
    emit(BookingLoading());
    try {
      final bookings = await bookingRepository.getUserBookings(event.userId);
      emit(UserBookingsLoaded(bookings));
    } catch (e) {
      emit(BookingFailure(e.toString()));
    }
  }
}
