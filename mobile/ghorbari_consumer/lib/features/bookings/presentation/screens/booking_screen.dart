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
  TimeOfDay _selectedTime = const TimeOfDay(hour: 10, minute: 0);

  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      _nameController.text = authState.user.fullName ?? authState.user.email;
      _phoneController.text = authState.user.phone ?? '';
    }
  }

  void _nextStep() {
    if (_currentStep == 0) {
      if (!_formKey.currentState!.validate()) return;
      setState(() => _currentStep++);
    } else {
      _submitBooking();
    }
  }

  void _submitBooking() {
    final authState = context.read<AuthBloc>().state;
    final userId = authState is AuthAuthenticated ? authState.user.id : 'guest_user';
    
    final booking = Booking(
      id: '', // Supabase will generate
      userId: userId,
      type: 'service',
      status: 'pending',
      totalAmount: widget.service.unitPrice,
      advanceAmount: 0,
      metadata: {
        'preferred_date': _selectedDate.toIso8601String(),
        'preferred_time': '${_selectedTime.hour}:${_selectedTime.minute.toString().padLeft(2, '0')}',
        'guest_info': {
          'name': _nameController.text,
          'phone': _phoneController.text,
          'address': _addressController.text,
        },
      },
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
        children: List.generate(2, (index) {
          bool isActive = index <= _currentStep;
          return Expanded(
            child: Container(
              height: 4,
              margin: EdgeInsets.only(right: index == 1 ? 0 : 8),
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
        return _buildReviewStep();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildScheduleStep() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('1. User Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          TextFormField(
            controller: _nameController,
            decoration: InputDecoration(labelText: 'Full Name', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
            validator: (value) => value == null || value.isEmpty ? 'Please enter your name' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            decoration: InputDecoration(labelText: 'Phone Number', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
            validator: (value) => value == null || value.isEmpty ? 'Please enter your phone number' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _addressController,
            maxLines: 2,
            decoration: InputDecoration(labelText: 'Site Address', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
            validator: (value) => value == null || value.isEmpty ? 'Please enter the site address' : null,
          ),
          const SizedBox(height: 32),
          const Text('2. Appointment Date & Time', 
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          CalendarDatePicker(
            initialDate: _selectedDate,
            firstDate: DateTime.now(),
            lastDate: DateTime.now().add(const Duration(days: 90)),
            onDateChanged: (date) => setState(() => _selectedDate = date),
          ),
          const SizedBox(height: 24),
          const Text('Time', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          InkWell(
            onTap: () async {
              final time = await showTimePicker(
                context: context,
                initialTime: _selectedTime,
              );
              if (time != null) {
                setState(() => _selectedTime = time);
              }
            },
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(_selectedTime.format(context), style: const TextStyle(fontSize: 16)),
                  const Icon(Icons.access_time),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Confirm Booking', 
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 32),
        _buildReviewRow('Name', _nameController.text),
        _buildReviewRow('Phone', _phoneController.text),
        _buildReviewRow('Address', _addressController.text),
        const Divider(height: 32),
        _buildReviewRow('Service', widget.service.name),
        _buildReviewRow('Preferred Date', DateFormat('MMM dd, yyyy').format(_selectedDate)),
        _buildReviewRow('Preferred Time', _selectedTime.format(context)),
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
                  return Text(_currentStep == 1 ? 'CONFIRM BOOKING' : 'NEXT', 
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
