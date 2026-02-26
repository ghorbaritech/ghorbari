import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_state.dart';
import 'package:ghorbari_partner/features/orders/presentation/screens/manage_orders_screen.dart';
import 'package:ghorbari_partner/shared/widgets/glass_card.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        String businessName = 'Ghorbari Partner';
        if (state is AuthAuthenticated) {
          businessName = state.partner.profile?.businessName ?? businessName;
        }

        return Scaffold(
          backgroundColor: const Color(0xFF0F172A),
          body: CustomScrollView(
            slivers: [
              _buildSliverAppBar(context, businessName),
              SliverPadding(
                padding: const EdgeInsets.all(24),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    _buildStatsGrid(context),
                    const SizedBox(height: 32),
                    _buildSectionHeader(context, 'Quick Actions'),
                    const SizedBox(height: 16),
                    _buildQuickActions(),
                    const SizedBox(height: 32),
                    _buildSectionHeader(context, 'Recent Orders'),
                    const SizedBox(height: 16),
                    _buildRecentOrders(),
                  ]),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSliverAppBar(BuildContext context, String businessName) {
    return SliverAppBar(
      expandedHeight: 200,
      pinned: true,
      backgroundColor: const Color(0xFF0F172A),
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          padding: const EdgeInsets.fromLTRB(24, 80, 24, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Welcome back,',
                style: TextStyle(color: Colors.grey.shade400, fontSize: 14),
              ),
              const SizedBox(height: 4),
              Text(
                businessName,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, py: 4),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.green.withOpacity(0.3)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.verified_user_rounded, color: Colors.green, size: 12),
                    SizedBox(width: 4),
                    Text('VERIFIED PARTNER', style: TextStyle(color: Colors.green, fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 1)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      actions: [
        IconButton(icon: const Icon(Icons.notifications_none_rounded, color: Colors.white70), onPressed: () {}),
        IconButton(icon: const Icon(Icons.settings_outlined, color: Colors.white70), onPressed: () {}),
      ],
    );
  }

  Widget _buildStatsGrid() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.5,
      children: [
        _buildStatCard('Total Revenue', '৳45,200', Icons.payments_outlined, Colors.green),
        _buildStatCard('Active Orders', '12', Icons.shopping_bag_outlined, Colors.blue),
        _buildStatCard('Avg. Rating', '4.8', Icons.star_outline_rounded, Colors.orange),
        _buildStatCard('Profile Views', '124', Icons.visibility_outlined, Colors.purple),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      opacity: 0.03,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color, size: 20),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
              Text(label, style: TextStyle(color: Colors.grey.shade500, fontSize: 10, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.between,
      children: [
        Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        TextButton(onPressed: () {}, child: const Text('View All', style: TextStyle(color: Colors.blueAccent, fontSize: 12))),
      ],
    );
  }

  Widget _buildQuickActions() {
    return Row(
      children: [
        _buildActionButton('ADD PRODUCT', Icons.add_box_outlined),
        const SizedBox(width: 16),
        _buildActionButton('NEW QUOTE', Icons.description_outlined),
      ],
    );
  }

  Widget _buildActionButton(String label, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: Colors.blueAccent.withOpacity(0.15),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.blueAccent.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: Colors.blueAccent),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(color: Colors.blueAccent, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentOrders() {
    return Column(
      children: List.generate(3, (index) => _buildOrderTile()),
    );
  }

  Widget _buildOrderTile() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassCard(
        padding: const EdgeInsets.all(12),
        opacity: 0.02,
        borderRadius: BorderRadius.circular(12),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: Colors.blue.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.shopping_cart_outlined, color: Colors.blue, size: 20),
            ),
            const SizedBox(width: 16),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Order #GB-2144', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                  Text('2 items • Cement & Sand', style: TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
            ),
            const Text('৳12,000', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
