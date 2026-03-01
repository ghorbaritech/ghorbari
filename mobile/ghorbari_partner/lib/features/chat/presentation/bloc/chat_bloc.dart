import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:ghorbari_partner/shared/models/chat.dart';
import 'package:ghorbari_partner/features/chat/data/datasources/chat_remote_data_source.dart';

// Events
abstract class ChatEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class ChatConversationsFetchRequested extends ChatEvent {
  final String userId;
  ChatConversationsFetchRequested(this.userId);
  @override
  List<Object?> get props => [userId];
}

class ChatMessagesFetchRequested extends ChatEvent {
  final String conversationId;
  ChatMessagesFetchRequested(this.conversationId);
  @override
  List<Object?> get props => [conversationId];
}

class ChatMessageSendRequested extends ChatEvent {
  final String conversationId;
  final String senderId;
  final String content;
  ChatMessageSendRequested(this.conversationId, this.senderId, this.content);
  @override
  List<Object?> get props => [conversationId, senderId, content];
}

// States
abstract class ChatState extends Equatable {
  @override
  List<Object?> get props => [];
}

class ChatInitial extends ChatState {}
class ChatLoading extends ChatState {}
class ChatConversationsLoaded extends ChatState {
  final List<ChatConversation> conversations;
  ChatConversationsLoaded(this.conversations);
  @override
  List<Object?> get props => [conversations];
}
class ChatMessagesLoaded extends ChatState {
  final List<ChatMessage> messages;
  ChatMessagesLoaded(this.messages);
  @override
  List<Object?> get props => [messages];
}
class ChatFailure extends ChatState {
  final String message;
  ChatFailure(this.message);
  @override
  List<Object?> get props => [message];
}

// Bloc
class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final ChatRemoteDataSource dataSource;

  ChatBloc(this.dataSource) : super(ChatInitial()) {
    on<ChatConversationsFetchRequested>((event, emit) async {
      emit(ChatLoading());
      try {
        final conversations = await dataSource.getConversations(event.userId);
        emit(ChatConversationsLoaded(conversations));
      } catch (e) {
        emit(ChatFailure(e.toString()));
      }
    });

    on<ChatMessagesFetchRequested>((event, emit) async {
      emit(ChatLoading());
      try {
        final messages = await dataSource.getMessages(event.conversationId);
        emit(ChatMessagesLoaded(messages));
      } catch (e) {
        emit(ChatFailure(e.toString()));
      }
    });

    on<ChatMessageSendRequested>((event, emit) async {
      try {
        await dataSource.sendMessage(event.conversationId, event.senderId, event.content);
        add(ChatMessagesFetchRequested(event.conversationId));
      } catch (e) {
        emit(ChatFailure(e.toString()));
      }
    });
  }
}
