import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../services/session_service.dart';
import '../services/location_service.dart';

class IncidentScreen extends StatefulWidget {
  const IncidentScreen({super.key});

  @override
  State<IncidentScreen> createState() => _IncidentScreenState();
}

class _IncidentScreenState extends State<IncidentScreen> {
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  bool _loading = false;
  String? _response;

  Future<void> _reportIncident() async {
    setState(() => _loading = true);
    try {
      final userId = await SessionService.getUserId();
      final position = await LocationService.getCurrentLocation();
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('https://yatraone-backend.onrender.com/api/incident'),
      );
      request.fields['user_id'] = userId ?? '';
      request.fields['type'] = _titleController.text;
      request.fields['description'] = _descController.text;
      request.fields['latitude'] = position.latitude.toString();
      request.fields['longitude'] = position.longitude.toString();
      // If you want to add photo: request.files.add(await http.MultipartFile.fromPath('photo', filePath));
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      if (response.statusCode == 201) {
        setState(() {
          _response = 'Incident reported successfully!';
        });
      } else {
        setState(() {
          _response = 'Failed to report incident.';
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
        title: Text('Report Incident', style: Theme.of(context).textTheme.headlineMedium),
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
                        Icon(Icons.report_gmailerrorred_rounded, size: 48, color: colorScheme.tertiary, semanticLabel: 'Incident Icon'),
                        const SizedBox(width: 16),
                        Text('Report Incident', style: Theme.of(context).textTheme.titleLarge),
                      ],
                    ),
                    const SizedBox(height: 28),
                    Text('Incident Title:', style: Theme.of(context).textTheme.bodyLarge),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _titleController,
                      decoration: InputDecoration(
                        hintText: 'Short title...',
                        border: const OutlineInputBorder(),
                        prefixIcon: const Icon(Icons.title_outlined),
                        floatingLabelBehavior: FloatingLabelBehavior.auto,
                      ),
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                    const SizedBox(height: 16),
                    Text('Description:', style: Theme.of(context).textTheme.bodyLarge),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _descController,
                      maxLines: 3,
                      decoration: InputDecoration(
                        hintText: 'Describe the incident...',
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
                        icon: Icon(Icons.report_gmailerrorred_rounded, color: colorScheme.onTertiary),
                        label: _loading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : const Text('Report Incident'),
                        onPressed: _loading ? null : _reportIncident,
                        style: FilledButton.styleFrom(
                          backgroundColor: colorScheme.tertiary,
                          foregroundColor: colorScheme.onTertiary,
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
                                  color: _response == 'Incident reported successfully!'
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
