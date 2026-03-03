import 'package:geolocator/geolocator.dart';
import 'package:dio/dio.dart';

class LocationService {
  final Dio _dio = Dio();

  Future<String> getCurrentLocationName() async {
    try {
      bool serviceEnabled;
      LocationPermission permission;

      // Test if location services are enabled.
      serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return 'Location services are disabled.';
      }

      permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return 'Location permissions are denied';
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return 'Location permissions are permanently denied';
      }

      // Get current position
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // Reverse geocode using Nominatim
      final response = await _dio.get(
        'https://nominatim.openstreetmap.org/reverse',
        queryParameters: {
          'format': 'json',
          'lat': position.latitude,
          'lon': position.longitude,
          'zoom': 18,
          'addressdetails': 1,
        },
        options: Options(
          headers: {
            'User-Agent': 'GhorbariApp/1.0',
          },
        ),
      );

      if (response.statusCode == 200) {
        final address = response.data['address'];
        if (address != null) {
          final suburb = address['suburb'] ?? address['neighbourhood'] ?? address['road'] ?? '';
          final city = address['city'] ?? address['town'] ?? address['village'] ?? address['state_district'] ?? '';
          
          if (suburb.isNotEmpty && city.isNotEmpty) {
            return '$suburb, $city';
          } else if (city.isNotEmpty) {
            return city;
          }
        }
      }

      return 'Unknown Location';
    } catch (e) {
      print('Location Error: $e');
      return 'Error getting location';
    }
  }
}
