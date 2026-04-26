import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:Dalankotha_consumer/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:Dalankotha_consumer/features/auth/presentation/bloc/auth_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:Dalankotha_consumer/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:Dalankotha_consumer/features/auth/presentation/bloc/auth_state.dart';
import 'package:Dalankotha_consumer/features/bookings/presentation/bloc/booking_bloc.dart';
import 'package:Dalankotha_consumer/features/bookings/presentation/bloc/booking_event.dart';
import 'package:Dalankotha_consumer/features/bookings/presentation/bloc/booking_state.dart';
import 'package:Dalankotha_consumer/shared/models/service_item.dart';
import 'package:Dalankotha_consumer/shared/models/booking.dart';
import 'package:Dalankotha_consumer/core/theme/Dalankotha_theme.dart';
import 'package:intl/intl.dart';
import 'package:Dalankotha_consumer/features/services/data/repositories/service_repository_impl.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/screens/main_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

class BookingScreen extends StatefulWidget {
  final ServiceItem service;

  const BookingScreen({super.key, required this.service});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  int _currentStep = 0;
  List<ServiceItem> _availableItems = [];
  List<ServiceItem> _selectedItems = [];
  bool _isLoadingItems = true;
  String? _errorMessage;
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  TimeOfDay _selectedTime = const TimeOfDay(hour: 10, minute: 0);

  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();

