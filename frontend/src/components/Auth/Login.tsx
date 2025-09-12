import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import debounce from 'lodash.debounce';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '/logo.png';
import HeroNav from '../HomePage/publicnav';


// Advanced email regex (RFC 5322 Official Standard)
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').regex(emailRegex, 'Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();


  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid, dirtyFields, submitCount },
    watch,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldFocusError: false,
    criteriaMode: 'all',
  });

  // Watch fields for live validation
  const emailValue = watch('email');
  const passwordValue = watch('password');


  // Debounced submit handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedLogin = useCallback(
    debounce(async (data: LoginForm) => {
      setIsLoading(true);
      try {
        await login(data.email, data.password);
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          navigate('/dashboard');
        }, 1500);
      } catch (err: any) {
        let msg = 'Login failed!';
        if (err?.response?.data?.detail) msg = err.response.data.detail;
        else if (err?.response?.data?.message) msg = err.response.data.message;
        else if (err?.message) msg = err.message;
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    }, 500, { leading: true, trailing: false }),
    [login, navigate]
  );

  const onSubmit = (data: LoginForm) => {
    if (!isLoading) debouncedLogin(data);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-100 to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Animated glassy gradient background, like dashboard */}
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

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <Toaster position="top-center" />
        {showConfetti && (
          <Confetti width={window.innerWidth} height={window.innerHeight} />
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-8"
        >
          <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <img
                src={Logo}
                alt="YatraOne Logo"
                className="h-16 w-auto mb-2 inline-block drop-shadow-lg"
              />
            </Link>

            {/* Step Indicator */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-8 rounded-full ${
                    s === 1 ? 'bg-blue-600' : 'bg-gray-200'
                  } transition-all`}
                />
              ))}
            </div>

            <h2 className="text-3xl font-bold text-gray-900">{t('login_title', 'Welcome back')}</h2>
            <p className="mt-2 text-gray-600">
              {t('login_subtitle', 'Sign in to your account to continue')}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/95 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">


              {/* Email */}
              <div className="relative mt-4">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  {...register('email')}
                  type="email"
                  className={`peer w-full pl-12 pr-4 py-4 border ${errors.email && (dirtyFields.email || submitCount > 0) ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 shadow-sm focus:shadow-lg bg-white text-lg ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder=""
                  disabled={isLoading}
                  autoComplete="username"
                />
                <label
                  htmlFor="email"
                  className={`absolute left-12 text-gray-500 pointer-events-none transition-all duration-200
                    ${getValues('email')
                      ? '-translate-y-8 scale-90 text-blue-600 top-2'
                      : 'top-1/2 -translate-y-1/2 scale-100'}
                    peer-focus:-translate-y-8 peer-focus:scale-90 peer-focus:text-blue-600`}
                >
                  {t('login_email_label', 'Email Address')}
                </label>
                {/* Only show error if field is dirty or form has been submitted */}
                {errors.email && (dirtyFields.email || submitCount > 0) && (
                  <p className="mt-1 text-sm text-red-600 absolute left-0 top-full">
                    {errors.email.message}
                  </p>
                )}
                {!errors.email && emailValue && (
                  <p className="mt-1 text-xs text-green-600 absolute left-0 top-full">{t('login_email_valid', 'Looks good!')}</p>
                )}
              </div>

              {/* Password */}
              <div className="relative mt-4">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`peer w-full pl-12 pr-12 py-4 border ${errors.password && (dirtyFields.password || submitCount > 0) ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 shadow-sm focus:shadow-lg bg-white text-lg ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder=""
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 z-10"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                <label
                  htmlFor="password"
                  className={`absolute left-12 text-gray-500 pointer-events-none transition-all duration-200
                    ${showPassword || passwordFocused
                      ? '-translate-y-8 scale-90 text-blue-600 top-2'
                      : 'top-1/2 -translate-y-1/2 scale-100'}
                    peer-focus:-translate-y-8 peer-focus:scale-90 peer-focus:text-blue-600`}
                >
                  {t('login_password_label', 'Password')}
                </label>
                {/* Only show error if field is dirty or form has been submitted */}
                {errors.password && (dirtyFields.password || submitCount > 0) && (
                  <p className="mt-1 text-sm text-red-600 absolute left-0 top-full">
                    {errors.password.message}
                  </p>
                )}
                {!errors.password && passwordValue && (
                  <p className="mt-1 text-xs text-green-600 absolute left-0 top-full">{t('login_password_valid', 'Looks good!')}</p>
                )}
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading || !isValid || !emailValue || !passwordValue}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-white font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-busy={isLoading}
              >
                <span className="flex items-center space-x-2">
                  <span>{isLoading ? t('login_signing_in', 'Signing in...') : t('login_sign_in', 'Sign in')}</span>
                  {!isLoading && (
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  )}
                </span>
              </motion.button>

              {/* Links */}
              <div className="text-center space-y-2">
                <p className="text-gray-600">
                  {t('login_no_account', "Don't have an account?")}{' '}
                  <Link
                    to="/register"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    {t('login_sign_up_here', 'Sign up here')}
                  </Link>
                </p>
                <p className="text-gray-600">
                  {t('login_forgot_password', 'Forgot your password?')}{' '}
                  <Link
                    to="/reset-password"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    {t('login_reset_password', 'Reset password')}
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-300 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm">
            © {new Date().getFullYear()} Smart Transit. All rights reserved.
          </span>
          <div className="flex gap-6 text-sm">
            <Link
              to="/about"
              className="hover:text-blue-400 transition-colors"
            >
              {t('About Us', 'About')}
            </Link>
            <Link
              to="/contact"
              className="hover:text-blue-400 transition-colors"
            >
              {t('Contact Us', 'Contact')}
            </Link>
            <Link
              to="/privacy"
              className="hover:text-blue-400 transition-colors"
            >
              {t('Privacy Policy', 'Privacy')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LoginForm;
