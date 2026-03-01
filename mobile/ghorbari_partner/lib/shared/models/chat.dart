import 'package:equatable/equatable.dart';

class ChatConversation extends Equatable {
  final String id;
  final String participant1Id;
  final String participant2Id;
  final String? otherParticipantName;
  final String? lastMessage;
  final DateTime lastMessageAt;

  const ChatConversation({
    required this.id,
    required this.participant1Id,
    required this.participant2Id,
    this.otherParticipantName,
    this.lastMessage,
    required this.lastMessageAt,
  });

  factory ChatConversation.fromJson(Map<String, dynamic> json, String currentUserId) {
    // Determine the other participant
    final String otherId = (json['participant_1_id'] == currentUserId) 
        ? json['participant_2_id'] 
        : json['participant_1_id'];
    
    // In a real app, we'd join with profiles, but for now we'll mock the name or use ID
    final otherProfile = (json['participant_1_id'] == currentUserId) ? json['p2'] : json['p1'];
    final otherName = otherProfile?['full_name'] ?? 'Customer';

    // Handle last_message which can be a Map or an empty List from the join
    Map<String, dynamic>? lastMsg;
    if (json['last_message'] is Map) {
      lastMsg = json['last_message'] as Map<String, dynamic>;
    } else if (json['last_message'] is List && (json['last_message'] as List).isNotEmpty) {
      lastMsg = (json['last_message'] as List).first as Map<String, dynamic>;
    }

    return ChatConversation(
      id: json['id'],
      participant1Id: json['participant_1_id'],
      participant2Id: json['participant_2_id'],
      otherParticipantName: otherName,
      lastMessage: lastMsg?['content'],
      lastMessageAt: DateTime.parse(lastMsg?['created_at'] ?? json['created_at']),
    );
  }

  @override
  List<Object?> get props => [id, participant1Id, participant2Id, otherParticipantName, lastMessage, lastMessageAt];
}

class ChatMessage extends Equatable {
  final String id;
  final String conversationId;
  final String senderId;
  final String content;
  final DateTime createdAt;
  final bool isRead;

  const ChatMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.content,
    required this.createdAt,
    this.isRead = false,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'],
      conversationId: json['conversation_id'],
      senderId: json['sender_id'],
      content: json['content'],
      createdAt: DateTime.parse(json['created_at']),
      isRead: json['is_read'] ?? false,
    );
  }

  @override
  List<Object?> get props => [id, conversationId, senderId, content, createdAt, isRead];
}
