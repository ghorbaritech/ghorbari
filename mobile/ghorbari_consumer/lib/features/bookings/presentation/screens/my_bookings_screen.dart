import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_state.dart';
import 'package:ghorbari_consumer/features/bookings/presentation/bloc/booking_bloc.dart';
import 'package:ghorbari_consumer/features/bookings/presentation/bloc/booking_event.dart';
import 'package:ghorbari_consumer/features/bookings/presentation/bloc/booking_state.dart';
import 'package:ghorbari_consumer/shared/models/booking.dart';
import 'package:intl/intl.dart';

class MyBookingsScreen extends StatefulWidget {
  const MyBookingsScreen({super.key});

  @override
  State<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends State<MyBookingsScreen> {
  @override
  void initState() {
    super.initState();
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      context.read<BookingBloc>().add(BookingFetchUserBookings(authState.user.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('My Bookings', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
      ),
      body: BlocBuilder<BookingBloc, BookingState>(
        builder: (context, state) {
          if (state is BookingLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state is UserBookingsLoaded) {
            final bookings = state.bookings;
            if (bookings.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.calendar_today_outlined, size: 64, color: Colors.grey.shade300),
                    const SizedBox(height: 16),
                    Text('No bookings found', style: TextStyle(color: Colors.grey.shade500)),
                  ],
                ),
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: bookings.length,
              itemBuilder: (context, index) {
                final booking = bookings[index];
                return _buildBookingCard(booking);
              },
            );
          }
          if (state is BookingFailure) {
            return Center(child: Text('Error: ${state.message}'));
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildBookingCard(Booking booking) {
    Color statusColor;
    switch (booking.status.toLowerCase()) {
      case 'confirmed': statusColor = Colors.green; break;
      case 'cancelled': statusColor = Colors.red; break;
      default: statusColor = Colors.orange;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade100),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Text(
                'Booking #${booking.id.substring(0, 8).toUpperCase()}',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, py: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  booking.status.toUpperCase(),
                  style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
               const Icon(Icons.calendar_today, size: 14, color: Colors.grey),
               const SizedBox(width: 8),
               Text(
                 DateFormat('MMM dd, yyyy').format(booking.createdAt),
                 style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
               ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              const Text('Quotation Status', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
              Text(
                booking.totalAmount > 0 ? '৳${booking.totalAmount.toStringAsFixed(0)}' : 'Awaiting Inspection',
                style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
