import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:Dalankotha_partner/features/orders/presentation/bloc/partner_order_bloc.dart';
import 'package:Dalankotha_partner/features/orders/data/repositories/partner_order_repository_impl.dart';
import 'package:Dalankotha_partner/features/orders/data/datasources/partner_order_remote_data_source.dart';
import 'package:Dalankotha_partner/features/inventory/data/datasources/product_remote_data_source.dart';
import 'package:Dalankotha_partner/features/inventory/presentation/bloc/inventory_bloc.dart';
import 'package:Dalankotha_partner/features/chat/data/datasources/chat_remote_data_source.dart';
import 'package:Dalankotha_partner/features/chat/presentation/bloc/chat_bloc.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:Dalankotha_partner/core/theme/Dalankotha_theme.dart';
import 'package:Dalankotha_partner/shared/widgets/branding_widget.dart';
import 'package:Dalankotha_partner/features/auth/presentation/screens/login_screen.dart';
import 'package:Dalankotha_partner/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:Dalankotha_partner/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:Dalankotha_partner/features/auth/data/datasources/auth_remote_data_source.dart';

import 'package:Dalankotha_partner/core/config/app_config.dart';
import 'package:Dalankotha_partner/core/utils/logger.dart';
import 'package:Dalankotha_partner/core/services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Notifications
  await NotificationService().init();

  // Initialize Supabase
  try {
    await Supabase.initialize(
      url: AppConfig.supabaseUrl,
      anonKey: AppConfig.supabaseAnonKey,
    );
    AppLogger.i('Supabase Initialized');
  } catch (e, stack) {
    AppLogger.e('Supabase Init Failed', e, stack);
  }

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
        child: const DalankothaPartnerApp(),
      ),
    ),
  );
}

class DalankothaPartnerApp extends StatelessWidget {
  const DalankothaPartnerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dalankotha Partner',
      debugShowCheckedModeBanner: false,
      theme: DalankothaTheme.lightTheme,
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
    final currentUser = Supabase.instance.client.auth.currentUser;
    if (currentUser != null) {
      AppLogger.i('Partner: user already authenticated, immediate app bounce');
      if (mounted) {
        // Assume LoginScreen routes to proper dashboard if initialized, or we can just send them there for now until Dashboard is wired.
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const LoginScreen()),
        );
      }
      return;
    }

    AppLogger.d('SplashScreen navigate started');
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
    return const Scaffold(
      backgroundColor: Color(0xFF0F172A),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            BrandingWidget(size: 150, showText: false),
            SizedBox(height: 48),
            CircularProgressIndicator(
              color: Color(0xFF2563EB),
              strokeWidth: 2,
            ),
          ],
        ),
      ),
    );
  }
}

