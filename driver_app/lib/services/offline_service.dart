import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class OfflineService extends ChangeNotifier {
  bool _offlineMode = false;
  bool get offlineMode => _offlineMode;
  set offlineMode(bool value) {
    if (_offlineMode != value) {
      _offlineMode = value;
      _saveOfflineMode(value);
      notifyListeners();
    }
  }

  Future<void> loadOfflineMode() async {
    final prefs = await SharedPreferences.getInstance();
    _offlineMode = prefs.getBool('offlineMode') ?? false;
    notifyListeners();
  }

  Future<void> _saveOfflineMode(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('offlineMode', value);
  }
}
