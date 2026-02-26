import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_consumer/core/theme/ghorbari_theme.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_event.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_state.dart';
import 'package:ghorbari_consumer/features/auth/presentation/screens/signup_screen.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/screens/home_screen.dart';
import 'dart:ui';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthAuthenticated) {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (context) => const HomeScreen()),
            (route) => false,
          );
        }
        if (state is AuthFailure) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.message), backgroundColor: Colors.red),
          );
        }
      },
      builder: (context, state) {
        return Scaffold(
          body: Stack(
            children: [
              // Background Aesthetic
              Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF2563EB), Color(0xFF1E40AF), Color(0xFF0F172A)],
                  ),
                ),
              ),
              
              SafeArea(
                child: Center(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24.0),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(30),
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                        child: Container(
                          padding: const EdgeInsets.all(32),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.9),
                            borderRadius: BorderRadius.circular(30),
                            border: Border.all(color: Colors.white.withOpacity(0.2)),
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.home_work_rounded, 
                                size: 64, color: GhorbariTheme.primaryBlue),
                              const SizedBox(height: 16),
                              const Text(
                                'Welcome to Ghorbari',
                                style: TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w900,
                                  color: GhorbariTheme.primaryDark,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Premium Construction & Design',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: GhorbariTheme.primaryDark.withOpacity(0.6),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 32),
                              TextField(
                                controller: _emailController,
                                decoration: const InputDecoration(
                                  prefixIcon: Icon(Icons.email_outlined, size: 20),
                                  hintText: 'Email Address',
                                ),
                              ),
                              const SizedBox(height: 16),
                              TextField(
                                controller: _passwordController,
                                obscureText: true,
                                decoration: const InputDecoration(
                                  prefixIcon: Icon(Icons.lock_outline_rounded, size: 20),
                                  hintText: 'Password',
                                ),
                              ),
                              const SizedBox(height: 12),
                              Align(
                                alignment: Alignment.centerRight,
                                child: TextButton(
                                  onPressed: () {},
                                  child: const Text('Forgot Password?', 
                                    style: TextStyle(fontWeight: FontWeight.bold)),
                                ),
                              ),
                              const SizedBox(height: 24),
                              ElevatedButton(
                                onPressed: state is AuthLoading 
                                  ? null 
                                  : () {
                                      context.read<AuthBloc>().add(
                                        AuthSignInRequested(
                                          _emailController.text, 
                                          _passwordController.text
                                        ),
                                      );
                                    },
                                child: state is AuthLoading 
                                  ? const SizedBox(
                                      height: 20, 
                                      width: 20, 
                                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                                    )
                                  : const Text('LOGIN'),
                              ),
                              const SizedBox(height: 24),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text('Don\'t have an account?', 
                                    style: TextStyle(color: Colors.grey.shade600)),
                                  TextButton(
                                    onPressed: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(builder: (context) => const SignUpScreen()),
                                      );
                                    },
                                    child: const Text('Sign Up', 
                                      style: TextStyle(fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
