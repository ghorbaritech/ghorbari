import 'package:supabase_flutter/supabase_flutter.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();
  
  bool _isInitialized = false;

  Future<void> init() async {
    if (_isInitialized) return;
    print("Notification Service Initialized (Mock)");
    _isInitialized = true;
  }

  void listenToNotifications(String userId) {
    print("Listening to notifications for user: $userId (Mock)");
    Supabase.instance.client
        .from('notifications')
        .stream(primaryKey: ['id'])
        .eq('user_id', userId)
        .listen((List<Map<String, dynamic>> data) {
          if (data.isNotEmpty) {
            final latest = data.last;
            if (latest['is_read'] == false) {
               print("New notification: ${latest['title']}");
            }
          }
        });
  }
}
