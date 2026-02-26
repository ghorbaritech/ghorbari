import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:ghorbari_partner/core/network/supabase_service.dart';
import 'package:ghorbari_partner/features/auth/domain/entities/partner_entity.dart';
import 'package:ghorbari_partner/shared/models/partner_profile.dart';

abstract class AuthRemoteDataSource {
  Future<PartnerEntity> signIn(String email, String password);
  Future<void> signOut();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  @override
  Future<PartnerEntity> signIn(String email, String password) async {
    final response = await SupabaseService.signIn(email, password);
    final user = response.user;
    if (user == null) {
      throw Exception('Login failed: User not found');
    }

    // Fetch Partner Profile
    final profileResponse = await SupabaseService.from('profiles')
        .select()
        .eq('user_id', user.id)
        .single();
    
    final profile = PartnerProfile.fromJson(profileResponse);

    return PartnerEntity(
      id: user.id,
      email: user.email ?? '',
      profile: profile,
    );
  }

  @override
  Future<void> signOut() async {
    await SupabaseService.signOut();
  }
}
