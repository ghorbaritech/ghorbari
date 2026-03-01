import 'package:ghorbari_partner/features/auth/domain/entities/partner_entity.dart';

abstract class AuthRepository {
  Future<PartnerEntity> signIn(String email, String password);
  Future<void> signOut();
}
