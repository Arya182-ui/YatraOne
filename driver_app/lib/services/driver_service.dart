import 'package:http/http.dart' as http;
import 'dart:convert';
import 'session_service.dart';

class DriverService {
  static Future<List<Map<String, dynamic>>> getActivityLog(String userId) async {
    final token = await SessionService.getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/users/$userId/activity-log'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data is List) {
        return List<Map<String, dynamic>>.from(data);
      } else {
        throw Exception('Unexpected activity log format');
      }
    } else {
      throw Exception('Failed to fetch activity log: \\${response.body}');
    }
  }
  static Future<void> updateDetails(String userId, Map<String, dynamic> details) async {
    final token = await SessionService.getToken();
    final response = await http.patch(
      Uri.parse('$baseUrl/users/$userId/details'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: json.encode(details),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to update details: \\${response.body}');
    }
  }
  static Future<void> updatePhone(String userId, String phone) async {
    final token = await SessionService.getToken();
    final response = await http.patch(
      Uri.parse('$baseUrl/users/$userId/phone'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: json.encode({'phone': phone}),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to update phone: \\${response.body}');
    }
  }
  static Future<void> updateProfile(String userId, Map<String, dynamic> data) async {
    final token = await SessionService.getToken();
    final response = await http.patch(
      Uri.parse('$baseUrl/users/$userId/profile'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: json.encode(data),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to update profile: \\${response.body}');
    }
  }
  static const String baseUrl = 'https://yatraone-backend.onrender.com/api'; 

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
