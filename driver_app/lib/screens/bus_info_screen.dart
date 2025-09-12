
import 'package:flutter/material.dart';
import '../services/driver_service.dart';


class BusInfoScreen extends StatefulWidget {
  final String userId;
  const BusInfoScreen({super.key, required this.userId});

  @override
  State<BusInfoScreen> createState() => _BusInfoScreenState();
}

class _BusInfoScreenState extends State<BusInfoScreen> {
  Map<String, dynamic>? _bus;
  String? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchBus();
  }

  Future<void> _fetchBus() async {
    setState(() { _loading = true; _error = null; });
    try {
      final assignedBus = await DriverService.getAssignedBus(widget.userId);
      setState(() { _bus = assignedBus; });
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
        title: Text('Assigned Bus Info', style: Theme.of(context).textTheme.headlineMedium),
        centerTitle: true,
        elevation: 0,
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
                ? Center(child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error, fontWeight: FontWeight.w600)))
                : _bus == null
                    ? const Center(child: Text('No bus assigned'))
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
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Icon(Icons.directions_bus, size: 56, color: Theme.of(context).colorScheme.primary, semanticLabel: 'Bus Icon'),
                                        const SizedBox(width: 20),
                                        Expanded(
                                          child: Text(_bus!['number'] ?? '', style: Theme.of(context).textTheme.headlineMedium),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 28),
                                    ListTile(
                                      leading: const Icon(Icons.confirmation_number_outlined),
                                      title: Text('Bus ID: ${_bus!['id'] ?? ''}', style: Theme.of(context).textTheme.bodyLarge),
                                    ),
                                    ListTile(
                                      leading: const Icon(Icons.person_outline),
                                      title: Text('Driver ID: ${_bus!['driverId'] ?? ''}', style: Theme.of(context).textTheme.bodyLarge),
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
