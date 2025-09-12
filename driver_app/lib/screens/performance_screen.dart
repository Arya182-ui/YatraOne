import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
// import 'package:http/http.dart' as http; // Uncomment when ready to use

class PerformanceScreen extends StatefulWidget {
  const PerformanceScreen({super.key});

  @override
  State<PerformanceScreen> createState() => _PerformanceScreenState();
}

class _PerformanceScreenState extends State<PerformanceScreen> {
  bool _loading = true;
  Map<String, dynamic> _performanceData = {};

  @override
  void initState() {
    super.initState();
    _fetchPerformanceData();
  }

  Future<void> _fetchPerformanceData() async {
    try {
      final response = await http.get(Uri.parse('https://your-backend-url/api/driver/performance'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _performanceData = Map<String, dynamic>.from(data);
          _loading = false;
        });
      } else {
        setState(() {
          _performanceData = {'Error': 'Failed to load performance data'};
          _loading = false;
        });
      }
    } catch (e) {
      setState(() {
        _performanceData = {'Error': e.toString()};
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Driver Performance')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
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
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.bar_chart, size: 40, color: Theme.of(context).colorScheme.primary),
                              const SizedBox(width: 12),
                              Text('Performance Dashboard', style: Theme.of(context).textTheme.titleLarge),
                            ],
                          ),
                          const SizedBox(height: 24),
                          ..._performanceData.entries.map((entry) => Padding(
                                padding: const EdgeInsets.symmetric(vertical: 8.0),
                                child: ListTile(
                                  leading: const Icon(Icons.check_circle_outline),
                                  title: Text(entry.key),
                                  trailing: Text(entry.value.toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
                                  tileColor: Colors.grey[100],
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                              )),
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
