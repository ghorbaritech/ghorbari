import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:ghorbari_consumer/core/network/supabase_service.dart';
import 'package:ghorbari_consumer/shared/models/service_item.dart';
import 'package:ghorbari_consumer/features/services/data/datasources/service_remote_data_source.dart';

Future<void> main() async {
  try {
    print('Starting...');
    await Supabase.initialize(
      url: 'process.env.NEXT_PUBLIC_SUPABASE_URL', // THIS WILL FAIL
      anonKey: 'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  } catch(e) {
    print('Need real env vars, let just read from .env.local');
  }
}
