import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../services/session_service.dart';
import '../services/location_service.dart';


class SosScreen extends StatefulWidget {
  const SosScreen({super.key});

  @override
  State<SosScreen> createState() => _SosScreenState();
}

class _SosScreenState extends State<SosScreen> {
  final TextEditingController _descController = TextEditingController();
  bool _loading = false;
  String? _response;

  Future<void> _sendSOS() async {
    setState(() => _loading = true);
    try {
      final userId = await SessionService.getUserId();
      final position = await LocationService.getCurrentLocation();
      final response = await http.post(
        Uri.parse('https://yatraone-backend.onrender.com/api/sos'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'user_id': userId,
          'message': _descController.text,
          'latitude': position.latitude,
          'longitude': position.longitude,
        }),
      );
      if (response.statusCode == 201) {
        setState(() {
          _response = 'SOS sent successfully!';
        });
      } else {
        setState(() {
          _response = 'Failed to send SOS.';
        });
      }
    } catch (e) {
      setState(() {
        _response = 'Error: $e';
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final ColorScheme colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: Text('SOS/Emergency', style: Theme.of(context).textTheme.headlineMedium),
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
                        Icon(Icons.warning_amber_rounded, size: 48, color: colorScheme.error, semanticLabel: 'SOS Icon'),
                        const SizedBox(width: 16),
                        Text('Emergency SOS', style: Theme.of(context).textTheme.titleLarge),
                      ],
                    ),
                    const SizedBox(height: 28),
                    Text('Describe your emergency:', style: Theme.of(context).textTheme.bodyLarge),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _descController,
                      maxLines: 3,
                      decoration: InputDecoration(
                        hintText: 'Type details here...',
                        border: const OutlineInputBorder(),
                        prefixIcon: const Icon(Icons.edit_outlined),
                        floatingLabelBehavior: FloatingLabelBehavior.auto,
                      ),
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        icon: Icon(Icons.warning_amber_rounded, color: colorScheme.onError),
                        label: _loading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : const Text('Send SOS'),
                        onPressed: _loading ? null : _sendSOS,
                        style: FilledButton.styleFrom(
                          backgroundColor: colorScheme.error,
                          foregroundColor: colorScheme.onError,
                          padding: const EdgeInsets.symmetric(vertical: 18),
                          textStyle: Theme.of(context).textTheme.titleMedium,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                      ),
                    ),
                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 250),
                      child: _response != null
                          ? Padding(
                              padding: const EdgeInsets.only(top: 20),
                              child: Text(
                                _response!,
                                key: ValueKey(_response),
                                style: TextStyle(
                                  color: _response == 'SOS sent successfully!'
                                      ? Colors.green
                                      : colorScheme.error,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            )
                          : const SizedBox.shrink(),
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