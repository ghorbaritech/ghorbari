import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:ghorbari_partner/core/network/supabase_service.dart';
import 'package:ghorbari_partner/shared/models/chat.dart';

abstract class ChatRemoteDataSource {
  Future<List<ChatConversation>> getConversations(String currentUserId);
  Future<List<ChatMessage>> getMessages(String conversationId);
  Future<ChatMessage> sendMessage(String conversationId, String senderId, String content);
}

class ChatRemoteDataSourceImpl implements ChatRemoteDataSource {
  @override
  Future<List<ChatConversation>> getConversations(String currentUserId) async {
    // Fetch conversations where user is participant 1 or 2
    // We join with profiles for the other participant
    final response = await SupabaseService.from('conversations')
        .select('''
          *,
          p1:profiles!participant_1_id(full_name, avatar_url),
          p2:profiles!participant_2_id(full_name, avatar_url),
          last_message:messages(content, created_at)
        ''')
        .or('participant_1_id.eq.$currentUserId,participant_2_id.eq.$currentUserId')
        .order('created_at', ascending: false);
    
    // Sort and map
    final List data = response as List;
    return data.map((json) {
      // Manual sorting of messages to get the 'last' one if multiple joined (select limit not easy here)
      final List messages = json['last_message'] as List? ?? [];
      if (messages.isNotEmpty) {
        messages.sort((a, b) => b['created_at'].compareTo(a['created_at']));
        json['last_message'] = messages.first;
      }
      return ChatConversation.fromJson(json, currentUserId);
    }).toList();
  }

  @override
  Future<List<ChatMessage>> getMessages(String conversationId) async {
    final response = await SupabaseService.from('messages')
        .select()
        .eq('conversation_id', conversationId)
        .order('created_at', ascending: true);
    
    return (response as List).map((json) => ChatMessage.fromJson(json)).toList();
  }

  @override
  Future<ChatMessage> sendMessage(String conversationId, String senderId, String content) async {
    final response = await SupabaseService.from('messages')
        .insert({
          'conversation_id': conversationId,
          'sender_id': senderId,
          'content': content,
        })
        .select()
        .single();
    
    return ChatMessage.fromJson(response);
  }
}
