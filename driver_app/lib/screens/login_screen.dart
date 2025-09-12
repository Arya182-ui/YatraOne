
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/session_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    bool shouldUpdate = true;
    try {
      final res = await AuthService.login(
        _emailController.text.trim(),
        _passwordController.text.trim(),
      );
      if (!mounted) shouldUpdate = false;
      // Use 'user' object from backend response for userId
      final user = res['user'] ?? {};
      final userId = user['id'] ?? '';
      final token = res['access_token'] ?? res['token'] ?? '';
      if (shouldUpdate && userId.isEmpty) {
        setState(() { _error = 'User ID missing in response.'; });
      } else if (shouldUpdate && (res['approved'] == false || user['approved'] == false)) {
        setState(() { _error = 'Account pending admin approval.'; });
      } else if (shouldUpdate) {
        await SessionService.saveSession(token: token, userId: userId);
        if (!mounted) shouldUpdate = false;
        if (shouldUpdate) {
          Navigator.pushReplacementNamed(context, '/main', arguments: userId);
        }
      }
    } catch (e) {
      if (!mounted) shouldUpdate = false;
      if (shouldUpdate) {
        setState(() { _error = e.toString(); });
      }
    } finally {
      if (shouldUpdate) {
        setState(() { _loading = false; });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Driver Login')),
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
                      Icon(Icons.directions_bus, size: 48, color: Theme.of(context).colorScheme.primary),
                      const SizedBox(height: 16),
                      Text('Welcome, Driver!', style: Theme.of(context).textTheme.headlineMedium),
                      const SizedBox(height: 24),
                      TextFormField(
                        controller: _emailController,
                        decoration: const InputDecoration(
                          labelText: 'Email',
                          prefixIcon: Icon(Icons.email),
                          border: OutlineInputBorder(),
                        ),
                        validator: (v) => v == null || v.isEmpty ? 'Enter email' : null,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _passwordController,
                        decoration: const InputDecoration(
                          labelText: 'Password',
                          prefixIcon: Icon(Icons.lock),
                          border: OutlineInputBorder(),
                        ),
                        obscureText: true,
                        validator: (v) => v == null || v.isEmpty ? 'Enter password' : null,
                      ),
                      const SizedBox(height: 20),
                      if (_error != null) ...[
                        Text(_error!, style: const TextStyle(color: Colors.red)),
                        const SizedBox(height: 10),
                      ],
                      _loading
                          ? const CircularProgressIndicator()
                          : SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                icon: const Icon(Icons.login),
                                label: const Text('Login'),
                                onPressed: () async {
                                  await _login();
                                  if (!mounted) return;
                                  if (_error == null && !_loading) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Login successful!')),
                                    );
                                  }
                                },
                                style: Theme.of(context).elevatedButtonTheme.style,
                              ),
                            ),
                      TextButton(
                        onPressed: () => Navigator.pushNamed(context, '/signup'),
                        child: const Text('Don\'t have an account? Signup'),
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
