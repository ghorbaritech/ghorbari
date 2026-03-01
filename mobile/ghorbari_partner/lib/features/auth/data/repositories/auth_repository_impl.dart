import 'package:ghorbari_partner/features/auth/domain/entities/partner_entity.dart';
import 'package:ghorbari_partner/features/auth/domain/repositories/auth_repository.dart';
import 'package:ghorbari_partner/features/auth/data/datasources/auth_remote_data_source.dart';

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
