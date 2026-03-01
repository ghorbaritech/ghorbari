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

    // 1. Fetch User Profile to get Role
    final userProfile = await SupabaseService.from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    final String role = userProfile['role'] ?? 'customer';
    
    if (role == 'customer') {
      throw Exception('Login failed: Customer accounts cannot access the Partner app.');
    }

    // 2. Fetch Partner Profile from correct table
    Map<String, dynamic> partnerData;
    String type;

    if (role == 'seller') {
      partnerData = await SupabaseService.from('sellers')
          .select()
          .eq('user_id', user.id)
          .single();
      type = 'seller';
    } else {
      // For 'partner' or 'admin' (if they have a provider profile)
      partnerData = await SupabaseService.from('service_providers')
          .select()
          .eq('user_id', user.id)
          .single();
      type = 'service_provider';
    }
    
    // Ensure 'type' is in the JSON for the model
    partnerData['type'] = type;
    final profile = PartnerProfile.fromJson(partnerData);

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
