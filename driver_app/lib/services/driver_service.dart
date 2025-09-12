import 'package:http/http.dart' as http;
import 'dart:convert';
import 'session_service.dart';

class DriverService {
  static const String baseUrl = 'https://yatraone.onrender.com'; 

  static Future<Map<String, dynamic>> getProfile(String userId) async {
    final token = await SessionService.getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/users/$userId/profile'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to fetch profile: \\${response.body}');
    }
  }

  static Future<Map<String, dynamic>?> getAssignedBus(String userId) async {
    final token = await SessionService.getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/buses'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      final buses = json.decode(response.body) as List<dynamic>;
      final assigned = buses.firstWhere(
        (bus) => bus['driverId'] == userId,
        orElse: () => null,
      );
      return assigned;
    } else {
      throw Exception('Failed to fetch assigned bus: \\${response.body}');
    }
  }
}
