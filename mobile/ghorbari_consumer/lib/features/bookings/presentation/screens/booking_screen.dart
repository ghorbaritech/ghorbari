import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_state.dart';
import 'package:ghorbari_consumer/features/bookings/presentation/bloc/booking_bloc.dart';
import 'package:ghorbari_consumer/features/bookings/presentation/bloc/booking_event.dart';
import 'package:ghorbari_consumer/features/bookings/presentation/bloc/booking_state.dart';
import 'package:ghorbari_consumer/shared/models/service_item.dart';
import 'package:ghorbari_consumer/shared/models/booking.dart';
import 'package:ghorbari_consumer/core/theme/ghorbari_theme.dart';
import 'package:intl/intl.dart';

class BookingScreen extends StatefulWidget {
  final ServiceItem service;

  const BookingScreen({super.key, required this.service});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  int _currentStep = 0;
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  final _areaController = TextEditingController();
  final _requirementsController = TextEditingController();

  void _nextStep() {
    if (_currentStep < 2) {
      setState(() => _currentStep++);
    } else {
      _submitBooking();
    }
  }

  void _submitBooking() {
    final authState = context.read<AuthBloc>().state;
    if (authState is! AuthAuthenticated) return;
    
    final userId = authState.user.id;
    
    final booking = Booking(
      id: '', // Supabase will generate
      userId: userId,
      type: 'service',
      status: 'pending',
      totalAmount: double.tryParse(_areaController.text) ?? 0 * widget.service.unitPrice,
      advanceAmount: 0,
      createdAt: DateTime.now(),
    );

    context.read<BookingBloc>().add(BookingCreateRequested(booking));
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<BookingBloc, BookingState>(
      listener: (context, state) {
        if (state is BookingSuccess) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Booking request sent successfully!')),
          );
          Navigator.pop(context);
        }
        if (state is BookingFailure) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.message), backgroundColor: Colors.red),
          );
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text('Book ${widget.service.name}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF0F172A),
          elevation: 0,
        ),
        body: Column(
          children: [
            // Progress Indicator
            _buildProgressBar(),
            
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: _buildCurrentStep(),
              ),
            ),
            
            // Bottom Action Bar
            _buildBottomBar(),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      color: Colors.grey.shade50,
      child: Row(
        children: List.generate(3, (index) {
          bool isActive = index <= _currentStep;
          return Expanded(
            child: Container(
              height: 4,
              margin: EdgeInsets.only(right: index == 2 ? 0 : 8),
              decoration: BoxDecoration(
                color: isActive ? GhorbariTheme.primaryBlue : Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildCurrentStep() {
    switch (_currentStep) {
      case 0:
        return _buildScheduleStep();
      case 1:
        return _buildRequirementsStep();
      case 2:
        return _buildReviewStep();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildScheduleStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('When should we start?', 
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Text('Select a preferred date for the site visit.', 
          style: TextStyle(color: Colors.grey.shade500)),
        const SizedBox(height: 32),
        CalendarDatePicker(
          initialDate: _selectedDate,
          firstDate: DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 90)),
          onDateChanged: (date) => setState(() => _selectedDate = date),
        ),
      ],
    );
  }

  Widget _buildRequirementsStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Project Details', 
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 32),
        TextField(
          controller: _areaController,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            labelText: 'Estimated Area (${widget.service.unitType})',
            hintText: 'e.g. 1200',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        const SizedBox(height: 24),
        TextField(
          controller: _requirementsController,
          maxLines: 4,
          decoration: InputDecoration(
            labelText: 'Any special requirements?',
            hintText: 'Mention specific styles, materials, or constraints...',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ],
    );
  }

  Widget _buildReviewStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Confirm Booking', 
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 32),
        _buildReviewRow('Service', widget.service.name),
        _buildReviewRow('Preferred Date', DateFormat('MMM dd, yyyy').format(_selectedDate)),
        _buildReviewRow('Area', '${_areaController.text} ${widget.service.unitType}'),
        const Divider(height: 48),
        _buildReviewRow('Base Price', '৳${widget.service.unitPrice.toStringAsFixed(0)} / ${widget.service.unitType}'),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.blue.shade50,
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Row(
            children: [
               Icon(Icons.info_outline, color: Colors.blue),
               SizedBox(width: 12),
               Expanded(
                 child: Text(
                   'Final quotation will be provided after site inspection and requirement analysis.',
                   style: TextStyle(fontSize: 12, color: Colors.blue, fontWeight: FontWeight.w500),
                 ),
               ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildReviewRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade500, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -4)),
        ],
      ),
      child: Row(
        children: [
          if (_currentStep > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: () => setState(() => _currentStep--),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  side: const BorderSide(color: Color(0xFF0F172A)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('BACK', style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
              ),
            ),
          if (_currentStep > 0) const SizedBox(width: 16),
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: _nextStep,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: const Color(0xFF0F172A),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: BlocBuilder<BookingBloc, BookingState>(
                builder: (context, state) {
                  if (state is BookingLoading) {
                    return const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2));
                  }
                  return Text(_currentStep == 2 ? 'CONFIRM BOOKING' : 'NEXT', 
                    style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1));
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
