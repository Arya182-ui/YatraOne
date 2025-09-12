import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/main_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/bus_info_screen.dart';
import 'screens/feedback_screen.dart';
import 'screens/sos_screen.dart';
import 'screens/incident_screen.dart';
import 'screens/notification_center_screen.dart';
import 'screens/performance_screen.dart';
import 'screens/help_screen.dart';
import 'screens/settings_screen.dart';
import 'services/auth_service.dart';
import 'services/notification_service.dart';
import 'services/localization_service.dart';
import 'services/offline_service.dart';

void main() {
  runApp(const DriverApp());
}

class DriverApp extends StatelessWidget {
  const DriverApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => NotificationService()),
        ChangeNotifierProvider(create: (_) => LocalizationService()),
        ChangeNotifierProvider(create: (_) => OfflineService()),
      ],
      child: MaterialApp(
        title: 'Driver App',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: Colors.indigo,
            primary: Colors.indigo,
            secondary: Colors.amber,
            surface: Colors.white,
            error: Colors.redAccent,
            onPrimary: Colors.white,
            onSecondary: Colors.black,
            onSurface: Colors.black,
            onError: Colors.white,
            brightness: Brightness.light,
          ),
          useMaterial3: true,
          cardTheme: const CardThemeData(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(16)),
            ),
          ),
          buttonTheme: const ButtonThemeData(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(12)),
            ),
            buttonColor: Colors.indigo,
            textTheme: ButtonTextTheme.primary,
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ButtonStyle(
              backgroundColor: const WidgetStatePropertyAll(Colors.indigo),
              foregroundColor: const WidgetStatePropertyAll(Colors.white),
              shape: WidgetStatePropertyAll(
                RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              padding: const WidgetStatePropertyAll(
                EdgeInsets.symmetric(vertical: 14, horizontal: 24),
              ),
            ),
          ),
          textTheme: const TextTheme(
            headlineLarge: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.indigo),
            headlineMedium: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.indigo),
            titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
            bodyLarge: TextStyle(fontSize: 16),
            bodyMedium: TextStyle(fontSize: 14),
          ),
        ),
        darkTheme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: Colors.indigo,
            primary: Colors.indigo,
            secondary: Colors.amber,
            surface: Colors.grey[900]!,
            error: Colors.redAccent,
            onPrimary: Colors.white,
            onSecondary: Colors.black,
            onSurface: Colors.white,
            onError: Colors.white,
            brightness: Brightness.dark,
          ),
          useMaterial3: true,
          cardTheme: const CardThemeData(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(16)),
            ),
          ),
          buttonTheme: const ButtonThemeData(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(12)),
            ),
            buttonColor: Colors.indigo,
            textTheme: ButtonTextTheme.primary,
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ButtonStyle(
              backgroundColor: const WidgetStatePropertyAll(Colors.indigo),
              foregroundColor: const WidgetStatePropertyAll(Colors.white),
              shape: WidgetStatePropertyAll(
                RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              padding: const WidgetStatePropertyAll(
                EdgeInsets.symmetric(vertical: 14, horizontal: 24),
              ),
            ),
          ),
          textTheme: const TextTheme(
            headlineLarge: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.indigo),
            headlineMedium: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.indigo),
            titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
            bodyLarge: TextStyle(fontSize: 16),
            bodyMedium: TextStyle(fontSize: 14),
          ),
        ),
        initialRoute: '/login',
        onGenerateRoute: (settings) {
          switch (settings.name) {
            case '/login':
              return MaterialPageRoute(builder: (_) => const LoginScreen());
            case '/signup':
              return MaterialPageRoute(builder: (_) => const SignupScreen());
            case '/main': {
              final userId = settings.arguments as String?;
              return MaterialPageRoute(builder: (_) => MainScreen(userId: userId));
            }
            case '/profile':
              return MaterialPageRoute(builder: (_) => const ProfileScreen());
            case '/bus_info': {
              final userId = settings.arguments as String?;
              return MaterialPageRoute(builder: (_) => BusInfoScreen(userId: userId ?? ''));
            }
            case '/feedback':
              return MaterialPageRoute(builder: (_) => const FeedbackScreen());
            case '/sos':
              return MaterialPageRoute(builder: (_) => const SosScreen());
            case '/incident':
              return MaterialPageRoute(builder: (_) => const IncidentScreen());
            case '/notifications':
              return MaterialPageRoute(builder: (_) => const NotificationCenterScreen());
            case '/performance':
              return MaterialPageRoute(builder: (_) => const PerformanceScreen());
            case '/help':
              return MaterialPageRoute(builder: (_) => const HelpScreen());
            case '/settings':
              return MaterialPageRoute(builder: (_) => const SettingsScreen());
            default:
              return MaterialPageRoute(builder: (_) => const LoginScreen());
          }
        },
        locale: Provider.of<LocalizationService>(context).currentLocale,
        supportedLocales: Provider.of<LocalizationService>(context).supportedLocales,
        localizationsDelegates: Provider.of<LocalizationService>(context).delegates,
      ),
    );
  }
}
