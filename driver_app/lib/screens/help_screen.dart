import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Help & Support')),
      body: Center(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Card(
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.help_outline, size: 40, color: Theme.of(context).colorScheme.primary),
                        const SizedBox(width: 12),
                        Text('Help & Support', style: Theme.of(context).textTheme.titleLarge),
                      ],
                    ),
                    const SizedBox(height: 24),
                    const Text('Frequently Asked Questions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    const ExpansionTile(
                      leading: Icon(Icons.report, color: Colors.blue),
                      title: Text('How do I report an incident?'),
                      children: [Padding(padding: EdgeInsets.all(8.0), child: Text('Go to the Incident screen and fill out the form.'))],
                    ),
                    const ExpansionTile(
                      leading: Icon(Icons.warning, color: Colors.red),
                      title: Text('How do I send an SOS?'),
                      children: [Padding(padding: EdgeInsets.all(8.0), child: Text('Go to the SOS screen and press the Send SOS button.'))],
                    ),
                    const ExpansionTile(
                      leading: Icon(Icons.notifications, color: Colors.orange),
                      title: Text('How do I view notifications?'),
                      children: [Padding(padding: EdgeInsets.all(8.0), child: Text('Notifications are available in the Notification Center.'))],
                    ),
                    const SizedBox(height: 20),
                    const Text('Contact Support', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    ListTile(
                      leading: const Icon(Icons.email),
                      title: const Text('Email: support@yatraone.com'),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      tileColor: Colors.grey[100],
                      onTap: () async {
                        final Uri emailUri = Uri(
                          scheme: 'mailto',
                          path: 'support@yatraone.com',
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
                      leading: const Icon(Icons.phone),
                      title: const Text('Phone: +91-1234567890'),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      tileColor: Colors.grey[100],
                      onTap: () async {
                        final Uri phoneUri = Uri(
                          scheme: 'tel',
                          path: '+911234567890',
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
                    const SizedBox(height: 20),
                    const Text('Troubleshooting', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    ListTile(
                      leading: const Icon(Icons.info_outline),
                      title: const Text('If you face issues, try restarting the app or check your internet connection.'),
                      subtitle: const Text('For persistent problems, contact support.'),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      tileColor: Colors.grey[100],
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
