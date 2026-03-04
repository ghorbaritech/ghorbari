import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:ghorbari_consumer/core/theme/ghorbari_theme.dart';

class MessagesScreen extends StatelessWidget {
  const MessagesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text('messages'.tr(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF0F172A),
          elevation: 0,
        ),
        body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.message_outlined, size: 80, color: Colors.grey.shade300),
                const SizedBox(height: 16),
                const Text(
                  'No Messages Yet',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey),
                ),
                const SizedBox(height: 8),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 40.0),
                  child: Text(
                    'Your conversations with admins and suppliers will appear here soon.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () {
                     // Empty integration
                     ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Starting new conversation...')));
                  },
                  icon: const Icon(Icons.chat_bubble_outline),
                  label: const Text('Start New Conversation'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: GhorbariTheme.primaryBlue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                )
              ],
            )
        )
    );
  }
}
