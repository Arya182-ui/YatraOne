import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Loader2, User } from 'lucide-react';
import debounce from 'lodash.debounce';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logoUrl from '/logo.png';

const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const nameLimit = 50;
  const messageLimit = 500;

  const { t } = useTranslation();

  // Email validation regex (simple)
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isFormValid =
    name.trim().length > 0 &&
    isValidEmail(email) &&
    message.trim().length > 0;

  const debouncedSubmit = useCallback(
    debounce(async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message }),
        });

        if (!res.ok)
          throw new Error(t('contactform_error_failed', 'Failed to send message'));

        toast.success(
          t(
            'contactform_success',
            'Message sent! We will get back to you soon.'
          )
        );
        setName('');
        setEmail('');
        setMessage('');
      } catch (err: any) {
        toast.error(
          err.message ||
            t('contactform_error_failed', 'Failed to send message')
        );
      } finally {
        setLoading(false);
      }
    }, 500, { leading: true, trailing: false }),
    [name, email, message, t]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) debouncedSubmit();
  };

  const floatingLabelClass = (value: string) =>
    `absolute left-10 transition-all duration-200 pointer-events-none ${
      value
        ? '-top-2 text-sm text-blue-600'
        : 'top-3 text-gray-400 text-base'
    }`;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-100 to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Animated glassy gradient background, like Login/Register */}
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
      {/* Spacing below navbar */}
      <div className="w-full" style={{ height: '96px' }} />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <Toaster position="top-center" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-8"
        >
          <div className="text-center">
            <img
              src={logoUrl}
              alt="Logo"
              className="h-16 w-auto mb-2 mx-auto drop-shadow-lg"
            />
            <h2 className="text-3xl font-bold text-gray-900">
              {t('contactform_title', 'Contact Us')}
            </h2>
            <p className="mt-2 text-gray-600">
              {t(
                'contactform_subtitle',
                "We'd love to hear from you! Fill out the form below and our team will get back to you soon."
              )}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="relative">
                <label className={floatingLabelClass(name)}>
                  {t('contactform_name_placeholder', 'Your Name')}
                </label>
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-3 border ${
                    name ? 'border-green-400' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white transition-colors pr-20 ${
                    loading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, nameLimit))}
                  required
                  placeholder=" "
                  maxLength={nameLimit}
                  disabled={loading}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {name.length}/{nameLimit}
                </span>
              </div>

              {/* Email */}
              <div className="relative">
                <label className={floatingLabelClass(email)}>
                  {t('contactform_email_placeholder', 'Your Email')}
                </label>
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  className={`w-full pl-10 pr-4 py-3 border ${
                    email ? (isValidEmail(email) ? 'border-green-400' : 'border-red-400') : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white transition-colors ${
                    loading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder=" "
                  disabled={loading}
                />
                {/* Email validation error */}
                {email && !isValidEmail(email) && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-500">
                    {t('contactform_email_invalid', 'Invalid email')}
                  </span>
                )}
              </div>

              {/* Message */}
              <div className="relative">
                <label className={floatingLabelClass(message)}>
                  {t('contactform_message_placeholder', 'Your Message')}
                </label>
                <MessageCircle className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
                <textarea
                  className={`w-full pl-10 pr-4 py-3 border ${
                    message.length > 0 ? 'border-green-400' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white transition-colors pr-20 resize-none ${
                    loading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value.slice(0, messageLimit))
                  }
                  required
                  rows={5}
                  placeholder=" "
                  maxLength={messageLimit}
                  disabled={loading}
                />
                <span className="absolute right-3 bottom-3 text-xs text-gray-400">
                  {message.length}/{messageLimit}
                </span>
              </div>

              <motion.button
                type="submit"
                disabled={loading || !isFormValid}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold focus:ring-4 focus:ring-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                aria-busy={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {loading
                  ? t('contactform_sending', 'Sending...')
                  : t('contactform_send', 'Send Message')}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactForm;
