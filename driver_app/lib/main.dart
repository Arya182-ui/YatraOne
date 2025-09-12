import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
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
import 'theme/app_theme.dart';

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
      builder: (context, child) {
        return MaterialApp(
          title: 'Driver App',
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeMode.system,
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
          localizationsDelegates: [
            ...Provider.of<LocalizationService>(context).delegates,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
        );
      },
    );
  }
}

class CounterPage extends StatefulWidget {
  const CounterPage({Key? key}) : super(key: key);

  @override
  State<CounterPage> createState() => _CounterPageState();
}

class _CounterPageState extends State<CounterPage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Counter')),
      body: Center(child: Text('$_counter')),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        child: const Icon(Icons.add),
      ),
    );
  }
}
