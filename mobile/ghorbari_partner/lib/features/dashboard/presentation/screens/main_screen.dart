import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_event.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_state.dart';
import 'package:ghorbari_partner/features/auth/presentation/screens/login_screen.dart';
import 'package:ghorbari_partner/features/dashboard/presentation/screens/dashboard_screen.dart';
import 'package:ghorbari_partner/features/orders/presentation/screens/manage_orders_screen.dart';
import 'package:ghorbari_partner/features/inventory/presentation/screens/inventory_screen.dart';
import 'package:ghorbari_partner/features/finance/presentation/screens/finance_screen.dart';
import 'package:ghorbari_partner/features/marketing/presentation/screens/campaigns_screen.dart';
import 'package:ghorbari_partner/features/chat/presentation/screens/messages_screen.dart';
import 'package:ghorbari_partner/features/dashboard/presentation/screens/more_screen.dart';
import 'package:ghorbari_partner/features/support/presentation/screens/support_screen.dart';
import 'package:ghorbari_partner/features/settings/presentation/screens/settings_screen.dart';
import 'package:ghorbari_partner/main.dart'; // For Branding widget

import 'package:ghorbari_partner/features/orders/presentation/bloc/partner_order_bloc.dart';
import 'package:ghorbari_partner/features/orders/presentation/bloc/partner_order_event.dart';
import 'package:ghorbari_partner/features/inventory/presentation/bloc/inventory_bloc.dart';
import 'package:ghorbari_partner/core/services/notification_service.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _setupNotifications();
  }

  void _setupNotifications() {
    final state = context.read<AuthBloc>().state;
    if (state is AuthAuthenticated) {
      final partnerId = state.partner.profile!.id;
      NotificationService().listenToNotifications(partnerId);
      // Fetch orders & inventory immediately so the dashboard has data
      context.read<PartnerOrderBloc>().add(PartnerOrderFetchRequested(partnerId));
      context.read<InventoryBloc>().add(InventoryFetchRequested(partnerId));
    }
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  Widget _getScreen(int index) {
    switch (index) {
      case 0:
        return const DashboardScreen();
      case 1:
        return const ManageOrdersScreen();
      case 2:
        return const InventoryScreen();
      case 3:
        return const MessagesScreen();
      case 4:
        return const MoreScreen();
      default:
        return const DashboardScreen();
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthUnauthenticated) {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (context) => const LoginScreen()),
            (route) => false,
          );
        }
      },
      child: Scaffold(
        body: _getScreen(_selectedIndex),
        bottomNavigationBar: _buildBottomNavBar(),
      ),
    );
  }

  Widget _buildBottomNavBar() {
    return Container(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        type: BottomNavigationBarType.fixed,
        backgroundColor: const Color(0xFF0F172A),
        selectedItemColor: Colors.blueAccent,
        unselectedItemColor: Colors.grey.shade600,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Colors.blueAccent),
        unselectedLabelStyle: const TextStyle(fontSize: 10, color: Colors.grey),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_rounded), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_bag_rounded), label: 'Orders'),
          BottomNavigationBarItem(icon: Icon(Icons.inventory_2_rounded), label: 'Products'),
          BottomNavigationBarItem(icon: Icon(Icons.chat_bubble_rounded), label: 'Messages'),
          BottomNavigationBarItem(icon: Icon(Icons.menu_rounded), label: 'Menu'),
        ],
      ),
    );
  }

  Widget _buildDrawer() {
    return Drawer(
      backgroundColor: Colors.white,
      child: Column(
        children: [
          _buildDrawerHeader(),
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                _buildDrawerItem(Icons.monetization_on_outlined, 'Finance', () => Navigator.push(context, MaterialPageRoute(builder: (context) => const FinanceScreen()))),
                _buildDrawerItem(Icons.label_outline_rounded, 'Campaigns', () => Navigator.push(context, MaterialPageRoute(builder: (context) => const CampaignsScreen()))),
                const Divider(color: Colors.black12, indent: 20, endIndent: 20),
                _buildDrawerItem(Icons.help_outline_rounded, 'Support', () => Navigator.push(context, MaterialPageRoute(builder: (context) => const SupportScreen()))),
                _buildDrawerItem(Icons.settings_outlined, 'Settings', () => Navigator.push(context, MaterialPageRoute(builder: (context) => const SettingsScreen()))),
              ],
            ),
          ),
          _buildLogoutItem(),
        ],
      ),
    );
  }

  Widget _buildDrawerHeader() {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        String businessName = 'Retail Partner';
        if (state is AuthAuthenticated) {
          businessName = state.partner.profile?.businessName ?? businessName;
        }
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(24, 60, 24, 32),
          decoration: BoxDecoration(
            color: const Color(0xFF003366).withOpacity(0.05),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Branding(size: 40, showText: false),
              const SizedBox(height: 16),
              Text(
                businessName.toUpperCase(),
                style: const TextStyle(color: Color(0xFF003366), fontWeight: FontWeight.bold, fontSize: 18),
              ),
              const Text(
                'Partner Console',
                style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDrawerItem(IconData icon, String label, VoidCallback onTap) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      child: ListTile(
        leading: Icon(icon, color: Colors.grey.shade700, size: 22),
        title: Text(
          label,
          style: TextStyle(
            color: Colors.grey.shade800,
            fontSize: 14,
          ),
        ),
        onTap: () {
          Navigator.pop(context);
          onTap();
        },
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  Widget _buildLogoutItem() {
    return Container(
      padding: const EdgeInsets.all(24),
      child: ListTile(
        leading: const Icon(Icons.logout_rounded, color: Colors.redAccent, size: 22),
        title: const Text(
          'Sign Out',
          style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 14),
        ),
        onTap: () {
          context.read<AuthBloc>().add(AuthLogoutRequested());
        },
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
