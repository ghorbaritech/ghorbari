import 'package:flutter/material.dart';
import 'package:ghorbari_partner/shared/widgets/glass_card.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('SETTINGS', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 2, fontSize: 14)),
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('App & Account', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Manage your preferences', style: TextStyle(color: Colors.grey.shade400, fontSize: 14)),
            const SizedBox(height: 32),
            _buildSettingsSection('ACCOUNT', [
              _buildSettingsTile(Icons.lock_outline_rounded, 'Security & Password'),
              _buildSettingsTile(Icons.notifications_active_outlined, 'Push Notifications'),
              _buildSettingsTile(Icons.language_rounded, 'Language (English)'),
            ]),
            const SizedBox(height: 32),
            _buildSettingsSection('BUSINESS', [
              _buildSettingsTile(Icons.business_outlined, 'Business Details'),
              _buildSettingsTile(Icons.payments_outlined, 'Payout Settings'),
            ]),
            const SizedBox(height: 32),
            _buildSettingsSection('LEGAL', [
              _buildSettingsTile(Icons.description_outlined, 'Terms of Service'),
              _buildSettingsTile(Icons.privacy_tip_outlined, 'Privacy Policy'),
            ]),
            const SizedBox(height: 48),
            Center(
              child: Text(
                'VERSION 1.0.0 (BUILD 24)',
                style: TextStyle(color: Colors.grey.shade700, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingsSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(color: Colors.blueAccent, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
        const SizedBox(height: 16),
        ...children,
      ],
    );
  }

  Widget _buildSettingsTile(IconData icon, String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: Icon(icon, color: Colors.white60, size: 20),
        title: Text(label, style: const TextStyle(color: Colors.white, fontSize: 14)),
        trailing: const Icon(Icons.chevron_right_rounded, color: Colors.white24, size: 20),
        onTap: () {},
        tileColor: Colors.white.withOpacity(0.02),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