  @override
  void initState() {
    _fetchSubItems();
    super.initState();
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      _nameController.text = authState.user.fullName ?? '';
      _emailController.text = authState.user.email ?? '';
      _phoneController.text = authState.user.phone ?? '';
    }
    _loadSavedInfo();
  }

  Future<void> _loadSavedInfo() async {
    final prefs = await SharedPreferences.getInstance();
    if (_phoneController.text.isEmpty) {
      _phoneController.text = prefs.getString('saved_phone') ?? '';
    }
    if (_addressController.text.isEmpty) {
      _addressController.text = prefs.getString('saved_address') ?? '';
    }
  }

  void _nextStep() {
    if (_currentStep == 0) {
      if (_availableItems.isNotEmpty && _selectedItems.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select at least one service item.'), backgroundColor: Colors.red));
        return;
      }
      setState(() => _currentStep++);
    } else if (_currentStep == 1) {
      if (!_formKey.currentState!.validate()) return;
      setState(() => _currentStep++);
    } else {
      _submitBooking();
    }
  }

  Future<void> _fetchSubItems() async {
    try {
      final repo = context.read<ServiceRepositoryImpl>();
      final items = await repo.getServices(categoryId: widget.service.id);
      if (mounted) {
        setState(() {
          _availableItems = items;
          _isLoadingItems = false;
        });
      }
    } catch (e, stackTrace) {
      print('DEBUG: Error fetching service sub-items: $e\n$stackTrace');
      if (mounted) {
        setState(() {
          _isLoadingItems = false;
          _errorMessage = e.toString();
        });
      }
    }
  }

  void _submitBooking() {
    // Save info for future reuse
    SharedPreferences.getInstance().then((prefs) {
      prefs.setString('saved_phone', _phoneController.text);
      prefs.setString('saved_address', _addressController.text);
    });

    final authState = context.read<AuthBloc>().state;
    final userId = authState is AuthAuthenticated ? authState.user.id : 'guest_user';
    
    final totalAmt = _selectedItems.isNotEmpty 
        ? _selectedItems.fold<double>(0, (sum, item) => sum + item.unitPrice)
        : widget.service.unitPrice;

    final booking = Booking(
      id: '', // Supabase will generate
      userId: userId,
      type: 'service',
      status: 'pending',
      totalAmount: totalAmt,
      advanceAmount: 0,
      metadata: {
        'preferred_date': _selectedDate.toIso8601String(),
        'preferred_time': '${_selectedTime.hour}:${_selectedTime.minute.toString().padLeft(2, '0')}',
        'selected_items': _selectedItems.map((i) => {'id': i.id, 'name': i.name, 'price': i.unitPrice}).toList(),
        'guest_info': {
          'name': _nameController.text,
          'email': _emailController.text,
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
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => AlertDialog(
              title: const Row(children: [Icon(Icons.check_circle, color: Colors.green), SizedBox(width: 8), Text('Booking Successful')]),
              content: const Text('Your service request has been submitted for admin review. Thank you!'),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(builder: (context) => const MainScreen()),
                      (route) => false,
                    );
                  },
                  child: const Text('BACK TO HOME', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                )
              ],
            )
          );
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
                color: isActive ? DalankothaTheme.primaryBlue : Colors.grey.shade300,
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
        return _buildItemsStep();
      case 1:
        return _buildScheduleStep();
      case 2:
        return _buildReviewStep();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildItemsStep() {
    if (_isLoadingItems) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 40),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    if (_errorMessage != null) {
       return Column(
         crossAxisAlignment: CrossAxisAlignment.start,
         children: [
           const Text('Error loading details', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
           const SizedBox(height: 8),
           Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
           const SizedBox(height: 16),
           ElevatedButton(onPressed: _fetchSubItems, child: const Text('Retry')),
         ],
       );
    }
    
    if (_availableItems.isEmpty) {
       return Column(
         crossAxisAlignment: CrossAxisAlignment.start,
         children: [
           const Text('Service Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
           const SizedBox(height: 16),
           Text('You are booking: ${widget.service.name}', style: const TextStyle(fontSize: 16)),
           const SizedBox(height: 8),
           Text('Base Estimate: ৳${widget.service.unitPrice}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
           const SizedBox(height: 24),
           const Text('No specific items available to select. Admin will contact you regarding details.', style: TextStyle(color: Colors.grey)),
         ],
       );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('1. Select Specific Services', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        const Text('Choose the items you need from this category.', style: TextStyle(color: Colors.grey)),
        const SizedBox(height: 16),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _availableItems.length,
          itemBuilder: (context, index) {
            final item = _availableItems[index];
            final isSelected = _selectedItems.any((i) => i.id == item.id);
            return Container(
               margin: const EdgeInsets.only(bottom: 12),
               decoration: BoxDecoration(
                 border: Border.all(color: isSelected ? DalankothaTheme.primaryBlue : Colors.grey.shade200),
                 color: isSelected ? DalankothaTheme.primaryBlue.withOpacity(0.05) : Colors.white,
                 borderRadius: BorderRadius.circular(12),
               ),
               child: CheckboxListTile(
                 value: isSelected,
                 onChanged: (val) {
                   setState(() {
                      if (val == true) {
                        _selectedItems.add(item);
                      } else {
                        _selectedItems.removeWhere((i) => i.id == item.id);
                      }
                   });
                 },
                 title: Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                 subtitle: Text(item.description ?? ''),
                 secondary: Text('৳${item.unitPrice}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                 activeColor: DalankothaTheme.primaryBlue,
                 controlAffinity: ListTileControlAffinity.leading,
                 contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
               ),
            );
          },
        ),
      ],
    );
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
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: InputDecoration(labelText: 'Email Address', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
            validator: (value) => value == null || value.isEmpty || !value.contains('@') ? 'Please enter a valid email' : null,
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
        _buildReviewRow('Email', _emailController.text),
        _buildReviewRow('Phone', _phoneController.text),
        _buildReviewRow('Address', _addressController.text),
        const Divider(height: 32),
        const Text('Selected Services', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey)),
        const SizedBox(height: 8),
        if (_selectedItems.isNotEmpty)
          ..._selectedItems.map((item) => Padding(
             padding: const EdgeInsets.only(bottom: 8.0),
             child: Row(
               mainAxisAlignment: MainAxisAlignment.spaceBetween,
               children: [
                 Text(item.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                 Text('৳${item.unitPrice}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
               ],
             ),
          )).toList()
        else
          _buildReviewRow('Service Group', widget.service.name),
        const SizedBox(height: 16),
        _buildReviewRow('Preferred Date', DateFormat('MMM dd, yyyy').format(_selectedDate)),
        _buildReviewRow('Preferred Time', _selectedTime.format(context)),
        const Divider(height: 32),
        _buildReviewRow('Total Estimate', '৳${(_selectedItems.isNotEmpty ? _selectedItems.fold<double>(0, (sum, item) => sum + item.unitPrice) : widget.service.unitPrice).toStringAsFixed(0)}'),
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
                child: const Text('Back', style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
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
                  return Text(_currentStep == 2 ? 'Confirm Booking' : 'Next', 
                    style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1, color: Colors.white));
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
