import 'package:flutter/material.dart';

class LocalizationService extends ChangeNotifier {
  Locale _currentLocale = const Locale('en');
  List<Locale> supportedLocales = [const Locale('en'), const Locale('hi')];
  List<LocalizationsDelegate> delegates = [];

  Locale get currentLocale => _currentLocale;
  set currentLocale(Locale locale) {
    if (_currentLocale != locale) {
      _currentLocale = locale;
      notifyListeners();
    }
  }
  // Add localization logic here
}
