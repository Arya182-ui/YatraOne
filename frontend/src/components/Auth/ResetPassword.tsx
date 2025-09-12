import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '/logo.png';
import HeroNav from '../HomePage/publicnav';
import { Toaster, toast } from 'react-hot-toast';
import debounce from 'lodash.debounce';
import { Mail, Lock, Key } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Debounced OTP send
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSendOtp = useCallback(
    debounce(async () => {
      setLoading(true);
      setSuccess('');
      try {
        await authAPI.sendOtp(email, 'forgot_password');
        setStep('otp');
        toast.success('OTP sent to your email.');
      } catch (err: any) {
        let msg = 'Failed to send OTP';
        const detail = err.response?.data?.detail;
        if (typeof detail === 'object' && detail?.message) {
          msg = detail.message;
        } else if (typeof detail === 'string') {
          msg = detail;
        } else if (err.response?.data?.message) {
          msg = err.response.data.message;
        } else if (err.message) {
          msg = err.message;
        }
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }, 500, { leading: true, trailing: false }),
    [email]
  );

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) debouncedSendOtp();
  };

  // Debounced password reset
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedResetPassword = useCallback(
    debounce(async () => {
      setLoading(true);
      setSuccess('');
      // Password policy validation
      const passwordPolicy = (password: string) => {
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
        if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
        if (!/[0-9]/.test(password)) return 'Password must contain a number';
        if (!/[!@#$%^&*()_+\-=[\]{};':",.<>/?]/.test(password)) return 'Password must contain a special character';
        return '';
      };
      const policyError = passwordPolicy(newPassword);
      if (policyError) {
        toast.error(policyError);
        setLoading(false);
        return;
      }
      try {
        await authAPI.resetPassword(email, otp, newPassword);
        setSuccess('Password reset successful! Redirecting to login...');
        toast.success('Password reset successful! Redirecting...');
        setTimeout(() => navigate('/login'), 2000);
      } catch (err: any) {
        let msg = 'Failed to reset password';
        const detail = err.response?.data?.detail;
        if (typeof detail === 'object' && detail?.message) {
          msg = detail.message;
        } else if (typeof detail === 'string') {
          msg = detail;
        } else if (err.response?.data?.message) {
          msg = err.response.data.message;
        } else if (err.message) {
          msg = err.message;
        }
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }, 500, { leading: true, trailing: false }),
    [email, otp, newPassword, navigate]
  );

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) debouncedResetPassword();
  };

  // Floating label class helper
  const floatingLabelClass = (value: string) =>
    `absolute left-10 transition-all duration-200 pointer-events-none ${
      value ? '-top-2 text-sm text-blue-600' : 'top-3 text-gray-400 text-base'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <div className="w-full z-50">
        <HeroNav />
      </div>
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <Toaster position="top-center" />
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
              <div className={`h-2 w-8 rounded-full ${step === 'email' ? 'bg-blue-600' : 'bg-gray-200'} transition-all`} />
              <div className={`h-2 w-8 rounded-full ${step === 'otp' ? 'bg-blue-600' : 'bg-gray-200'} transition-all`} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{t('reset_title', 'Reset Password')}</h2>
            <p className="mt-2 text-gray-600">{t('reset_subtitle', 'Enter your email to receive an OTP and reset your password.')}</p>
          </div>
          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="relative">
                <label className={floatingLabelClass(email)}>{t('reset_email', 'Email *')}</label>
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder=" "
                  className={`w-full pl-10 pr-4 py-3 border ${email ? 'border-green-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  required
                  disabled={loading}
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-semibold focus:ring-4 focus:ring-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('reset_sending_otp', 'Sending OTP...') : t('reset_send_otp', 'Send OTP')}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="relative">
                <label className={floatingLabelClass(otp)}>{t('reset_otp', 'OTP *')}</label>
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder=" "
                  maxLength={6}
                  className={`w-full pl-10 pr-4 py-3 border ${otp.length === 6 ? 'border-green-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  required
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <label className={floatingLabelClass(newPassword)}>{t('reset_new_password', 'New Password *')}</label>
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder=" "
                  className={`w-full pl-10 pr-4 py-3 border ${newPassword.length >= 8 ? 'border-green-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  required
                  disabled={loading}
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold focus:ring-4 focus:ring-green-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={loading}
              >
                {loading ? t('reset_resetting', 'Resetting...') : t('reset_reset_password', 'Reset Password')}
              </motion.button>
            </form>
          )}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-block px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors border border-gray-200 mt-2"
            >
              &larr; {t('reset_back_to_login', 'Back to Login')}
            </button>
          </div>
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

export default ResetPassword;
