import 'package:ghorbari_consumer/core/network/supabase_service.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as import_supabase;
import 'package:ghorbari_consumer/features/auth/data/models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<UserModel> signIn(String email, String password);
  Future<UserModel> signUp(String email, String password);
  Future<UserModel> updateProfile(String fullName, String phone);
  Future<void> signOut();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  @override
  Future<UserModel> signIn(String email, String password) async {
    final response = await SupabaseService.signIn(email, password);
    final user = response.user;
    if (user == null) {
      throw Exception('Login failed: User not found');
    }
    return UserModel(
      id: user.id,
      email: user.email ?? '',
      fullName: user.userMetadata?['full_name'],
      avatarUrl: user.userMetadata?['avatar_url'],
      phone: user.userMetadata?['phone'],
    );
  }

  @override
  Future<UserModel> signUp(String email, String password) async {
    final response = await SupabaseService.signUp(email, password);
    final user = response.user;
    if (user == null) {
      throw Exception('Sign up failed: User not created');
    }
    return UserModel(
      id: user.id,
      email: user.email ?? '',
      fullName: user.userMetadata?['full_name'],
      avatarUrl: user.userMetadata?['avatar_url'],
      phone: user.userMetadata?['phone'],
    );
  }

  @override
  Future<UserModel> updateProfile(String fullName, String phone) async {
    final response = await SupabaseService.client.auth.updateUser(
      import_supabase.UserAttributes(
        data: {
          'full_name': fullName,
          'phone': phone,
        },
      ),
    );
    final user = response.user;
    if (user == null) throw Exception('Update failed: User not found');
    return UserModel(
      id: user.id,
      email: user.email ?? '',
      fullName: user.userMetadata?['full_name'],
      avatarUrl: user.userMetadata?['avatar_url'],
      phone: user.userMetadata?['phone'],
    );
  }

  @override
  Future<void> signOut() async {
    await SupabaseService.signOut();
  }
}
