import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
    final TextEditingController _firstNameController = TextEditingController();
    final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  bool _loading = false;
  bool _otpSent = false;
  bool _otpVerified = false;
  String? _error;
  String? _otpError;

  Future<void> _sendOtp() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) return;
    final response = await http.post(
      Uri.parse('https://yatraone-backend.onrender.com/api/auth/send-otp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'purpose': 'register',
        }),
    );
    if (response.statusCode == 200) {
      setState(() {
        _otpSent = true;
        _otpError = null;
      });
    } else {
      setState(() {
        _otpError = 'Failed to send OTP';
      });
    }
  }

  Future<void> _verifyOtp() async {
    final email = _emailController.text.trim();
    final otp = _otpController.text.trim();
    if (email.isEmpty || otp.isEmpty) return;
    final response = await http.post(
      Uri.parse('https://yatraone-backend.onrender.com/api/auth/verify-otp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'otp': otp , 'purpose': 'register'}),
    );
    if (response.statusCode == 200) {
      setState(() {
        _otpVerified = true;
        _otpError = null;
      });
    } else {
      setState(() {
        _otpVerified = false;
        _otpError = 'Invalid OTP';
      });
    }
  }

  Future<void> _signup() async {
    if (!_otpVerified) {
      setState(() {
        _error = 'Please verify OTP before signing up.';
      });
      return;
    }
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    bool shouldUpdate = true;
    try {
      await AuthService.signup(
        firstName: _firstNameController.text.trim(),
        lastName: _lastNameController.text.trim(),
        email: _emailController.text.trim(),
        phone: _phoneController.text.trim(),
        password: _passwordController.text.trim(),
      );
      if (!mounted) shouldUpdate = false;
      if (shouldUpdate) {
        setState(() { _error = null; });
        if (!mounted) shouldUpdate = false;
        if (shouldUpdate) {
          showDialog(
            context: context,
            builder: (ctx) => AlertDialog(
              title: const Text('Signup Successful'),
              content: const Text('Your account is pending admin approval.'),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    Navigator.pushReplacementNamed(ctx, '/login');
                  },
                  child: const Text('OK'),
                ),
              ],
            ),
          );
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
        title: Text('Driver Signup', style: Theme.of(context).textTheme.headlineMedium),
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
                      Icon(Icons.person_add, size: 56, color: Theme.of(context).colorScheme.primary, semanticLabel: 'Signup Icon'),
                      const SizedBox(height: 20),
                      Text('Create Driver Account', style: Theme.of(context).textTheme.headlineMedium, textAlign: TextAlign.center),
                      const SizedBox(height: 28),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _firstNameController,
                              style: Theme.of(context).textTheme.bodyLarge,
                              decoration: InputDecoration(
                                labelText: 'First Name',
                                prefixIcon: const Icon(Icons.person_outline),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                                filled: true,
                              ),
                              validator: (v) => v == null || v.isEmpty ? 'Enter first name' : null,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextFormField(
                              controller: _lastNameController,
                              style: Theme.of(context).textTheme.bodyLarge,
                              decoration: InputDecoration(
                                labelText: 'Last Name',
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                                filled: true,
                              ),
                              validator: (v) => v == null || v.isEmpty ? 'Enter last name' : null,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _emailController,
                        style: Theme.of(context).textTheme.bodyLarge,
                        decoration: InputDecoration(
                          labelText: 'Email',
                          prefixIcon: const Icon(Icons.email_outlined),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                          filled: true,
                        ),
                        validator: (v) => v == null || v.isEmpty ? 'Enter email' : null,
                        keyboardType: TextInputType.emailAddress,
                        autofillHints: const [AutofillHints.email],
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _phoneController,
                        style: Theme.of(context).textTheme.bodyLarge,
                        decoration: InputDecoration(
                          labelText: 'Phone',
                          prefixIcon: const Icon(Icons.phone_outlined),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                          filled: true,
                        ),
                        validator: (v) => v == null || v.isEmpty ? 'Enter phone' : null,
                        keyboardType: TextInputType.phone,
                        autofillHints: const [AutofillHints.telephoneNumber],
                      ),
                      const SizedBox(height: 16),
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
                        validator: (v) => v == null || v.isEmpty ? 'Enter password' : null,
                        autofillHints: const [AutofillHints.newPassword],
                      ),
                      const SizedBox(height: 16),
                      if (!_otpSent)
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _sendOtp,
                            child: const Text('Send OTP'),
                            style: Theme.of(context).elevatedButtonTheme.style?.copyWith(
                              minimumSize: WidgetStateProperty.all(const Size.fromHeight(48)),
                            ),
                          ),
                        ),
                      if (_otpSent && !_otpVerified) ...[
                        TextFormField(
                          controller: _otpController,
                          style: Theme.of(context).textTheme.bodyLarge,
                          decoration: InputDecoration(
                            labelText: 'Enter OTP',
                            prefixIcon: const Icon(Icons.lock_outline),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                            filled: true,
                          ),
                          validator: (v) => v == null || v.isEmpty ? 'Enter OTP' : null,
                          keyboardType: TextInputType.number,
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _verifyOtp,
                            child: const Text('Verify OTP'),
                            style: Theme.of(context).elevatedButtonTheme.style?.copyWith(
                              minimumSize: WidgetStateProperty.all(const Size.fromHeight(48)),
                            ),
                          ),
                        ),
                      ],
                      if (_otpVerified)
                        const Text('OTP Verified!', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                      if (_otpError != null)
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 300),
                          child: Text(_otpError!, key: ValueKey(_otpError), style: TextStyle(color: Theme.of(context).colorScheme.error, fontWeight: FontWeight.w600)),
                        ),
                      const SizedBox(height: 20),
                      if (_error != null) ...[
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 300),
                          child: Text(_error!, key: ValueKey(_error), style: TextStyle(color: Theme.of(context).colorScheme.error, fontWeight: FontWeight.w600)),
                        ),
                        const SizedBox(height: 10),
                      ],
                      _loading
                          ? const Center(child: CircularProgressIndicator())
                          : SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                icon: const Icon(Icons.person_add),
                                label: const Text('Signup'),
                                onPressed: _otpVerified
                                    ? () async {
                                        await _signup();
                                        if (!mounted) return;
                                        if (_error == null && !_loading) {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            const SnackBar(content: Text('Signup successful! Pending admin approval.')),
                                          );
                                        }
                                      }
                                    : null,
                                style: Theme.of(context).elevatedButtonTheme.style?.copyWith(
                                  minimumSize: WidgetStateProperty.all(const Size.fromHeight(48)),
                                ),
                              ),
                            ),
                      TextButton(
                        onPressed: () => Navigator.pushReplacementNamed(context, '/login'),
                        child: const Text('Already have an account? Login'),
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
