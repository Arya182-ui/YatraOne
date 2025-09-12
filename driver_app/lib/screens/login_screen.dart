
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
      appBar: AppBar(
        title: Text('Driver Login', style: Theme.of(context).textTheme.headlineMedium),
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
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Icon(Icons.directions_bus, size: 56, color: Theme.of(context).colorScheme.primary, semanticLabel: 'App Icon'),
                      const SizedBox(height: 20),
                      Text('Welcome, Driver!', style: Theme.of(context).textTheme.headlineMedium, textAlign: TextAlign.center),
                      const SizedBox(height: 28),
                      TextFormField(
                        controller: _emailController,
                        style: Theme.of(context).textTheme.bodyLarge,
                        decoration: InputDecoration(
                          labelText: 'Email',
                          prefixIcon: const Icon(Icons.email_outlined),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                          filled: true,
                        ),
                        keyboardType: TextInputType.emailAddress,
                        autofillHints: const [AutofillHints.username, AutofillHints.email],
                        validator: (val) => val == null || val.isEmpty ? 'Enter your email' : null,
                        textInputAction: TextInputAction.next,
                      ),
                      const SizedBox(height: 18),
                      TextFormField(
                        controller: _passwordController,
                        style: Theme.of(context).textTheme.bodyLarge,
                        decoration: InputDecoration(
                          labelText: 'Password',
                          prefixIcon: const Icon(Icons.lock_outline),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                          filled: true,
                        ),
                        obscureText: true,
                        autofillHints: const [AutofillHints.password],
                        validator: (val) => val == null || val.isEmpty ? 'Enter your password' : null,
                        textInputAction: TextInputAction.done,
                        onFieldSubmitted: (_) => _login(),
                      ),
                      const SizedBox(height: 18),
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 300),
                        child: _error != null
                            ? Text(_error!, key: ValueKey(_error), style: TextStyle(color: Theme.of(context).colorScheme.error, fontWeight: FontWeight.w600))
                            : const SizedBox.shrink(),
                      ),
                      const SizedBox(height: 18),
                      ElevatedButton.icon(
                        icon: _loading
                            ? const SizedBox(
                                width: 20, height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : const Icon(Icons.login),
                        label: Text(_loading ? 'Logging in...' : 'Login'),
                        onPressed: _loading ? null : _login,
                        style: Theme.of(context).elevatedButtonTheme.style?.copyWith(
                          minimumSize: WidgetStateProperty.all(const Size.fromHeight(48)),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextButton(
                        onPressed: _loading ? null : () => Navigator.pushReplacementNamed(context, '/signup'),
                        child: const Text("Don't have an account? Sign up"),
                        style: TextButton.styleFrom(
                          textStyle: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
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
