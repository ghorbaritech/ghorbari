import 'package:supabase_flutter/supabase_flutter.dart';

class BrandingService {
  static final BrandingService _instance = BrandingService._internal();
  factory BrandingService() => _instance;
  BrandingService._internal();

  final _supabase = Supabase.instance.client;
  
  String? _logoLightUrl;
  String? _logoDarkUrl;

  String? get logoLightUrl => _logoLightUrl;
  String? get logoDarkUrl => _logoDarkUrl;

  Future<void> fetchBranding() async {
    try {
      final data = await _supabase
          .from('branding_settings')
          .select('logo_light_url, logo_dark_url')
          .eq('id', 1)
          .single();
      
      _logoLightUrl = data['logo_light_url'];
      _logoDarkUrl = data['logo_dark_url'];
    } catch (e) {
      // Fallback silently
      print('Error fetching branding: $e');
    }
  }
}
