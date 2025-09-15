import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/notification_service.dart';

class NotificationCenterScreen extends StatefulWidget {
  const NotificationCenterScreen({super.key});

  @override
  State<NotificationCenterScreen> createState() => _NotificationCenterScreenState();
}

class _NotificationCenterScreenState extends State<NotificationCenterScreen> {
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final notificationService = Provider.of<NotificationService>(context, listen: false);
      await notificationService.fetchNotifications();
      setState(() {
        _loading = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final notificationService = Provider.of<NotificationService>(context);
    final notifications = notificationService.notifications;
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: Text('Notifications', style: Theme.of(context).textTheme.headlineMedium),
        centerTitle: true,
        elevation: 0,
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : notifications.isEmpty
                ? const Center(child: Text('No notifications'))
                : Center(
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
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Icon(Icons.notifications_active_rounded, size: 48, color: colorScheme.primary, semanticLabel: 'Notifications Icon'),
                                    const SizedBox(width: 16),
                                    Text('Notifications', style: Theme.of(context).textTheme.titleLarge),
                                  ],
                                ),
                                const SizedBox(height: 28),
                                ...notifications.map((notif) => Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                                      child: ListTile(
                                        leading: Icon(Icons.notification_important_outlined, color: colorScheme.secondary),
                                        title: Text(notif, style: Theme.of(context).textTheme.bodyLarge),
                                        tileColor: colorScheme.surfaceVariant,
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                      ),
                                    )),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
      ),
    );
  }
}
