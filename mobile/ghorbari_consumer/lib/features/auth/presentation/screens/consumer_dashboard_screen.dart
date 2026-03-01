import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_event.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_state.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/screens/home_screen.dart';

class ConsumerDashboardScreen extends StatelessWidget {
  const ConsumerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthUnauthenticated) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => const HomeScreen()),
            (route) => false,
          );
        }
      },
      child: Scaffold(
        backgroundColor: Colors.grey.shade50,
        appBar: AppBar(
          title: const Text('My Dashboard', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF0F172A),
          elevation: 0,
        ),
        body: BlocBuilder<AuthBloc, AuthState>(
          builder: (context, state) {
            String userName = 'User';
            String userEmail = '';
            if (state is AuthAuthenticated) {
              userName = state.user.fullName ?? 'User';
              userEmail = state.user.email;
            }

            return SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   Container(
                     padding: const EdgeInsets.all(20),
                     decoration: BoxDecoration(
                       color: const Color(0xFF0F172A),
                       borderRadius: BorderRadius.circular(16),
                     ),
                     child: Row(
                       children: [
                         const CircleAvatar(
                           radius: 30,
                           backgroundColor: Colors.white24,
                           child: Icon(Icons.person, color: Colors.white, size: 30),
                         ),
                         const SizedBox(width: 16),
                         Expanded(
                           child: Column(
                             crossAxisAlignment: CrossAxisAlignment.start,
                             children: [
                               Text(userName, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                               const SizedBox(height: 4),
                               Text(userEmail, style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
                             ],
                           ),
                         ),
                       ],
                     ),
                   ),
                   const SizedBox(height: 32),
                   const Text('Menu', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.grey)),
                   const SizedBox(height: 16),
                   _buildMenuItem(context, Icons.shopping_bag_outlined, 'My Orders', () {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Orders screen coming soon')));
                   }),
                   _buildMenuItem(context, Icons.file_copy_outlined, 'Service Requests', () {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Service Requests coming soon')));
                   }),
                   _buildMenuItem(context, Icons.message_outlined, 'Messages', () {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Messages coming soon')));
                   }),
                   _buildMenuItem(context, Icons.person_outline, 'Profile Settings', () {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile Settings coming soon')));
                   }),
                   const SizedBox(height: 16),
                   const Divider(),
                   const SizedBox(height: 16),
                   _buildMenuItem(context, Icons.logout, 'Log Out', () {
                      context.read<AuthBloc>().add(AuthLogoutRequested());
                   }, isDestructive: true),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildMenuItem(BuildContext context, IconData icon, String title, VoidCallback onTap, {bool isDestructive = false}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: ListTile(
        leading: Icon(icon, color: isDestructive ? Colors.red : const Color(0xFF0F172A)),
        title: Text(title, style: TextStyle(fontWeight: FontWeight.w600, color: isDestructive ? Colors.red : const Color(0xFF0F172A))),
        trailing: const Icon(Icons.chevron_right, color: Colors.grey),
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
