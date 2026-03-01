import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_state.dart';
import 'package:ghorbari_partner/features/orders/presentation/bloc/partner_order_bloc.dart';
import 'package:ghorbari_partner/features/orders/presentation/bloc/partner_order_event.dart';
import 'package:ghorbari_partner/features/orders/presentation/bloc/partner_order_state.dart';
import 'package:ghorbari_partner/shared/models/order.dart';
import 'package:ghorbari_partner/shared/widgets/shimmer_loading.dart';
import 'package:intl/intl.dart';

class ManageOrdersScreen extends StatefulWidget {
  const ManageOrdersScreen({super.key});

  @override
  State<ManageOrdersScreen> createState() => _ManageOrdersScreenState();
}

class _ManageOrdersScreenState extends State<ManageOrdersScreen> {
  @override
  void initState() {
    super.initState();
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      context.read<PartnerOrderBloc>().add(PartnerOrderFetchRequested(authState.partner.profile!.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Manage Orders', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: BlocBuilder<PartnerOrderBloc, PartnerOrderState>(
        builder: (context, state) {
          if (state is PartnerOrderLoading) {
            return ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: 5,
              itemBuilder: (context, index) => ShimmerLoading.orderTilePlaceholder(),
            );
          }
          if (state is PartnerOrdersLoaded) {
            final orders = state.orders;
            if (orders.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.shopping_bag_outlined, size: 64, color: Colors.white.withOpacity(0.1)),
                    const SizedBox(height: 16),
                    Text('No orders yet', style: TextStyle(color: Colors.grey.shade500)),
                  ],
                ),
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: orders.length,
              itemBuilder: (context, index) {
                final order = orders[index];
                return _buildOrderCard(order);
              },
            );
          }
          if (state is PartnerOrderFailure) {
            return Center(child: Text('Error: ${state.message}', style: const TextStyle(color: Colors.red)));
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildOrderCard(Order order) {
    Color statusColor;
    switch (order.status.toLowerCase()) {
      case 'completed': statusColor = Colors.green; break;
      case 'cancelled': statusColor = Colors.red; break;
      case 'processing': statusColor = Colors.blue; break;
      default: statusColor = Colors.orange;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'ORDER #${order.id.substring(0, 8).toUpperCase()}',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
              ),
              _buildStatusBadge(order.status.toUpperCase(), statusColor),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            'Placed on ${DateFormat('MMM dd, yyyy').format(order.createdAt)}',
            style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
          ),
          const SizedBox(height: 12),
          const Divider(color: Colors.white10),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${order.items.length} Items', style: const TextStyle(color: Colors.white70, fontSize: 13)),
              Text('৳${order.totalAmount.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
               Expanded(
                 child: OutlinedButton(
                   onPressed: () {},
                   style: OutlinedButton.styleFrom(
                     side: BorderSide(color: Colors.white.withOpacity(0.1)),
                   ),
                   child: const Text('DETAILS', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                 ),
               ),
               const SizedBox(width: 12),
               Expanded(
                 child: ElevatedButton(
                   onPressed: () => _showStatusUpdateSheet(order),
                   style: ElevatedButton.styleFrom(
                     backgroundColor: Colors.blueAccent,
                   ),
                   child: const Text('UPDATE STATUS', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                 ),
               ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        status,
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }

  void _showStatusUpdateSheet(Order order) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Update Order Status', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 24),
              _buildStatusOption(order, 'PROCESSING', Colors.blue),
              _buildStatusOption(order, 'SHIPPED', Colors.purple),
              _buildStatusOption(order, 'COMPLETED', Colors.green),
              _buildStatusOption(order, 'CANCELLED', Colors.red),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatusOption(Order order, String status, Color color) {
    return ListTile(
      leading: Icon(Icons.circle, color: color, size: 12),
      title: Text(status, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500)),
      onTap: () {
        context.read<PartnerOrderBloc>().add(PartnerOrderStatusUpdateRequested(order.id, status.toLowerCase()));
        Navigator.pop(context);
      },
    );
  }
}
