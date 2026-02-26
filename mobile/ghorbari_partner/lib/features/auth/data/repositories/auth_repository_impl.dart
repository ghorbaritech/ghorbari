import 'package:ghorbari_partner/features/auth/domain/entities/partner_entity.dart';

abstract class AuthRepository {
  Future<PartnerEntity> signIn(String email, String password);
  Future<void> signOut();
}

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;

  AuthRepositoryImpl({required this.remoteDataSource});

  @override
  Future<PartnerEntity> signIn(String email, String password) async {
    return await remoteDataSource.signIn(email, password);
  }

  @override
  Future<void> signOut() async {
    await remoteDataSource.signOut();
  }
}
