import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_state.dart';
import 'package:ghorbari_partner/shared/widgets/glass_card.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        String name = 'Partner';
        String email = 'partner@ghorbari.com';
        String businessName = 'Ghorbari Business';
        
        if (state is AuthAuthenticated) {
          name = state.partner.profile?.businessName ?? name;
          businessName = state.partner.profile?.businessName ?? businessName;
        }

        return Scaffold(
          backgroundColor: const Color(0xFF0F172A),
          appBar: AppBar(
            title: const Text('PROFILE', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 2, fontSize: 14)),
            backgroundColor: Colors.transparent,
            elevation: 0,
            centerTitle: true,
            leading: IconButton(
              icon: const Icon(Icons.menu_rounded, color: Colors.white),
              onPressed: () => Scaffold.of(context).openDrawer(),
            ),
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                const CircleAvatar(
                  radius: 50,
                  backgroundColor: Colors.blueAccent,
                  child: Icon(Icons.business_center_rounded, size: 50, color: Colors.white),
                ),
                const SizedBox(height: 24),
                Text(businessName, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                Text('Retail Partner', style: TextStyle(color: Colors.blueAccent.withOpacity(0.8), fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 48),
                _buildProfileItem(Icons.email_outlined, 'Email', email),
                _buildProfileItem(Icons.phone_outlined, 'Phone', '+880 1234 567890'),
                _buildProfileItem(Icons.location_on_outlined, 'Business Address', 'Dhaka, Bangladesh'),
                _buildProfileItem(Icons.verified_outlined, 'Verification Status', 'PENDING'),
                const SizedBox(height: 48),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blueAccent,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('EDIT PROFILE', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildProfileItem(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: Colors.blueAccent, size: 20),
          ),
          const SizedBox(width: 20),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: TextStyle(color: Colors.grey.shade500, fontSize: 10, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(value, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }
}
