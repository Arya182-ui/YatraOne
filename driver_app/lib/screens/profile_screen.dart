
import 'package:flutter/material.dart';
import '../services/driver_service.dart';
import '../services/session_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _profile;
  String? _error;
  bool _loading = true;
  bool _editName = false;
  bool _editPhone = false;
  bool _editAddress = false;
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    setState(() { _loading = true; _error = null; });
    try {
      final userId = await SessionService.getUserId();
      if (userId == null || userId.isEmpty) {
        setState(() { _error = 'User ID not found.'; });
        return;
      }
      final res = await DriverService.getProfile(userId);
      setState(() {
        _profile = res;
        _nameController.text = (res['firstName'] ?? '') + (res['lastName'] != null ? ' ' + res['lastName'] : '');
        _phoneController.text = res['phone'] ?? '';
        _addressController.text = res['address'] ?? '';
      });
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
        title: Text('Driver Profile', style: Theme.of(context).textTheme.headlineMedium),
        centerTitle: true,
        elevation: 0,
      ),
      floatingActionButton: _profile == null ? null : FloatingActionButton(
        onPressed: _fetchProfile,
        child: const Icon(Icons.refresh),
        tooltip: 'Refresh',
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
                ? Center(child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error, fontWeight: FontWeight.w600)))
                : _profile == null
                    ? const Center(child: Text('No profile data'))
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
                                    // Profile photo
                                    Center(
                                      child: Stack(
                                        children: [
                                          CircleAvatar(
                                            radius: 44,
                                            backgroundImage: _profile!['photoUrl'] != null && _profile!['photoUrl'] != ''
                                                ? NetworkImage(_profile!['photoUrl'])
                                                : null,
                                            child: _profile!['photoUrl'] == null || _profile!['photoUrl'] == ''
                                                ? Icon(Icons.person, size: 56, color: Theme.of(context).colorScheme.primary)
                                                : null,
                                          ),
                                          Positioned(
                                            bottom: 0,
                                            right: 0,
                                            child: InkWell(
                                              onTap: () {/* TODO: Add photo upload */},
                                              child: CircleAvatar(
                                                radius: 18,
                                                backgroundColor: Theme.of(context).colorScheme.primary,
                                                child: const Icon(Icons.edit, color: Colors.white, size: 20),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: 18),
                                    // Name (edit)
                                    Row(
                                      children: [
                                        Expanded(
                                          child: _editName
                                              ? TextField(
                                                  controller: _nameController,
                                                  decoration: const InputDecoration(labelText: 'Full Name'),
                                                )
                                              : Text(
                                                  (_profile!['firstName'] ?? '') +
                                                      (_profile!['lastName'] != null ? ' ' + _profile!['lastName'] : ''),
                                                  style: Theme.of(context).textTheme.headlineMedium,
                                                ),
                                        ),
                                        IconButton(
                                          icon: Icon(_editName ? Icons.check : Icons.edit),
                                          onPressed: () async {
                                            if (_editName) {
                                              // Save name
                                              final userId = await SessionService.getUserId();
                                              final parts = _nameController.text.trim().split(' ');
                                              final firstName = parts.isNotEmpty ? parts[0] : '';
                                              final lastName = parts.length > 1 ? parts.sublist(1).join(' ') : '';
                                              await DriverService.updateProfile(userId!, {'firstName': firstName, 'lastName': lastName});
                                              await _fetchProfile();
                                            }
                                            setState(() => _editName = !_editName);
                                          },
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 18),
                                    // Email (not editable)
                                    ListTile(
                                      leading: const Icon(Icons.email_outlined),
                                      title: Text(_profile!['email'] ?? '', style: Theme.of(context).textTheme.bodyLarge),
                                    ),
                                    // Phone (edit)
                                    ListTile(
                                      leading: const Icon(Icons.phone_outlined),
                                      title: _editPhone
                                          ? TextField(
                                              controller: _phoneController,
                                              decoration: const InputDecoration(labelText: 'Phone'),
                                            )
                                          : Text(_profile!['phone'] ?? '', style: Theme.of(context).textTheme.bodyLarge),
                                      trailing: IconButton(
                                        icon: Icon(_editPhone ? Icons.check : Icons.edit),
                                        onPressed: () async {
                                          if (_editPhone) {
                                            final userId = await SessionService.getUserId();
                                            await DriverService.updatePhone(userId!, _phoneController.text.trim());
                                            await _fetchProfile();
                                          }
                                          setState(() => _editPhone = !_editPhone);
                                        },
                                      ),
                                    ),
                                    // Address (edit)
                                    ListTile(
                                      leading: const Icon(Icons.home_outlined),
                                      title: _editAddress
                                          ? TextField(
                                              controller: _addressController,
                                              decoration: const InputDecoration(labelText: 'Address'),
                                            )
                                          : Text(_profile!['address'] ?? '', style: Theme.of(context).textTheme.bodyLarge),
                                      trailing: IconButton(
                                        icon: Icon(_editAddress ? Icons.check : Icons.edit),
                                        onPressed: () async {
                                          if (_editAddress) {
                                            final userId = await SessionService.getUserId();
                                            await DriverService.updateDetails(userId!, {'address': _addressController.text.trim()});
                                            await _fetchProfile();
                                          }
                                          setState(() => _editAddress = !_editAddress);
                                        },
                                      ),
                                    ),
                                    // Status: Verified
                                    ListTile(
                                      leading: Icon(
                                        _profile!['driverVerified'] == true ? Icons.verified_user : Icons.cancel,
                                        color: _profile!['driverVerified'] == true ? Colors.green : Colors.red,
                                      ),
                                      title: Text(
                                        'Verified: ${_profile!['driverVerified'] == true ? 'Yes' : 'No'}',
                                        style: Theme.of(context).textTheme.bodyLarge,
                                      ),
                                    ),
                                    ListTile(
                                      leading: Icon(
                                        _profile!['isActive'] == false ? Icons.block : Icons.check_circle,
                                        color: _profile!['isActive'] == false ? Colors.red : Colors.green,
                                      ),
                                      title: Text(
                                        'Active: ${_profile!['isActive'] == false ? 'No' : 'Yes'}',
                                        style: Theme.of(context).textTheme.bodyLarge,
                                      ),
                                    ),
                                    ListTile(
                                      leading: Icon(
                                        _profile!['isActive'] == false ? Icons.block : Icons.check_circle,
                                        color: _profile!['isActive'] == false ? Colors.red : Colors.green,
                                      ),
                                      title: Text(
                                        'Active: ${_profile!['isActive'] == false ? 'No' : 'Yes'}',
                                        style: Theme.of(context).textTheme.bodyLarge,
                                      ),
                                    ),
                                    // Rewards/points
                                    if (_profile!['points'] != null)
                                      ListTile(
                                        leading: const Icon(Icons.emoji_events_outlined),
                                        title: Text('Reward Points: ${_profile!['points']}', style: Theme.of(context).textTheme.bodyLarge),
                                      ),
                                    // Activity log (dummy)
                                    const SizedBox(height: 18),
                                    Text('Activity Log', style: Theme.of(context).textTheme.titleMedium),
                                    FutureBuilder<List<Map<String, dynamic>>>(
                                      future: DriverService.getActivityLog(_profile!['id']),
                                      builder: (context, snapshot) {
                                        if (!snapshot.hasData) return const Padding(padding: EdgeInsets.all(8), child: CircularProgressIndicator());
                                        final logs = snapshot.data!;
                                        if (logs.isEmpty) return const Text('No activity yet');
                                        return Column(
                                          children: logs.map((log) => ListTile(
                                            leading: const Icon(Icons.history),
                                            title: Text(log['type'] ?? ''),
                                            subtitle: Text(log['timestamp'] ?? ''),
                                          )).toList(),
                                        );
                                      },
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
