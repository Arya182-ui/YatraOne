import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: Text('Help & Support', style: Theme.of(context).textTheme.headlineMedium),
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
                        Icon(Icons.help_outline_rounded, size: 48, color: colorScheme.primary, semanticLabel: 'Help Icon'),
                        const SizedBox(width: 16),
                        Text('Help & Support', style: Theme.of(context).textTheme.titleLarge),
                      ],
                    ),
                    const SizedBox(height: 28),
                    Text('Frequently Asked Questions', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    const ExpansionTile(
                      leading: Icon(Icons.report_outlined, color: Colors.blue),
                      title: Text('How do I report an incident?'),
                      children: [Padding(padding: EdgeInsets.all(8.0), child: Text('Go to the Incident screen and fill out the form.'))],
                    ),
                    const ExpansionTile(
                      leading: Icon(Icons.warning_amber_rounded, color: Colors.red),
                      title: Text('How do I send an SOS?'),
                      children: [Padding(padding: EdgeInsets.all(8.0), child: Text('Go to the SOS screen and press the Send SOS button.'))],
                    ),
                    const ExpansionTile(
                      leading: Icon(Icons.notifications_active_rounded, color: Colors.orange),
                      title: Text('How do I view notifications?'),
                      children: [Padding(padding: EdgeInsets.all(8.0), child: Text('Notifications are available in the Notification Center.'))],
                    ),
                    const SizedBox(height: 24),
                    Text('Contact Support', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    ListTile(
                      leading: const Icon(Icons.email_outlined),
                      title: const Text('Email: arya119000@gmail.com'),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      tileColor: colorScheme.surfaceVariant,
                      onTap: () async {
                        final Uri emailUri = Uri(
                          scheme: 'mailto',
                          path: 'arya119000@gmail.com',
                        );
                        if (await canLaunchUrl(emailUri)) {
                          await launchUrl(emailUri);
                        } else {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not launch email app.')));
                          }
                        }
                      },
                    ),
                    ListTile(
                      leading: const Icon(Icons.phone_outlined),
                      title: const Text('Phone: 9258728706'),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      tileColor: colorScheme.surfaceVariant,
                      onTap: () async {
                        final Uri phoneUri = Uri(
                          scheme: 'tel',
                          path: '9258728706',
                        );
                        if (await canLaunchUrl(phoneUri)) {
                          await launchUrl(phoneUri);
                        } else {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not launch dialer.')));
                          }
                        }
                      },
                    ),
                    const SizedBox(height: 24),
                    Text('Troubleshooting', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    ListTile(
                      leading: const Icon(Icons.info_outline_rounded),
                      title: const Text('If you face issues, try restarting the app or check your internet connection.'),
                      subtitle: const Text('For persistent problems, contact support.'),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      tileColor: colorScheme.surfaceVariant,
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
