import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:ghorbari_partner/features/orders/presentation/bloc/partner_order_bloc.dart';
import 'package:ghorbari_partner/features/orders/data/repositories/partner_order_repository_impl.dart';
import 'package:ghorbari_partner/features/orders/data/datasources/partner_order_remote_data_source.dart';
import 'package:ghorbari_partner/features/inventory/data/datasources/product_remote_data_source.dart';
import 'package:ghorbari_partner/features/inventory/presentation/bloc/inventory_bloc.dart';
import 'package:ghorbari_partner/features/chat/data/datasources/chat_remote_data_source.dart';
import 'package:ghorbari_partner/features/chat/presentation/bloc/chat_bloc.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:ghorbari_partner/features/auth/presentation/screens/login_screen.dart';
import 'package:ghorbari_partner/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ghorbari_partner/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:ghorbari_partner/features/auth/data/datasources/auth_remote_data_source.dart';

import 'package:ghorbari_partner/core/services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Notifications
  await NotificationService().init();

  // Initialize Supabase
  await Supabase.initialize(
    url: 'https://nnrzszujwhutbgghtjwc.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnpzenVqd2h1dGJnZ2h0andjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTM0MDYsImV4cCI6MjA4NDcyOTQwNn0.Wm5Rt80-9_WyDCIxQVbreNSn9BTlqfgN8HmORGZcsO4',
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
        RepositoryProvider<ProductRemoteDataSource>(
          create: (context) => ProductRemoteDataSourceImpl(),
        ),
        RepositoryProvider<ChatRemoteDataSource>(
          create: (context) => ChatRemoteDataSourceImpl(),
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
          BlocProvider(
            create: (context) => InventoryBloc(
              RepositoryProvider.of<ProductRemoteDataSource>(context),
            ),
          ),
          BlocProvider(
            create: (context) => ChatBloc(
              RepositoryProvider.of<ChatRemoteDataSource>(context),
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
        useMaterial3: true,
        brightness: Brightness.light,
        primaryColor: const Color(0xFF003366),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        textTheme: GoogleFonts.outfitTextTheme(),
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF003366),
          elevation: 0,
          titleTextStyle: GoogleFonts.outfit(
            color: const Color(0xFF003366),
            fontSize: 20,
            fontWeight: FontWeight.w900,
          ),
        ),
        cardTheme: CardThemeData(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
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
      backgroundColor: const Color(0xFF0F172A),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Branding(size: 200),
            const SizedBox(height: 48),
            const CircularProgressIndicator(
              color: Colors.blueAccent,
              strokeWidth: 2,
            ),
          ],
        ),
      ),
    );
  }
}

class Branding extends StatelessWidget {
  final double size;
  final bool showText;
  const Branding({super.key, this.size = 60, this.showText = true});

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/images/logo.png',
      width: size,
      fit: BoxFit.contain,
    );
  }
}
