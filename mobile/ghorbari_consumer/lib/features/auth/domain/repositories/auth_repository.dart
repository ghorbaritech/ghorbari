import 'package:ghorbari_consumer/features/auth/domain/entities/user_entity.dart';

abstract class AuthRepository {
  Future<UserEntity> signIn(String email, String password);
  Future<UserEntity> signUp(String email, String password);
  Future<void> signOut();
}
