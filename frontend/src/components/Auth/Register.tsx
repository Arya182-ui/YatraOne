import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../lib/api';
import { Toaster, toast } from 'react-hot-toast';
import debounce from 'lodash.debounce';
import Logo from '/logo.png';
import HeroNav from '../HomePage/publicnav';
import TermsModal from '../Common/TermsModal';
import PrivacyModal from '../Common/PrivacyModal';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [step, setStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const { register } = useAuth();
  const { sendOtp, verifyOtp } = authAPI;

  // Debounced Send OTP
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSendOtp = useCallback(
    debounce(async () => {
      if (!formData.email) {
        toast.error('Please enter your email first.');
        return;
      }
      setIsLoading(true);
      try {
        await sendOtp(formData.email, 'register');
        setOtpSent(true);
        toast.success('OTP sent to your email.');
      } catch (err: any) {
        toast.error('Failed to send OTP. Try again.');
      } finally {
        setIsLoading(false);
      }
    }, 500, { leading: true, trailing: false }),
    [formData.email, sendOtp]
  );

  const handleSendOtp = () => {
    if (!isLoading) debouncedSendOtp();
  };

  // Debounced OTP verify
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedVerifyOtp = useCallback(
    debounce(async () => {
      setVerifyingOtp(true);
      try {
        await verifyOtp(formData.email, otp, 'register');
        setOtpVerified(true);
        toast.success('OTP verified! Now complete your registration.');
      } catch (err: any) {
        toast.error('Invalid OTP. Try again.');
      } finally {
        setVerifyingOtp(false);
      }
    }, 500, { leading: true, trailing: false }),
    [formData.email, otp, verifyOtp]
  );

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingOtp) debouncedVerifyOtp();
  };

  // Debounced Register
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedRegister = useCallback(
    debounce(async () => {
      if (!otpVerified) {
        toast.error('Please verify your email with OTP first.');
        return;
      }
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
        toast.error('Please fill all required fields, including phone number');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      // Password policy validation
      const passwordPolicy = (password: string) => {
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
        if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
        if (!/[0-9]/.test(password)) return 'Password must contain a number';
        if (!/[!@#$%^&*()_+\-=[\]{};':",.<>/?]/.test(password)) return 'Password must contain a special character';
        return '';
      };
      const policyError = passwordPolicy(formData.password);
      if (policyError) {
        toast.error(policyError);
        return;
      }
      if (!formData.agreeToTerms) {
        toast.error('Please agree to the terms');
        return;
      }
      setIsLoading(true);
      try {
        await register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
        navigate('/dashboard');
      } catch (err: any) {
        // Show backend error detail if available
        const backendMsg = err?.response?.data?.detail || err?.response?.data?.message;
        if (backendMsg) {
          toast.error(backendMsg);
          console.error('Registration failed:', backendMsg);
        } else {
          toast.error('Registration failed. Try again.');
          console.error('Registration failed:', err);
        }
      } finally {
        setIsLoading(false);
      }
    }, 500, { leading: true, trailing: false }),
    [otpVerified, formData, register, navigate]
  );

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) debouncedRegister();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Floating label class helper
  const floatingLabelClass = (value: string) =>
    `absolute left-10 transition-all duration-200 pointer-events-none ${value ? '-top-2 text-sm text-blue-600' : 'top-3 text-gray-400 text-base'
    }`;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-100 to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Animated glassy gradient background, like Login */}
      <div className="pointer-events-none select-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120vw] h-96 bg-gradient-to-r from-blue-300/30 via-purple-300/20 to-pink-300/30 blur-3xl animate-gradient-wave rounded-full"></div>
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-40 animate-pulse"
            style={{
              width: `${12 + Math.random() * 16}px`,
              height: `${12 + Math.random() * 16}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle at 50% 50%, #fff7, #fff0 70%)`,
              filter: 'blur(1.5px)',
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      {/* Navbar */}
      <div className="w-full z-50">
        <HeroNav />
      </div>

  {/* Main Form */}
  <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <Toaster position="top-center" />
        {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-8"
        >
          <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <img src={Logo} alt="YatraOne Logo" className="h-16 w-auto mb-2 inline-block drop-shadow-lg" />
            </Link>

            {/* Step Indicator */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-8 rounded-full ${step === s ? 'bg-blue-600' : 'bg-gray-200'} transition-all`}
                />
              ))}
            </div>

            <h2 className="text-3xl font-bold text-gray-900">{t('register_title', 'Create your account')}</h2>
            <p className="mt-2 text-gray-600">{t('register_subtitle', 'Join thousands of smart commuters')}</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
          >
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className={floatingLabelClass(formData.firstName)}>{t('register_first_name', 'First Name *')}</label>
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder=" "
                    className={`w-full pl-10 pr-4 py-3 border ${formData.firstName ? 'border-green-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="relative">
                  <label className={floatingLabelClass(formData.lastName)}>{t('register_last_name', 'Last Name *')}</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder=" "
                    className={`w-full pl-4 pr-4 py-3 border ${formData.lastName ? 'border-green-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email with Send OTP */}
              <div className="relative flex items-center">
                <div className="flex-1">
                  <label className={floatingLabelClass(formData.email)}>{t('register_email', 'Email *')}</label>
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder=" "
                    className={`w-full pl-10 pr-4 py-3 border ${formData.email ? 'border-green-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    required
                    disabled={otpSent || isLoading}
                  />
                </div>
                <button
                  type="button"
                  className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60"
                  onClick={handleSendOtp}
                  disabled={isLoading || otpSent}
                >
                  {otpSent ? t('register_otp_sent', 'OTP Sent') : isLoading ? t('register_sending_otp', 'Sending...') : t('register_send_otp', 'Send OTP')}
                </button>
              </div>

              {/* OTP input (show only if OTP sent and not verified) */}
              {otpSent && !otpVerified && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className={`w-full px-4 py-3 border ${otp.length === 6 ? 'border-green-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${verifyingOtp ? 'opacity-60 cursor-not-allowed' : ''}`}
                    placeholder={t('register_otp_placeholder', 'Enter OTP')}
                    required
                    disabled={verifyingOtp}
                  />
                  <button
                    type="button"
                    className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60"
                    onClick={handleOtpVerify}
                    disabled={verifyingOtp}
                  >
                    {verifyingOtp ? t('register_verifying_otp', 'Verifying...') : t('register_verify_otp', 'Verify OTP')}
                  </button>
                  <button
                    type="button"
                    className="px-2 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      setOtpVerified(false);
                    }}
                    disabled={verifyingOtp}
                  >
                    {t('register_change_email', 'Change Email')}
                  </button>
                </div>
              )}

              {/* OTP verified message */}
              {otpVerified && (
                <div className="text-green-600 text-sm font-semibold mb-2">
                  {t('register_otp_verified', 'OTP verified! You can now complete registration.')}
                </div>
              )}

              {/* Phone */}
              <div className="relative">
                <label className={floatingLabelClass(formData.phone)}>{t('register_phone', 'Phone Number *')}</label>
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder=" "
                  className={`w-full pl-10 pr-4 py-3 border ${formData.phone.length >= 10 ? 'border-green-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 gap-4">
                <div className="relative">
                  <label className={floatingLabelClass(formData.password)}>{t('register_password', 'Password *')}</label>
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder=" "
                    className={`w-full pl-10 pr-12 py-3 border ${formData.password.length >= 8 ? 'border-green-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="relative">
                  <label className={floatingLabelClass(formData.confirmPassword)}>{t('register_confirm_password', 'Confirm Password *')}</label>
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder=" "
                    className={`w-full pl-10 pr-12 py-3 border ${(formData.confirmPassword && formData.confirmPassword === formData.password) ? 'border-green-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
                <p className="ml-3 text-sm text-gray-600">
                  {t('register_agree_to', 'I agree to the')}{' '}
                  <button
                    type="button"
                    className="text-blue-600 underline"
                    onClick={() => setShowTerms(true)}
                  >
                    {t('Terms of Service', 'Terms')}
                  </button>{' '}
                  {t('and', 'and')}{' '}
                  <button
                    type="button"
                    className="text-blue-600 underline"
                    onClick={() => setShowPrivacy(true)}
                  >
                    {t('Privacy Policy', 'Privacy Policy')}
                  </button>
                </p>
              </div>

              <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
              <PrivacyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} />

              {/* Register button */}
              <motion.button
                type="submit"
                disabled={!otpVerified || isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-semibold focus:ring-4 focus:ring-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={isLoading}
              >
                {isLoading ? t('register_registering', 'Registering...') : t('register_register', 'Register')}
              </motion.button>
            </form>

            {/* Sign in Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t('register_already_have_account', 'Already have an account?')}{' '}
                <Link to="/login" className="text-blue-600 font-semibold">{t('register_sign_in', 'Sign in')}</Link>
              </p>
              <p className="text-gray-600 mt-2">
                {t('register_forgot_password', 'Forgot your password?')}{' '}
                <Link to="/reset-password" className="text-blue-600 font-semibold">{t('register_reset_password', 'Reset password')}</Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-300 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm">© {new Date().getFullYear()} Smart Transit. All rights reserved.</span>
          <div className="flex gap-6 text-sm">
            <Link to="/about" className="hover:text-blue-400 transition-colors">{t('About Us', 'About')}</Link>
            <Link to="/contact" className="hover:text-blue-400 transition-colors">{t('Contact Us', 'Contact')}</Link>
            <Link to="/privacy" className="hover:text-blue-400 transition-colors">{t('Privacy Policy', 'Privacy')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Register;
