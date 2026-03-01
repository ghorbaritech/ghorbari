import 'package:flutter/material.dart';
import 'package:ghorbari_partner/shared/widgets/glass_card.dart';

class CampaignsScreen extends StatelessWidget {
  const CampaignsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('CAMPAIGNS', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 2, fontSize: 14)),
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
            const Text('Marketing & Ads', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Boost your business visibility', style: TextStyle(color: Colors.grey.shade400, fontSize: 14)),
            const SizedBox(height: 32),
            _buildCampaignCard('Ramadan Deals 2026', 'ACTIVE', Colors.green, '1.2k reach'),
            const SizedBox(height: 16),
            _buildCampaignCard('Bulk Purchase Discount', 'SCHEDULED', Colors.orange, 'Starts Mar 10'),
            const SizedBox(height: 32),
            _buildCreateCampaignButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildCampaignCard(String title, String status, Color statusColor, String stats) {
    return GlassCard(
      padding: const EdgeInsets.all(20),
      opacity: 0.05,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                child: Text(status, style: TextStyle(color: statusColor, fontSize: 8, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(stats, style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
          const SizedBox(height: 20),
          Row(
            children: [
              TextButton(onPressed: () {}, child: const Text('View Stats', style: TextStyle(color: Colors.blueAccent, fontSize: 12))),
              const Spacer(),
              TextButton(onPressed: () {}, child: const Text('Edit', style: TextStyle(color: Colors.white70, fontSize: 12))),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCreateCampaignButton() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.blueAccent.withOpacity(0.3), style: BorderStyle.none),
        borderRadius: BorderRadius.circular(20),
        gradient: LinearGradient(colors: [Colors.blueAccent.withOpacity(0.1), Colors.blueAccent.withOpacity(0.05)]),
      ),
      child: Column(
        children: [
          const Icon(Icons.add_chart_rounded, color: Colors.blueAccent, size: 48),
          const SizedBox(height: 16),
          const Text('Run New Campaign', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          const Text('Get your brand in front of more customers', style: TextStyle(color: Colors.white54, fontSize: 12), textAlign: TextAlign.center),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blueAccent,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('START NOW', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
