import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_partner/features/auth/domain/repositories/auth_repository.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_event.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository authRepository;

  AuthBloc({required this.authRepository}) : super(AuthInitial()) {
    on<AuthSignInRequested>(_onSignInRequested);
    on<AuthLogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onSignInRequested(
    AuthSignInRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final partner = await authRepository.signIn(event.email, event.password);
      emit(AuthAuthenticated(partner));
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> _onLogoutRequested(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      await authRepository.signOut();
      emit(AuthUnauthenticated());
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }
}
