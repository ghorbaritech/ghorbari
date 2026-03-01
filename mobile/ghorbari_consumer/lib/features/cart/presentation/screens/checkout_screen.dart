import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_state.dart';
import 'package:ghorbari_consumer/features/bookings/presentation/bloc/booking_bloc.dart';
import 'package:ghorbari_consumer/features/bookings/presentation/bloc/booking_event.dart';
import 'package:ghorbari_consumer/features/bookings/presentation/bloc/booking_state.dart';
import 'package:ghorbari_consumer/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ghorbari_consumer/features/cart/presentation/bloc/cart_event.dart';
import 'package:ghorbari_consumer/features/cart/presentation/bloc/cart_state.dart';
import 'package:ghorbari_consumer/shared/models/booking.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/screens/home_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _dateController = TextEditingController();
  final _timeController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;

  Future<void> _selectDate(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
        _dateController.text = "${picked.day}/${picked.month}/${picked.year}";
      });
    }
  }

  Future<void> _selectTime(BuildContext context) async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime ?? TimeOfDay.now(),
    );
    if (picked != null && picked != _selectedTime) {
      if (mounted) {
         setState(() {
           _selectedTime = picked;
           _timeController.text = picked.format(context);
         });
      }
    }
  }

  @override
  void initState() {
    super.initState();
    // Pre-fill if logged in
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      _nameController.text = authState.user.fullName ?? authState.user.email;
      _phoneController.text = authState.user.phone ?? '';
    }
  }

  void _submitOrder(CartState cartState) {
    if (!_formKey.currentState!.validate()) return;
    
    final hasService = cartState.items.any((item) => item.product.metadata?['type'] == 'service' || item.product.metadata?['type'] == 'design');

    if (hasService && (_selectedDate == null || _selectedTime == null)) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select Date and Time for your appointment.'), backgroundColor: Colors.red));
      return;
    }

    final authState = context.read<AuthBloc>().state;
    final userId = authState is AuthAuthenticated ? authState.user.id : 'guest_user';

    final order = Booking(
      id: '', // Supabase generated
      userId: userId,
      type: hasService ? 'service' : 'product',
      status: 'pending',
      totalAmount: cartState.totalAmount,
      advanceAmount: 0,
      metadata: {
        if (hasService) 'appointment_date': _selectedDate?.toIso8601String(),
        if (hasService) 'appointment_time': _selectedTime?.format(context),
        'guest_info': {
          'name': _nameController.text,
          'phone': _phoneController.text,
          'address': _addressController.text,
        },
        'items': cartState.items.map((i) => {
          'product_id': i.product.id,
          'name': i.product.name,
          'price': i.product.price,
          'quantity': i.quantity,
        }).toList(),
      },
      createdAt: DateTime.now(),
    );

    context.read<BookingBloc>().add(BookingCreateRequested(order));
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<BookingBloc, BookingState>(
      listener: (context, state) {
        if (state is BookingSuccess) {
           context.read<CartBloc>().add(CartCleared());
           showDialog(
             context: context,
             barrierDismissible: false,
             builder: (context) => AlertDialog(
               title: const Row(children: [Icon(Icons.check_circle, color: Colors.green), SizedBox(width: 8), Text('Order Successful')]),
               content: const Text('Your order has been submitted for admin review. Thank you for shopping with Ghorbari!'),
               actions: [
                 TextButton(
                   onPressed: () {
                     Navigator.of(context).pushAndRemoveUntil(
                       MaterialPageRoute(builder: (context) => const HomeScreen()), 
                       (route) => false
                     );
                   },
                   child: const Text('BACK TO HOME', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                 )
               ],
             )
           );
        } else if (state is BookingFailure) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.message), backgroundColor: Colors.red));
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Checkout', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF0F172A),
          elevation: 0,
        ),
        body: BlocBuilder<CartBloc, CartState>(
          builder: (context, cartState) {
             if (cartState.items.isEmpty) {
                return const Center(child: Text('Your cart is empty.'));
             }

             return SingleChildScrollView(
               padding: const EdgeInsets.all(24),
               child: Form(
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
                       maxLines: 3,
                       decoration: InputDecoration(labelText: 'Delivery Address', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                       validator: (value) => value == null || value.isEmpty ? 'Please enter your delivery address' : null,
                     ),
                     const SizedBox(height: 32),
                     if (cartState.items.any((item) => item.product.metadata?['type'] == 'service' || item.product.metadata?['type'] == 'design')) ...[
                       const Text('2. Appointment Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                       const SizedBox(height: 16),
                       Row(
                         children: [
                           Expanded(
                             child: InkWell(
                               onTap: () => _selectDate(context),
                               child: IgnorePointer(
                                 child: TextFormField(
                                   controller: _dateController,
                                   decoration: InputDecoration(labelText: 'Date', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)), suffixIcon: const Icon(Icons.calendar_today)),
                                   validator: (value) => value == null || value.isEmpty ? 'Required' : null,
                                 ),
                               ),
                             ),
                           ),
                           const SizedBox(width: 16),
                           Expanded(
                             child: InkWell(
                               onTap: () => _selectTime(context),
                               child: IgnorePointer(
                                 child: TextFormField(
                                   controller: _timeController,
                                   decoration: InputDecoration(labelText: 'Time', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)), suffixIcon: const Icon(Icons.access_time)),
                                   validator: (value) => value == null || value.isEmpty ? 'Required' : null,
                                 ),
                               ),
                             ),
                           ),
                         ],
                       ),
                       const SizedBox(height: 32),
                     ],
                     Text(cartState.items.any((item) => item.product.metadata?['type'] == 'service' || item.product.metadata?['type'] == 'design') ? '3. Order Summary' : '2. Order Summary', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                     const SizedBox(height: 16),
                     Container(
                       padding: const EdgeInsets.all(16),
                       decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade200)),
                       child: Column(
                         children: [
                           ...cartState.items.map((item) => Padding(
                             padding: const EdgeInsets.only(bottom: 8.0),
                             child: Row(
                               mainAxisAlignment: MainAxisAlignment.spaceBetween,
                               children: [
                                  Expanded(child: Text('${item.quantity}x ${item.product.name}', maxLines: 1, overflow: TextOverflow.ellipsis)),
                                  Text('৳${(item.product.price * item.quantity).toStringAsFixed(0)}')
                               ],
                             ),
                           )),
                           const Divider(height: 24),
                           Row(
                             mainAxisAlignment: MainAxisAlignment.spaceBetween,
                             children: [
                               const Text('Total Amount', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                               Text('৳${cartState.totalAmount.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Colors.blue)),
                             ],
                           )
                         ],
                       ),
                     ),
                     const SizedBox(height: 32),
                     SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => _submitOrder(cartState),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0F172A),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: BlocBuilder<BookingBloc, BookingState>(
                            builder: (context, state) {
                              if (state is BookingLoading) {
                                return const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2));
                              }
                              return const Text('CONFIRM ORDER', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1));
                            }
                          )
                        ),
                      ),
                   ],
                 ),
               ),
             );
          }
        ),
      ),
    );
  }
}
