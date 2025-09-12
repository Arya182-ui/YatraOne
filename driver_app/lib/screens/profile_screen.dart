
import 'package:flutter/material.dart';
import '../services/driver_service.dart';
import '../services/session_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _profile;
  String? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    setState(() { _loading = true; _error = null; });
    try {
      final userId = await SessionService.getUserId();
      if (userId == null || userId.isEmpty) {
        setState(() { _error = 'User ID not found.'; });
        return;
      }
      final res = await DriverService.getProfile(userId);
      setState(() { _profile = res; });
    } catch (e) {
      setState(() { _error = e.toString(); });
    } finally {
      setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Driver Profile')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
              : _profile == null
                  ? const Center(child: Text('No profile data'))
                  : Center(
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
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Icon(Icons.person, size: 48, color: Theme.of(context).colorScheme.primary),
                                      const SizedBox(width: 16),
                                      Text(_profile!['name'] ?? '', style: Theme.of(context).textTheme.headlineMedium),
                                    ],
                                  ),
                                  const SizedBox(height: 24),
                                  ListTile(
                                    leading: const Icon(Icons.email),
                                    title: Text(_profile!['email'] ?? ''),
                                  ),
                                  ListTile(
                                    leading: const Icon(Icons.phone),
                                    title: Text(_profile!['phone'] ?? ''),
                                  ),
                                  ListTile(
                                    leading: Icon(_profile!['approved'] == true ? Icons.check_circle : Icons.cancel, color: _profile!['approved'] == true ? Colors.green : Colors.red),
                                    title: Text('Approved: ${_profile!['approved'] == true ? 'Yes' : 'No'}'),
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
