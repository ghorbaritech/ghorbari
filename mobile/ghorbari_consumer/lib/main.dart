import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'dart:ui';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:Dalankotha_consumer/core/config/app_config.dart';
import 'package:Dalankotha_consumer/core/utils/logger.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:Dalankotha_consumer/core/theme/Dalankotha_theme.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/screens/home_screen.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/screens/main_screen.dart';
import 'package:Dalankotha_consumer/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:Dalankotha_consumer/shared/widgets/branding_widget.dart';
import 'package:Dalankotha_consumer/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:Dalankotha_consumer/features/auth/data/datasources/auth_remote_data_source.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/bloc/marketplace_bloc.dart';
import 'package:Dalankotha_consumer/features/marketplace/data/repositories/marketplace_repository_impl.dart';
import 'package:Dalankotha_consumer/features/marketplace/data/datasources/marketplace_remote_data_source.dart';
import 'package:Dalankotha_consumer/features/services/presentation/bloc/service_bloc.dart';
import 'package:Dalankotha_consumer/features/services/data/repositories/service_repository_impl.dart';
import 'package:Dalankotha_consumer/features/services/data/datasources/service_remote_data_source.dart';
import 'package:Dalankotha_consumer/features/bookings/presentation/bloc/booking_bloc.dart';
import 'package:Dalankotha_consumer/features/bookings/data/repositories/booking_repository_impl.dart';
import 'package:Dalankotha_consumer/features/bookings/data/datasources/booking_remote_data_source.dart';
import 'package:Dalankotha_consumer/features/cart/presentation/bloc/cart_bloc.dart';

void main() async {
  AppLogger.i('Initializing application...');
  WidgetsFlutterBinding.ensureInitialized();
  await EasyLocalization.ensureInitialized();

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
    EasyLocalization(
      supportedLocales: const [Locale('en'), Locale('bn')],
      path: 'translations',
      fallbackLocale: const Locale('en'),
      startLocale: const Locale('bn'), // Default to Bangla
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
          child: const DalankothaConsumerApp(),
        ),
      ),
    ),
  );
}

class AppScrollBehavior extends MaterialScrollBehavior {
  @override
  Set<PointerDeviceKind> get dragDevices => {
        PointerDeviceKind.touch,
        PointerDeviceKind.mouse,
        PointerDeviceKind.trackpad,
      };
}

class DalankothaConsumerApp extends StatelessWidget {
  const DalankothaConsumerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dalankotha',
      localizationsDelegates: context.localizationDelegates,
      supportedLocales: context.supportedLocales,
      locale: context.locale,
      debugShowCheckedModeBanner: false,
      scrollBehavior: AppScrollBehavior(),
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
    final session = Supabase.instance.client.auth.currentSession;
    if (session != null) {
      AppLogger.i('Consumer: user already authenticated, immediate main screen bounce');
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const MainScreen()),
        );
      }
      return;
    }

    AppLogger.d('SplashScreen navigate started');
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      AppLogger.d('SplashScreen pushing MainScreen as guest');
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const MainScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: BrandingWidget(size: 120),
      ),
    );
  }
}
