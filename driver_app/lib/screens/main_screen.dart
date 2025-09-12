import 'package:flutter/material.dart';
import '../services/location_service.dart';
import '../services/api_service.dart';
import 'dart:async';

import '../services/session_service.dart';
  void _logout(BuildContext context) async {
  await SessionService.clearSession();
    Navigator.pushReplacementNamed(context, '/login');
  }




class MainScreen extends StatefulWidget {
  final String? userId;
  const MainScreen({super.key, this.userId});

  @override
  State<MainScreen> createState() => _MainScreenState();
}


class _MainScreenState extends State<MainScreen> {
  bool _updating = false;
  bool _online = false;
  Timer? _timer;
  String? _status;

  Future<void> _sendLocation() async {
    if (!_online) {
      setState(() { _status = 'You are offline. Go online to update location.'; });
      return;
    }
    if (!mounted) return;
    setState(() { _status = 'Updating location...'; });
    try {
      final pos = await LocationService.getCurrentLocation();
      final userId = widget.userId;
      if (userId == null || userId.isEmpty) {
        setState(() { _status = 'User ID missing.'; });
        return;
      }
      final assignedBus = await ApiService.getAssignedBusForUser(userId);
      if (assignedBus == null) {
        setState(() { _status = 'No bus assigned.'; });
        return;
      }
      final busId = assignedBus['id'];
      final token = await SessionService.getToken();
      // Always send speed (required by backend)
      await ApiService.updateLocation(
        busId: busId,
        latitude: pos.latitude,
        longitude: pos.longitude,
        speed: pos.speed, // speed in m/s from Geolocator
        timestamp: DateTime.now().toIso8601String(),
        token: token,
      );
      if (!mounted) return;
      setState(() { _status = 'Location sent!'; });
    } catch (e) {
      if (!mounted) return;
      setState(() { _status = 'Error: $e'; });
    }
  }

  void _startUpdates() {
    if (!_online) {
      setState(() { _status = 'You are offline. Go online to start updates.'; });
      return;
    }
    if (_updating) return;
    setState(() { _updating = true; _status = 'Started auto updates.'; });
    _timer = Timer.periodic(const Duration(seconds: 15), (timer) {
      _sendLocation();
    });
  }

  void _stopUpdates() {
    setState(() { _updating = false; _status = 'Stopped auto updates.'; });
    _timer?.cancel();
  }

  Future<void> _toggleOnline(bool value) async {
    final userId = widget.userId;
    if (userId == null || userId.isEmpty) {
      setState(() { _status = 'User ID missing.'; });
      return;
    }
    setState(() { _status = value ? 'Going online...' : 'Going offline...'; });
    final success = await ApiService.updateDriverStatus(userId: userId, online: value);
    setState(() {
      _online = value && success;
      _status = _online ? 'You are online.' : 'You are offline.';
      if (!success) _status = 'Failed to update status.';
      if (!_online) _updating = false;
    });
    if (!_online) _timer?.cancel();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Driver Dashboard')),
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
                  children: [
                    Icon(Icons.dashboard, size: 48, color: Theme.of(context).colorScheme.primary),
                    const SizedBox(height: 16),
                    Text('Welcome to your Dashboard', style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Switch(
                          value: _online,
                          onChanged: (val) => _toggleOnline(val),
                          activeThumbColor: Colors.green,
                        ),
                        const SizedBox(width: 8),
                        Text(_online ? 'Online' : 'Offline', style: TextStyle(color: _online ? Colors.green : Colors.red, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _QuickAccessButton(
                          icon: Icons.person,
                          label: 'Profile',
                          onTap: () => Navigator.pushNamed(context, '/profile'),
                        ),
                        _QuickAccessButton(
                          icon: Icons.directions_bus,
                          label: 'Bus Info',
                          onTap: () => Navigator.pushNamed(context, '/bus_info', arguments: widget.userId ?? ''),
                        ),
                        _QuickAccessButton(
                          icon: Icons.feedback,
                          label: 'Feedback',
                          onTap: () => Navigator.pushNamed(context, '/feedback'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _QuickAccessButton(
                          icon: Icons.warning,
                          label: 'SOS',
                          onTap: () => Navigator.pushNamed(context, '/sos'),
                        ),
                        _QuickAccessButton(
                          icon: Icons.report,
                          label: 'Incident',
                          onTap: () => Navigator.pushNamed(context, '/incident'),
                        ),
                        _QuickAccessButton(
                          icon: Icons.notifications,
                          label: 'Notifications',
                          onTap: () => Navigator.pushNamed(context, '/notifications'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _QuickAccessButton(
                          icon: Icons.bar_chart,
                          label: 'Performance',
                          onTap: () => Navigator.pushNamed(context, '/performance'),
                        ),
                        _QuickAccessButton(
                          icon: Icons.help,
                          label: 'Help',
                          onTap: () => Navigator.pushNamed(context, '/help'),
                        ),
                        _QuickAccessButton(
                          icon: Icons.settings,
                          label: 'Settings',
                          onTap: () => Navigator.pushNamed(context, '/settings'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton.icon(
                      icon: Icon(_updating ? Icons.pause : Icons.play_arrow),
                      label: Text(_updating ? 'Stop Auto Updates' : 'Start Auto Updates'),
                      onPressed: !_online ? null : (_updating ? _stopUpdates : _startUpdates),
                      style: Theme.of(context).elevatedButtonTheme.style,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      icon: const Icon(Icons.location_on),
                      label: const Text('Manual Location Update'),
                      onPressed: !_online ? null : _sendLocation,
                      style: Theme.of(context).elevatedButtonTheme.style,
                    ),
                    const SizedBox(height: 16),
                    if (_status != null) Text(_status!, style: Theme.of(context).textTheme.bodyLarge),
                    const SizedBox(height: 32),
                    ElevatedButton.icon(
                      icon: const Icon(Icons.logout),
                      label: const Text('Logout'),
                      onPressed: () => _logout(context),
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
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

class _QuickAccessButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _QuickAccessButton({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: 90,
        height: 90,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 32, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 8),
            Text(label, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
          ],
        ),
      ),
    );
  }
}

