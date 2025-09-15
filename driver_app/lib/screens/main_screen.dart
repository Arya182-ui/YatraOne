import 'package:flutter/material.dart';
import '../services/location_service.dart';
import 'package:geolocator/geolocator.dart';
import '../services/api_service.dart';
import '../services/driver_location_ws_service.dart';
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
  String? _currentBusId;
  bool _updating = false;
  bool _online = false;
  StreamSubscription<Position>? _locationSubscription;
  String? _status;
  DriverLocationWebSocketService? _wsService;
  // String? _currentBusId; // removed unused field
  String? _currentDriverId;
  List<Map<String, dynamic>> _pendingLocations = [];
  bool _wsConnected = false;

  Future<void> _sendLocation() async {
    if (!_online) {
      setState(() { _status = 'You are offline. Go online to update location.'; });
      return;
    }
    if (!mounted) return;
    setState(() { _status = 'Updating location...'; });
    try {
      final pos = await LocationService.getCurrentLocation().timeout(const Duration(seconds: 10), onTimeout: () => throw Exception('Location timeout'));
      final userId = widget.userId;
      if (userId == null || userId.isEmpty) {
        setState(() { _status = 'User ID missing.'; });
        return;
      }
      final assignedBus = await ApiService.getAssignedBusForUser(userId).timeout(const Duration(seconds: 10), onTimeout: () => null);
      if (assignedBus == null) {
        setState(() { _status = 'No bus assigned or request timed out.'; });
        return;
      }
      final busId = assignedBus['id'];
      _currentBusId = busId;
      _currentDriverId = userId;
      final data = {
        'latitude': pos.latitude,
        'longitude': pos.longitude,
        'speed': pos.speed,
        'driver_id': userId,
        'timestamp': DateTime.now().toIso8601String(),
      };
      if (_wsService != null && _wsConnected) {
        _wsService!.sendLocation(
          latitude: pos.latitude,
          longitude: pos.longitude,
          speed: pos.speed,
          driverId: userId,
          timestamp: data['timestamp'] as String?,
        );
        setState(() { _status = 'Location sent (ws)!'; });
      } else {
        _pendingLocations.add(data);
        setState(() { _status = 'No connection. Location buffered.'; });
      }
    } on TimeoutException catch (_) {
      if (!mounted) return;
      setState(() { _status = 'Error: Operation timed out. Please check your network or GPS.'; });
    } catch (e) {
      if (!mounted) return;
      setState(() { _status = 'Error: $e'; });
    }
  }

  void _startUpdates() async {
    if (!_online) {
      setState(() { _status = 'You are offline. Go online to start updates.'; });
      return;
    }
    if (_updating) return;
    setState(() { _updating = true; _status = 'Started auto updates.'; });
    final userId = widget.userId;
    if (userId == null || userId.isEmpty) {
      setState(() { _status = 'User ID missing.'; });
      return;
    }
    try {
      final assignedBus = await ApiService.getAssignedBusForUser(userId).timeout(const Duration(seconds: 10), onTimeout: () => null);
      if (assignedBus == null) {
        setState(() { _status = 'No bus assigned or request timed out.'; });
        return;
      }
      final busId = assignedBus['id'];
      _currentBusId = busId;
      _currentDriverId = userId;
      _wsService = DriverLocationWebSocketService();
      _wsService!.connect(busId, onConnected: () {
        setState(() { _wsConnected = true; _status = 'WebSocket connected.'; });
        // Send any buffered locations
        for (final data in _pendingLocations) {
          _wsService!.sendLocation(
            latitude: data['latitude'],
            longitude: data['longitude'],
            speed: data['speed'],
            driverId: data['driver_id'],
            timestamp: data['timestamp'] as String?,
          );
        }
        _pendingLocations.clear();
      }, onError: (e) {
        setState(() { _wsConnected = false; _status = 'WebSocket error: $e'; });
      });
      _locationSubscription = LocationService.getLocationStream(distanceFilterMeters: 10)
          .listen((pos) async {
        final data = {
          'latitude': pos.latitude,
          'longitude': pos.longitude,
          'speed': pos.speed,
          'driver_id': _currentDriverId,
          'timestamp': DateTime.now().toIso8601String(),
        };
        if (_wsService != null && _wsConnected) {
          _wsService!.sendLocation(
            latitude: pos.latitude,
            longitude: pos.longitude,
            speed: pos.speed,
            driverId: _currentDriverId ?? '',
            timestamp: data['timestamp'] as String?,
          );
          setState(() { _status = 'Location sent (ws, auto)!'; });
        } else {
          _pendingLocations.add(data);
          setState(() { _status = 'No connection. Location buffered.'; });
        }
      },
      onError: (e) {
        if (!mounted) return;
        setState(() { _status = 'Location stream error: $e'; });
      });
    } on TimeoutException catch (_) {
      setState(() { _status = 'Error: Operation timed out. Please check your network.'; });
    } catch (e) {
      setState(() { _status = 'Error: $e'; });
    }
  }

  void _stopUpdates() {
    setState(() { _updating = false; _status = 'Stopped auto updates.'; });
    _locationSubscription?.cancel();
    _locationSubscription = null;
    _wsService?.disconnect();
    _wsService = null;
    _wsConnected = false;
    _currentBusId = null;
    _currentDriverId = null;
    _pendingLocations.clear();
  }

  // (removed duplicate _toggleOnline)

  // (removed duplicate dispose)

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
  if (!_online) _stopUpdates();
  }

  @override
  void dispose() {
    _locationSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Driver Dashboard', style: Theme.of(context).textTheme.headlineMedium),
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
                    Icon(Icons.dashboard, size: 56, color: Theme.of(context).colorScheme.primary, semanticLabel: 'Dashboard Icon'),
                    const SizedBox(height: 20),
                    Text('Welcome to your Dashboard', style: Theme.of(context).textTheme.headlineMedium, textAlign: TextAlign.center),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Switch.adaptive(
                          value: _online,
                          onChanged: (val) => _toggleOnline(val),
                          activeColor: Theme.of(context).colorScheme.primary,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          _online ? 'Online' : 'Offline',
                          style: TextStyle(
                            color: _online ? Colors.green : Colors.red,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
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
                    const SizedBox(height: 20),
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
                    const SizedBox(height: 20),
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
                      style: Theme.of(context).elevatedButtonTheme.style?.copyWith(
                        minimumSize: WidgetStateProperty.all(const Size.fromHeight(48)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      icon: const Icon(Icons.location_on),
                      label: const Text('Manual Location Update'),
                      onPressed: !_online ? null : _sendLocation,
                      style: Theme.of(context).elevatedButtonTheme.style?.copyWith(
                        minimumSize: WidgetStateProperty.all(const Size.fromHeight(48)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 300),
                      child: _status != null
                          ? Text(_status!, key: ValueKey(_status), style: Theme.of(context).textTheme.bodyLarge)
                          : const SizedBox.shrink(),
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton.icon(
                      icon: const Icon(Icons.logout),
                      label: const Text('Logout'),
                      onPressed: () => _logout(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
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
    return Material(
      color: Theme.of(context).colorScheme.primary.withOpacity(0.08),
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          width: 90,
          height: 90,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
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
      ),
    );
  }
}

