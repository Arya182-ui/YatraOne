import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;


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
      final response = await http.post(
        Uri.parse('https://your-backend-url/api/feedback'),
        body: {'feedback': _feedbackController.text},
      );
      if (response.statusCode == 200) {
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
      appBar: AppBar(title: const Text('Submit Feedback')),
      body: Center(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Card(
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.feedback, size: 40, color: Theme.of(context).colorScheme.primary),
                          const SizedBox(width: 12),
                          Text('Your Feedback', style: Theme.of(context).textTheme.titleLarge),
                        ],
                      ),
                      const SizedBox(height: 24),
                      TextFormField(
                        controller: _feedbackController,
                        decoration: const InputDecoration(
                          labelText: 'Type your feedback',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.edit),
                        ),
                        validator: (v) => v == null || v.isEmpty ? 'Enter feedback' : null,
                        maxLines: 3,
                      ),
                      const SizedBox(height: 20),
                      if (_error != null)
                        Text(_error!, style: const TextStyle(color: Colors.red)),
                      if (_success != null)
                        Text(_success!, style: const TextStyle(color: Colors.green)),
                      const SizedBox(height: 20),
                      _loading
                          ? const CircularProgressIndicator()
                          : SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                icon: const Icon(Icons.send),
                                label: const Text('Submit'),
                                onPressed: _submitFeedback,
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  textStyle: const TextStyle(fontSize: 16),
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
