import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../services/session_service.dart';
import '../services/location_service.dart';


class FeedbackScreen extends StatefulWidget {
  const FeedbackScreen({super.key});

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _feedbackController = TextEditingController();
  bool _loading = false;
  String? _error;
  String? _success;

  Future<void> _submitFeedback() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; _success = null; });
    try {
      final userId = await SessionService.getUserId();
      final position = await LocationService.getCurrentLocation();
      final response = await http.post(
        Uri.parse('https://yatraone-backend.onrender.com/api/feedback'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'user_id': userId,
          'type': 'complaint', // TODO: Optionally let user select type
          'subject': 'General Feedback', // TODO: Optionally let user enter subject
          'message': _feedbackController.text,
          'latitude': position.latitude,
          'longitude': position.longitude,
        }),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        setState(() { _success = 'Feedback submitted!'; });
        _feedbackController.clear();
      } else {
        setState(() { _error = 'Failed to submit feedback.'; });
      }
    } catch (e) {
      setState(() { _error = e.toString(); });
    } finally {
      setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Submit Feedback', style: Theme.of(context).textTheme.headlineMedium),
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
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.feedback_outlined, size: 48, color: Theme.of(context).colorScheme.primary, semanticLabel: 'Feedback Icon'),
                          const SizedBox(width: 16),
                          Text('Your Feedback', style: Theme.of(context).textTheme.titleLarge),
                        ],
                      ),
                      const SizedBox(height: 28),
                      TextFormField(
                        controller: _feedbackController,
                        decoration: InputDecoration(
                          labelText: 'Type your feedback',
                          border: const OutlineInputBorder(),
                          prefixIcon: const Icon(Icons.edit_outlined),
                          floatingLabelBehavior: FloatingLabelBehavior.auto,
                        ),
                        validator: (v) => v == null || v.isEmpty ? 'Enter feedback' : null,
                        maxLines: 3,
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                      const SizedBox(height: 20),
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 250),
                        child: _error != null
                            ? Text(_error!, key: const ValueKey('error'), style: TextStyle(color: Theme.of(context).colorScheme.error, fontWeight: FontWeight.w600))
                            : _success != null
                                ? Text(_success!, key: const ValueKey('success'), style: TextStyle(color: Colors.green, fontWeight: FontWeight.w600))
                                : const SizedBox.shrink(),
                      ),
                      const SizedBox(height: 20),
                      _loading
                          ? const CircularProgressIndicator()
                          : SizedBox(
                              width: double.infinity,
                              child: FilledButton.icon(
                                icon: const Icon(Icons.send),
                                label: const Text('Submit'),
                                onPressed: _submitFeedback,
                                style: FilledButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 18),
                                  textStyle: Theme.of(context).textTheme.titleMedium,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                ),
                              ),
                            ),
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
