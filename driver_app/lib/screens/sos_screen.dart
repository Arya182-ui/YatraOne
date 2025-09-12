import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

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
      final response = await http.post(
        Uri.parse('https://your-backend-url/api/sos'),
        body: {'description': _descController.text},
      );
      if (response.statusCode == 200) {
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
    return Scaffold(
      appBar: AppBar(title: const Text('SOS/Emergency')),
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
                        const Icon(Icons.warning, size: 40, color: Colors.red),
                        const SizedBox(width: 12),
                        Text('Emergency SOS', style: Theme.of(context).textTheme.titleLarge),
                      ],
                    ),
                    const SizedBox(height: 24),
                    const Text('Describe your emergency:'),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _descController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        hintText: 'Type details here...',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.edit),
                      ),
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.warning, color: Colors.white),
                        label: _loading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : const Text('Send SOS'),
                        onPressed: _loading ? null : _sendSOS,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          textStyle: const TextStyle(fontSize: 16),
                        ),
                      ),
                    ),
                    if (_response != null) ...[
                      const SizedBox(height: 20),
                      Text(_response!, style: TextStyle(color: _response == 'SOS sent successfully!' ? Colors.green : Colors.red)),
                    ],
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
