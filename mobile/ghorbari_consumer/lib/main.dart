import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:ghorbari_consumer/core/theme/ghorbari_theme.dart';
import 'package:ghorbari_consumer/features/auth/presentation/screens/login_screen.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ghorbari_consumer/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:ghorbari_consumer/features/auth/data/datasources/auth_remote_data_source.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/bloc/marketplace_bloc.dart';
import 'package:ghorbari_consumer/features/marketplace/data/repositories/marketplace_repository_impl.dart';
import 'package:ghorbari_consumer/features/marketplace/data/datasources/marketplace_remote_data_source.dart';
import 'package:ghorbari_consumer/features/services/presentation/bloc/service_bloc.dart';
import 'package:ghorbari_consumer/features/services/data/repositories/service_repository_impl.dart';
import 'package:ghorbari_consumer/features/services/data/datasources/service_remote_data_source.dart';
import 'package:ghorbari_consumer/features/bookings/presentation/bloc/booking_bloc.dart';
import 'package:ghorbari_consumer/features/bookings/data/repositories/booking_repository_impl.dart';
import 'package:ghorbari_consumer/features/bookings/data/datasources/booking_remote_data_source.dart';
import 'package:ghorbari_consumer/features/cart/presentation/bloc/cart_bloc.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EasyLocalization.ensureInitialized();

  // Initialize Supabase
  await Supabase.initialize(
    url: 'https://nnrzszujwhutbgghtjwc.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnrzenVqd2h1dGJnZ2h0andjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTM0MDYsImV4cCI6MjA4NDcyOTQwNn0.Wm5Rt80-9_WyDCIxQVbreNSn9BTlqfgN8HmORGZcsO4',
  );

  runApp(
    EasyLocalization(
      supportedLocales: const [Locale('en'), Locale('bn')],
      path: 'assets/translations',
      fallbackLocale: const Locale('en'),
      child: MultiRepositoryProvider(
        providers: [
          RepositoryProvider<AuthRemoteDataSource>(
            create: (context) => AuthRemoteDataSourceImpl(),
          ),
          RepositoryProvider<AuthRepositoryImpl>(
            create: (context) => AuthRepositoryImpl(
              remoteDataSource: RepositoryProvider.of<AuthRemoteDataSource>(context),
            ),
          ),
          RepositoryProvider<MarketplaceRemoteDataSource>(
            create: (context) => MarketplaceRemoteDataSourceImpl(),
          ),
          RepositoryProvider<MarketplaceRepositoryImpl>(
            create: (context) => MarketplaceRepositoryImpl(
              remoteDataSource: RepositoryProvider.of<MarketplaceRemoteDataSource>(context),
            ),
          ),
          RepositoryProvider<ServiceRemoteDataSource>(
            create: (context) => ServiceRemoteDataSourceImpl(),
          ),
          RepositoryProvider<ServiceRepositoryImpl>(
            create: (context) => ServiceRepositoryImpl(
              remoteDataSource: RepositoryProvider.of<ServiceRemoteDataSource>(context),
            ),
          ),
          RepositoryProvider<BookingRemoteDataSource>(
            create: (context) => BookingRemoteDataSourceImpl(),
          ),
          RepositoryProvider<BookingRepositoryImpl>(
            create: (context) => BookingRepositoryImpl(
              remoteDataSource: RepositoryProvider.of<BookingRemoteDataSource>(context),
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
              create: (context) => MarketplaceBloc(
                marketplaceRepository: RepositoryProvider.of<MarketplaceRepositoryImpl>(context),
              ),
            ),
            BlocProvider(
              create: (context) => ServiceBloc(
                serviceRepository: RepositoryProvider.of<ServiceRepositoryImpl>(context),
              ),
            ),
            BlocProvider(
              create: (context) => BookingBloc(
                bookingRepository: RepositoryProvider.of<BookingRepositoryImpl>(context),
              ),
            ),
            BlocProvider(
              create: (context) => CartBloc(),
            ),
          ],
          child: const GhorbariConsumerApp(),
        ),
      ),
    ),
  );
}

class GhorbariConsumerApp extends StatelessWidget {
  const GhorbariConsumerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ghorbari',
      localizationsDelegates: context.localizationDelegates,
      supportedLocales: context.supportedLocales,
      locale: context.locale,
      debugShowCheckedModeBanner: false,
      theme: GhorbariTheme.lightTheme,
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
             Icon(Icons.home_work_rounded, 
               size: 80, color: Theme.of(context).colorScheme.primary),
             const SizedBox(height: 24),
             const Text(
              'GHORBARI',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w900,
                letterSpacing: 4.0,
                color: Color(0xFF0F172A),
              ),
            ),
             const SizedBox(height: 12),
             Text(
              'QUALITY CONSTRUCTION ECOSYSTEM',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.5,
                color: Colors.grey.shade500,
              ),
            ),
             const SizedBox(height: 48),
             const CircularProgressIndicator(strokeWidth: 2),
          ],
        ),
      ),
    );
  }
}
