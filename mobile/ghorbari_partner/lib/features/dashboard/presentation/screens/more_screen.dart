import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_event.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_state.dart';
import 'package:ghorbari_partner/features/finance/presentation/screens/finance_screen.dart';
import 'package:ghorbari_partner/features/marketing/presentation/screens/campaigns_screen.dart';
import 'package:ghorbari_partner/features/support/presentation/screens/support_screen.dart';
import 'package:ghorbari_partner/features/settings/presentation/screens/settings_screen.dart';
import 'package:ghorbari_partner/main.dart'; // For Branding widget

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        String businessName = 'Retail Partner';
        String email = 'partner@ghorbari.com';
        if (state is AuthAuthenticated) {
          businessName = state.partner.profile?.businessName ?? businessName;
          email = state.partner.email ?? email;
        }

        return Scaffold(
          backgroundColor: const Color(0xFF0F172A),
          appBar: AppBar(
            title: const Text('MENU', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 2, fontSize: 14)),
            backgroundColor: Colors.transparent,
            elevation: 0,
            centerTitle: true,
          ),
          body: SingleChildScrollView(
            child: Column(
              children: [
                _buildProfileHeader(businessName, email),
                const SizedBox(height: 24),
                _buildMenuSection(context),
                _buildLogoutItem(context),
                const SizedBox(height: 40),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildProfileHeader(String name, String email) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        border: Border(bottom: BorderSide(color: Colors.white.withOpacity(0.05))),
      ),
      child: Column(
        children: [
          const CircleAvatar(
            radius: 40,
            backgroundColor: Colors.blueAccent,
            child: Icon(Icons.business_center_rounded, size: 40, color: Colors.white),
          ),
          const SizedBox(height: 16),
          Text(
            name,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            email,
            style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
          ),
          const SizedBox(height: 16),
          _buildEditProfileButton(),
        ],
      ),
    );
  }

  Widget _buildEditProfileButton() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.blueAccent.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.blueAccent.withOpacity(0.3)),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.edit_rounded, color: Colors.blueAccent, size: 14),
          SizedBox(width: 6),
          Text(
            'EDIT PROFILE',
            style: TextStyle(color: Colors.blueAccent, fontSize: 11, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuSection(BuildContext context) {
    return Column(
      children: [
        _buildMenuItem(context, Icons.monetization_on_outlined, 'Finance', 'Earnings & settlements', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const FinanceScreen()))),
        _buildMenuItem(context, Icons.campaign_outlined, 'Campaigns', 'Marketing & promotions', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CampaignsScreen()))),
        _buildMenuItem(context, Icons.help_outline_rounded, 'Support', 'Help center & contact', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SupportScreen()))),
        _buildMenuItem(context, Icons.settings_outlined, 'Settings', 'App preferences', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SettingsScreen()))),
      ],
    );
  }

  Widget _buildMenuItem(BuildContext context, IconData icon, String title, String subtitle, VoidCallback onTap) {
    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: Colors.blueAccent, size: 22),
      ),
      title: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
      subtitle: Text(subtitle, style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
      trailing: Icon(Icons.chevron_right_rounded, color: Colors.grey.shade700),
    );
  }

  Widget _buildLogoutItem(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 24),
      child: ListTile(
        onTap: () => context.read<AuthBloc>().add(AuthLogoutRequested()),
        contentPadding: const EdgeInsets.symmetric(horizontal: 24),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.red.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(Icons.logout_rounded, color: Colors.redAccent, size: 22),
        ),
        title: const Text('Sign Out', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 15)),
      ),
    );
  }
}
