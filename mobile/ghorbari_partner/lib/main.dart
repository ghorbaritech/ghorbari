import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_partner/features/orders/presentation/bloc/partner_order_bloc.dart';
import 'package:ghorbari_partner/features/orders/data/repositories/partner_order_repository_impl.dart';
import 'package:ghorbari_partner/features/orders/data/datasources/partner_order_remote_data_source.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:ghorbari_partner/features/auth/presentation/screens/login_screen.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ghorbari_partner/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:ghorbari_partner/features/auth/data/datasources/auth_remote_data_source.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase
  await Supabase.initialize(
    url: 'https://nnrzszujwhutbgghtjwc.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnrzenVqd2h1dGJnZ2h0andjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTM0MDYsImV4cCI6MjA4NDcyOTQwNn0.Wm5Rt80-9_WyDCIxQVbreNSn9BTlqfgN8HmORGZcsO4',
  );

  runApp(
    MultiRepositoryProvider(
      providers: [
        RepositoryProvider<AuthRemoteDataSource>(
          create: (context) => AuthRemoteDataSourceImpl(),
        ),
        RepositoryProvider<AuthRepositoryImpl>(
          create: (context) => AuthRepositoryImpl(
            remoteDataSource: RepositoryProvider.of<AuthRemoteDataSource>(context),
          ),
        ),
        RepositoryProvider<PartnerOrderRemoteDataSource>(
          create: (context) => PartnerOrderRemoteDataSourceImpl(),
        ),
        RepositoryProvider<PartnerOrderRepositoryImpl>(
          create: (context) => PartnerOrderRepositoryImpl(
            remoteDataSource: RepositoryProvider.of<PartnerOrderRemoteDataSource>(context),
          ),
        ),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (context) => AuthBloc(
              authRepository: RepositoryProvider.of<AuthRepositoryImpl>(context),
            ),
          ),
          BlocProvider(
            create: (context) => PartnerOrderBloc(
              repository: RepositoryProvider.of<PartnerOrderRepositoryImpl>(context),
            ),
          ),
        ],
        child: const GhorbariPartnerApp(),
      ),
    ),
  );
}

class GhorbariPartnerApp extends StatelessWidget {
  const GhorbariPartnerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ghorbari Partner',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: Colors.blueAccent,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        fontFamily: 'Inter',
      ),
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigate();
  }

  _navigate() async {
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
             Icon(Icons.business_center_rounded, 
               size: 80, color: Colors.blueAccent),
             const SizedBox(height: 24),
             const Text(
              'PARTER PANEL',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w900,
                letterSpacing: 4.0,
                color: Colors.white,
              ),
            ),
             const SizedBox(height: 12),
             Text(
              'GHORBARI BUSINESS ECOSYSTEM',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.5,
                color: Colors.grey.shade500,
              ),
            ),
             const SizedBox(height: 48),
             const CircularProgressIndicator(color: Colors.blueAccent, strokeWidth: 2),
          ],
        ),
      ),
    );
  }
}
