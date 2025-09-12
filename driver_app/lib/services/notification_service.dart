import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class NotificationService extends ChangeNotifier {
  bool _enabled = true;
  List<String> _notifications = [];

  bool get enabled => _enabled;
  List<String> get notifications => _notifications;

  set enabled(bool value) {
    if (_enabled != value) {
      _enabled = value;
      notifyListeners();
    }
  }

  Future<void> fetchNotifications() async {
    try {
      final response = await http.get(Uri.parse('https://yatraone-backend.onrender.com/api/notifications'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data is List) {
          _notifications = List<String>.from(data);
        } else {
          _notifications = [];
        }
        notifyListeners();
      } else {
        _notifications = [];
        notifyListeners();
      }
    } catch (e) {
      _notifications = [];
      notifyListeners();
    }
  }
}
