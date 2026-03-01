import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_state.dart';
import 'package:ghorbari_partner/features/orders/presentation/bloc/partner_order_bloc.dart';
import 'package:ghorbari_partner/features/orders/presentation/bloc/partner_order_state.dart';
import 'package:ghorbari_partner/features/inventory/presentation/bloc/inventory_bloc.dart';
import 'package:ghorbari_partner/features/dashboard/presentation/screens/more_screen.dart';
import 'package:ghorbari_partner/features/inventory/presentation/screens/inventory_screen.dart';
import 'package:ghorbari_partner/main.dart'; // For Branding widget
import 'package:ghorbari_partner/features/orders/presentation/screens/manage_orders_screen.dart';
import 'package:ghorbari_partner/shared/models/order.dart';
import 'package:intl/intl.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, authState) {
        String businessName = 'Partner';
        bool isVerified = false;
        if (authState is AuthAuthenticated) {
          businessName = authState.partner.profile?.businessName ?? businessName;
          isVerified = true;
        }
        return Scaffold(
          backgroundColor: const Color(0xFF0F172A),
          body: CustomScrollView(
            slivers: [
              _buildAppBar(context, businessName, isVerified),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 16),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    _buildStatsGrid(context),
                    const SizedBox(height: 28),
                    _buildSectionHeader('Quick Actions', 'View All', () {}),
                    const SizedBox(height: 12),
                    _buildQuickActions(context),
                    const SizedBox(height: 28),
                    _buildSectionHeader('Recent Orders', 'View All', () {
                      Navigator.push(context, MaterialPageRoute(
                          builder: (_) => const ManageOrdersScreen()));
                    }),
                    const SizedBox(height: 12),
                    _buildRecentOrders(context),
                    const SizedBox(height: 20),
                  ]),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // ─── App Bar ──────────────────────────────────────────────────────────────

  Widget _buildAppBar(BuildContext context, String businessName, bool isVerified) {
    return SliverAppBar(
      expandedHeight: 190,
      pinned: true,
      floating: false,
      backgroundColor: const Color(0xFF0F172A),
      surfaceTintColor: const Color(0xFF0F172A),
      elevation: 0,
      shadowColor: Colors.black45,
      leading: Padding(
        padding: const EdgeInsets.only(left: 16.0),
        child: Center(
          child: Branding(size: 80, showText: false),
        ),
      ),
      leadingWidth: 100,
      actions: [
        IconButton(
          icon: const Icon(Icons.notifications_none_rounded, color: Colors.white, size: 26),
          onPressed: () {},
        ),
        const SizedBox(width: 4),
      ],
      flexibleSpace: FlexibleSpaceBar(
        collapseMode: CollapseMode.pin,
        background: Container(
          color: const Color(0xFF0F172A),
          padding: const EdgeInsets.fromLTRB(20, 80, 20, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Text(
                'Welcome back,',
                style: TextStyle(
                  color: Colors.grey.shade500,
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                businessName,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                ),
              ),
              if (isVerified) ...[
                const SizedBox(height: 8),
                _buildVerifiedBadge(),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildVerifiedBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.green.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.green.withOpacity(0.3)),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.verified_rounded, color: Colors.green, size: 12),
          SizedBox(width: 4),
          Text(
            'VERIFIED PARTNER',
            style: TextStyle(
              color: Colors.green,
              fontSize: 10,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }

  // ─── Stats Grid ───────────────────────────────────────────────────────────

  Widget _buildStatsGrid(BuildContext context) {
    return BlocBuilder<PartnerOrderBloc, PartnerOrderState>(
      builder: (context, orderState) {
        return BlocBuilder<InventoryBloc, InventoryState>(
          builder: (context, inventoryState) {
            int activeOrders = 0;
            double totalRevenue = 0;
            int inventoryCount = 0;

            if (orderState is PartnerOrdersLoaded) {
              activeOrders = orderState.orders
                  .where((o) => ['pending', 'processing', 'confirmed']
                      .contains(o.status.toLowerCase()))
                  .length;
              totalRevenue = orderState.orders
                  .where((o) => o.status.toLowerCase() == 'completed')
                  .fold(0.0, (sum, o) => sum + o.totalAmount);
            }

            if (inventoryState is InventoryLoaded) {
              inventoryCount = inventoryState.products.length;
            }

            return GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.2, // Shorter cards (was 0.95)
              children: [
                _buildStatCard(
                  label: 'Total Revenue',
                  value: '৳${totalRevenue.toStringAsFixed(0)}',
                  icon: Icons.receipt_long_rounded,
                  iconBg: Colors.green.withOpacity(0.12),
                  iconColor: Colors.greenAccent,
                ),
                _buildStatCard(
                  label: 'Active Orders',
                  value: activeOrders.toString(),
                  icon: Icons.shopping_bag_outlined,
                  iconBg: Colors.blue.withOpacity(0.12),
                  iconColor: Colors.blueAccent,
                ),
                _buildStatCard(
                  label: 'Avg. Rating',
                  value: 'None',
                  icon: Icons.star_border_rounded,
                  iconBg: Colors.orange.withOpacity(0.12),
                  iconColor: Colors.orangeAccent,
                ),
                _buildStatCard(
                  label: 'Inventory',
                  value: inventoryCount == 0 ? '0 Items' : '$inventoryCount Items',
                  icon: Icons.inventory_2_outlined,
                  iconBg: Colors.purple.withOpacity(0.12),
                  iconColor: Colors.purpleAccent,
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildStatCard({
    required String label,
    required String value,
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04), // Dark theme clean card
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon top
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: iconBg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const Spacer(),
          // Value + label bottom
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              color: Colors.grey.shade500,
              fontSize: 10,
              fontWeight: FontWeight.w400,
            ),
          ),
        ],
      ),
    );
  }

  // ─── Section Header ───────────────────────────────────────────────────────

  Widget _buildSectionHeader(String title, String action, VoidCallback onTap) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 17,
            fontWeight: FontWeight.w700,
          ),
        ),
        GestureDetector(
          onTap: onTap,
          child: Text(
            action,
            style: const TextStyle(
              color: Colors.blueAccent,
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  // ─── Quick Actions ────────────────────────────────────────────────────────

  Widget _buildQuickActions(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _buildActionButton(
            label: 'ADD PRODUCT',
            icon: Icons.add_box_outlined,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const InventoryScreen()),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildActionButton(
            label: 'MANAGE ORDERS',
            icon: Icons.receipt_long_outlined,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ManageOrdersScreen()),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required String label,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.03),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: Column(
          children: [
            Icon(icon, color: Colors.blueAccent, size: 26),
            const SizedBox(height: 8),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 10,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Recent Orders ────────────────────────────────────────────────────────

  Widget _buildRecentOrders(BuildContext context) {
    return BlocBuilder<PartnerOrderBloc, PartnerOrderState>(
      builder: (context, state) {
        if (state is PartnerOrderLoading) {
          return const Padding(
            padding: EdgeInsets.all(24),
            child: Center(child: CircularProgressIndicator()),
          );
        }
        if (state is PartnerOrdersLoaded) {
          final recent = state.orders.take(3).toList();
          if (recent.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Text('No orders yet', style: TextStyle(color: Colors.grey.shade500)),
              ),
            );
          }
          return Column(children: recent.map((o) => _buildOrderTile(context, o)).toList());
        }
        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildOrderTile(BuildContext context, Order order) {
    final statusColors = {
      'completed': [Colors.green.withOpacity(0.1), Colors.greenAccent],
      'cancelled': [Colors.red.withOpacity(0.1), Colors.redAccent],
      'processing': [Colors.blue.withOpacity(0.1), Colors.blueAccent],
      'confirmed': [Colors.blue.withOpacity(0.1), Colors.blueAccent],
    };
    final colors = statusColors[order.status.toLowerCase()] ??
        [Colors.orange.withOpacity(0.1), Colors.orangeAccent];

    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const ManageOrdersScreen()),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.03),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.blueAccent.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.shopping_cart_outlined, color: Colors.blueAccent, size: 18),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Order #${order.id.substring(0, 8).toUpperCase()}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    DateFormat('MMM dd, yyyy').format(order.createdAt),
                    style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '৳${order.totalAmount.toStringAsFixed(0)}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: colors[0],
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    order.status.toUpperCase(),
                    style: TextStyle(color: colors[1], fontSize: 9, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
