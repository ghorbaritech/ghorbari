import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  static final SupabaseClient client = Supabase.instance.client;

  // Auth Operations
  static Future<AuthResponse> signIn(String email, String password) async {
    return await client.auth.signInWithPassword(email: email, password: password);
  }

  static Future<AuthResponse> signUp(String email, String password) async {
    return await client.auth.signUp(email: email, password: password);
  }

  static Future<void> signOut() async {
    await client.auth.signOut();
  }

  // Database Operations (Generic)
  static Future<List<Map<String, dynamic>>> fetchTable(String table, {String? select}) async {
    return await client.from(table).select(select ?? '*');
  }

  static SupabaseQueryBuilder from(String table) => client.from(table);
}
