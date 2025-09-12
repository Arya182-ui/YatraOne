import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/notification_service.dart';
import '../services/localization_service.dart';
import '../services/offline_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  @override
  Widget build(BuildContext context) {
    final notificationService = Provider.of<NotificationService>(context);
    final localizationService = Provider.of<LocalizationService>(context);
    final offlineService = Provider.of<OfflineService>(context);

    double textScale = MediaQuery.of(context).textScaler.scale(1.0);
    Locale currentLocale = localizationService.currentLocale;
    bool notificationsEnabled = notificationService.enabled;
    bool offlineMode = offlineService.offlineMode;
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Text('Settings', style: Theme.of(context).textTheme.headlineMedium),
        centerTitle: true,
        elevation: 0,
      ),
      body: Center(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Card(
              elevation: 3,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.settings, size: 48, color: colorScheme.primary, semanticLabel: 'Settings Icon'),
                        const SizedBox(width: 16),
                        Text('Settings', style: Theme.of(context).textTheme.titleLarge),
                      ],
                    ),
                    const SizedBox(height: 28),
                    SwitchListTile(
                      title: const Text('Enable Notifications'),
                      value: notificationsEnabled,
                      onChanged: (val) {
                        notificationService.enabled = val;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(val ? 'Notifications enabled' : 'Notifications disabled')),
                        );
                      },
                      secondary: const Icon(Icons.notifications_active_outlined),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      tileColor: colorScheme.surfaceVariant,
                    ),
                    const Divider(),
                    SwitchListTile(
                      title: const Text('Offline Mode'),
                      value: offlineMode,
                      onChanged: (val) {
                        offlineService.offlineMode = val;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(val ? 'Offline mode enabled' : 'Offline mode disabled')),
                        );
                      },
                      secondary: const Icon(Icons.cloud_off_outlined),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      tileColor: colorScheme.surfaceVariant,
                    ),
                    const Divider(),
                    ListTile(
                      leading: const Icon(Icons.text_fields_rounded),
                      title: const Text('Text Size'),
                      subtitle: Text('Current: ${textScale.toStringAsFixed(1)}x'),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      tileColor: colorScheme.surfaceVariant,
                      onTap: () {
                        showDialog(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text('Adjust Text Size'),
                            content: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                ListTile(
                                  title: const Text('Small'),
                                  onTap: () {
                                    MediaQuery.of(context).textScaler.scale(0.8);
                                    Navigator.pop(ctx);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Text size set to Small')),
                                    );
                                  },
                                ),
                                ListTile(
                                  title: const Text('Normal'),
                                  onTap: () {
                                    MediaQuery.of(context).textScaler.scale(1.0);
                                    Navigator.pop(ctx);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Text size set to Normal')),
                                    );
                                  },
                                ),
                                ListTile(
                                  title: const Text('Large'),
                                  onTap: () {
                                    MediaQuery.of(context).textScaler.scale(1.2);
                                    Navigator.pop(ctx);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Text size set to Large')),
                                    );
                                  },
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                    const Divider(),
                    ListTile(
                      leading: const Icon(Icons.language_rounded),
                      title: const Text('Language'),
                      subtitle: Text(currentLocale.languageCode == 'en' ? 'English' : 'Hindi'),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      tileColor: colorScheme.surfaceVariant,
                      onTap: () {
                        showDialog(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: const Text('Select Language'),
                            content: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                ListTile(
                                  title: const Text('English'),
                                  onTap: () {
                                    localizationService.currentLocale = const Locale('en');
                                    Navigator.pop(context);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Language set to English')),
                                    );
                                  },
                                ),
                                ListTile(
                                  title: const Text('Hindi'),
                                  onTap: () {
                                    localizationService.currentLocale = const Locale('hi');
                                    Navigator.pop(context);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Language set to Hindi')),
                                    );
                                  },
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
