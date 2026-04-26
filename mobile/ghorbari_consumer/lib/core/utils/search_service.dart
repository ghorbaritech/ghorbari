import 'package:dio/dio.dart';

class SearchService {
  final Dio _dio = Dio();
  // Using the localhost or live URL? 
  // For mobile emulator, localhost is 10.0.2.2.
  // Use foundation to detect web
  final String _baseUrl = (const bool.fromEnvironment('dart.vm.product') || !const bool.hasEnvironment('dart.library.html')) 
    ? 'https://dalankotha.tech' 
    : 'http://localhost:3000';

  Future<List<Map<String, dynamic>>> getSuggestions(String query) async {
    if (query.length < 2) return [];

    try {
      final response = await _dio.get(
        '$_baseUrl/api/search/suggest',
        queryParameters: {'q': query},
      );

      if (response.statusCode == 200) {
        final List<dynamic> results = response.data['results'] ?? [];
        return List<Map<String, dynamic>>.from(results);
      }
      return [];
    } catch (e) {
      print('Search Error: $e');
      return [];
    }
  }
}
