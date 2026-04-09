import 'package:dio/dio.dart';

class LocationService {
  final Dio _dio = Dio();

  Future<String> getCurrentLocationName() async {
    // Stubbed for web unblocking due to path space issue with native assets
    return 'Dhaka, Bangladesh';
  }
}
