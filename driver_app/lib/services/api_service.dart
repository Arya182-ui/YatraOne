
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'session_service.dart';

class ApiService {
  // Update driver online/offline status
  static Future<bool> updateDriverStatus({required String userId, required bool online}) async {
    final token = await SessionService.getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/drivers/status'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'user_id': userId, 'online': online}),
    );
    return response.statusCode == 200;
  }
  static const String baseUrl = 'https://yatraone.onrender.com';
  // Get assigned bus for a driver by userId
  static Future<Map<String, dynamic>?> getAssignedBusForUser(String userId) async {
    final token = await SessionService.getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/buses'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      final buses = jsonDecode(response.body) as List<dynamic>;
      final assigned = buses.firstWhere(
        (bus) => bus['driverId'] == userId,
        orElse: () => null,
      );
      return assigned;
    } else {
      return null;
    }
  }

  // Example: Driver signup
  static Future<http.Response> signupDriver(Map<String, dynamic> data) async {
    return await http.post(
      Uri.parse('$baseUrl/driver/signup'),
      body: data,
    );
  }

  // Example: Driver login
  static Future<http.Response> loginDriver(Map<String, dynamic> data) async {
    return await http.post(
      Uri.parse('$baseUrl/driver/login'),
      body: data,
    );
  }

  // Update bus location (integrated with backend)
  static Future<http.Response> updateLocation({
    required String busId,
    required double latitude,
    required double longitude,
    double? speed,
    String? timestamp,
    String? token,
  }) async {
    final Map<String, dynamic> body = {
      'bus_id': busId,
      'latitude': latitude,
      'longitude': longitude,
    };
    if (speed != null) body['speed'] = speed;
    if (timestamp != null) body['timestamp'] = timestamp;
    return await http.post(
      Uri.parse('$baseUrl/bus-locations-realtime/update'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );
  }

  // Example: Get assigned bus
  static Future<http.Response> getAssignedBus(String token) async {
    return await http.get(
      Uri.parse('$baseUrl/bus/driver/assigned-bus'),
      headers: {'Authorization': 'Bearer $token'},
    );
  }
}
