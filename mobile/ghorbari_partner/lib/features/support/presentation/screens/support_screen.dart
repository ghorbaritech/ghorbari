import 'package:flutter/material.dart';
import 'package:ghorbari_partner/shared/widgets/glass_card.dart';

class SupportScreen extends StatelessWidget {
  const SupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('SUPPORT', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 2, fontSize: 14)),
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
            const Text('How can we help?', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Our support team is here for you 24/7', style: TextStyle(color: Colors.grey.shade400, fontSize: 14)),
            const SizedBox(height: 48),
            _buildSupportAction(Icons.chat_bubble_outline_rounded, 'Live Chat', 'Chat with an agent now', Colors.blueAccent),
            _buildSupportAction(Icons.email_outlined, 'Email Support', 'support@ghorbari.com', Colors.purpleAccent),
            _buildSupportAction(Icons.phone_outlined, 'Call Us', '+880 9612 345678', Colors.greenAccent),
            const SizedBox(height: 48),
            const Text('Frequently Asked Questions', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            ...List.generate(3, (index) => _buildFaqItem(index)),
          ],
        ),
      ),
    );
  }

  Widget _buildSupportAction(IconData icon, String title, String subtitle, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: GlassCard(
        padding: const EdgeInsets.all(20),
        opacity: 0.05,
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                  Text(subtitle, style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: Colors.white24),
          ],
        ),
      ),
    );
  }

  Widget _buildFaqItem(int index) {
    List<String> questions = ['How to update stock?', 'When do I get paid?', 'Verification process?'];
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        title: Text(questions[index], style: const TextStyle(color: Colors.white70, fontSize: 14)),
        iconColor: Colors.blueAccent,
        collapsedIconColor: Colors.white24,
        children: const [
          Padding(
            padding: EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Text(
              'You can easily manage this and more from your partner console settings and inventory management modules.',
              style: TextStyle(color: Colors.white54, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}
