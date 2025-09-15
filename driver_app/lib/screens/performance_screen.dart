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
      final response = await http.get(Uri.parse('https://yatraone-backend.onrender.com/api/driver/performance'));
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
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: Text('Driver Performance', style: Theme.of(context).textTheme.headlineMedium),
        centerTitle: true,
        elevation: 0,
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : Center(
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
                                Icon(Icons.bar_chart_rounded, size: 48, color: colorScheme.primary, semanticLabel: 'Performance Icon'),
                                const SizedBox(width: 16),
                                Text('Performance Dashboard', style: Theme.of(context).textTheme.titleLarge),
                              ],
                            ),
                            const SizedBox(height: 28),
                            ..._performanceData.entries.map((entry) => Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                                  child: ListTile(
                                    leading: Icon(Icons.check_circle_outline_rounded, color: colorScheme.secondary),
                                    title: Text(entry.key, style: Theme.of(context).textTheme.bodyLarge),
                                    trailing: Text(entry.value.toString(), style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                                    tileColor: colorScheme.surfaceVariant,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                  ),
                                )),
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
