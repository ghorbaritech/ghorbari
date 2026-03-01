import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_state.dart';
import 'package:ghorbari_partner/main.dart'; // For Branding widget
import 'package:ghorbari_partner/features/chat/presentation/bloc/chat_bloc.dart';
import 'package:ghorbari_partner/features/chat/presentation/screens/chat_screen.dart';
import 'package:ghorbari_partner/shared/models/chat.dart';
import 'package:ghorbari_partner/shared/widgets/glass_card.dart';
import 'package:intl/intl.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  @override
  void initState() {
    super.initState();
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      context.read<ChatBloc>().add(ChatConversationsFetchRequested(authState.partner.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('MESSAGES', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 2, fontSize: 14)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: Padding(
          padding: const EdgeInsets.only(left: 16.0),
          child: Center(
            child: Branding(size: 80, showText: false),
          ),
        ),
        leadingWidth: 100,
      ),
      body: BlocBuilder<ChatBloc, ChatState>(
        builder: (context, state) {
          if (state is ChatLoading) {
            return const Center(child: CircularProgressIndicator(color: Colors.blueAccent));
          }
          if (state is ChatConversationsLoaded) {
            final conversations = state.conversations;
            return Column(
              children: [
                _buildSearchField(),
                Expanded(
                  child: conversations.isEmpty
                      ? _buildEmptyState()
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          itemCount: conversations.length,
                          itemBuilder: (context, index) => _buildChatTile(conversations[index]),
                        ),
                ),
              ],
            );
          }
          if (state is ChatFailure) {
            return Center(child: Text('Error: ${state.message}', style: const TextStyle(color: Colors.red)));
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.chat_bubble_outline_rounded, size: 64, color: Colors.white.withOpacity(0.1)),
          const SizedBox(height: 16),
          Text('No conversations yet', style: TextStyle(color: Colors.grey.shade500)),
        ],
      ),
    );
  }

  Widget _buildSearchField() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: GlassCard(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        opacity: 0.05,
        child: TextField(
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            icon: const Icon(Icons.search_rounded, color: Colors.blueAccent, size: 20),
            hintText: 'Search conversations...',
            hintStyle: TextStyle(color: Colors.grey.shade600, fontSize: 13),
            border: InputBorder.none,
          ),
        ),
      ),
    );
  }

  Widget _buildChatTile(ChatConversation conversation) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GestureDetector(
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => ChatScreen(conversation: conversation))),
        child: GlassCard(
          padding: const EdgeInsets.all(16),
          opacity: 0.03,
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Colors.blueAccent, Color(0xFF1E293B)]),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.person_rounded, color: Colors.white, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(conversation.otherParticipantName ?? 'Customer', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                        Text(DateFormat('HH:mm').format(conversation.lastMessageAt), style: TextStyle(color: Colors.grey.shade600, fontSize: 10)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      conversation.lastMessage ?? 'No messages yet',
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
