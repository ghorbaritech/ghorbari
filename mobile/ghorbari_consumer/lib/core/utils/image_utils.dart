import 'package:Dalankotha_consumer/core/config/app_config.dart';

class ImageUtils {
  static const String _storagePrefix = '/storage/v1/object/public/';
  static const String _webBaseUrl = 'https://ghorbari.tech'; // Primary host for static assets

  /// Resolves a path into a full URL for Supabase storage, ghorbari.tech, or external images.
  static String resolveUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    
    // 1. If it's already a full URL, return it
    if (path.startsWith('http')) {
      // Ensure we don't accidentally use dalankotha.tech if it's known to be 404ing for legacy paths
      if (path.contains('dalankotha.tech/images/')) {
        return path.replaceFirst('dalankotha.tech', 'ghorbari.tech');
      }
      return path;
    }
    
    // 2. Handle ghorbari.tech web images (usually starts with /images/ or images/)
    if (path.startsWith('/images/') || path.startsWith('images/')) {
      String cleanPath = path.startsWith('/') ? path : '/$path';
      return '$_webBaseUrl$cleanPath';
    }
    
    // 3. Normalize path and handle Supabase storage prefixes
    String cleanPath = path;
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    
    // If path already contains the storage prefix, just prepend the base URL
    if (path.contains(_storagePrefix)) {
      return '${AppConfig.supabaseUrl}$path';
    }

    // Special case: if path looks like a storage path but missing prefix (e.g. 'banners/...')
    // Usually CMS paths are relative to the public bucket
    return '${AppConfig.supabaseUrl}$_storagePrefix$cleanPath';
  }
}
