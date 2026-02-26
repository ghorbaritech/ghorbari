import 'package:ghorbari_consumer/features/auth/domain/entities/user_entity.dart';
import 'package:ghorbari_consumer/features/auth/domain/repositories/auth_repository.dart';
import 'package:ghorbari_consumer/features/auth/data/datasources/auth_remote_data_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;

  AuthRepositoryImpl({required this.remoteDataSource});

  @override
  Future<UserEntity> signIn(String email, String password) async {
    return await remoteDataSource.signIn(email, password);
  }

  @override
  Future<UserEntity> signUp(String email, String password) async {
    return await remoteDataSource.signUp(email, password);
  }

  @override
  Future<void> signOut() async {
    await remoteDataSource.signOut();
  }
}
