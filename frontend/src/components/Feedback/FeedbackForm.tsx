import Confetti from 'react-confetti';
import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { feedbackAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '/logo.png';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import debounce from 'lodash.debounce';
import { Mail, MessageCircle, List, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type FeedbackType = 'complaint' | 'suggestion' | 'compliment' | 'accessibility' | 'safety' | 'other';

const FeedbackForm: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const subjectLimit = 80;
  const messageLimit = 500;
  const [type, setType] = useState<FeedbackType | "">("");

  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  // Remove local error/success state, use toast only
  const navigate = useNavigate();
  const { user } = useAuth();

  const { t } = useTranslation();
  // Floating label class helper
  const floatingLabelClass = (value: string) =>
    `absolute left-10 transition-all duration-200 pointer-events-none ${value ? '-top-2 text-sm text-green-600' : 'top-3 text-gray-400 text-base'
    }`;

  // Debounced submit handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSubmit = useCallback(
    debounce(async () => {
      setLoading(true);
      if (!user) {
        toast.error(t('feedbackform_error_login', 'You must be logged in to submit feedback.'));
        setLoading(false);
        return;
      }
      try {
        const feedbackPayload = {
          user_id: user.id,
          type: type as any,
          subject,
          message,
          priority: 'medium', // or set as needed: 'low' | 'medium' | 'high' | 'urgent'
          attachments: [],    // or set as needed
        };
        await feedbackAPI.submitFeedback(feedbackPayload);
  toast.success(t('feedbackform_success', 'Feedback submitted successfully!'));
        setSubject('');
        setMessage('');
        setType('complaint');
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (err: any) {
  toast.error(t('feedbackform_error_failed', 'Failed to submit feedback. Please try again.'));
      } finally {
        setLoading(false);
      }
    }, 500, { leading: true, trailing: false }),
    [user, type, subject, message, navigate]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) debouncedSubmit();
  };

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
      {/* Navbar */}
      <div className="w-full z-50">
        {/* Optionally add a public nav here if needed */}
      </div>
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <Toaster position="top-center" />
        {/* Glassmorphism effect only behind the form card */}
        {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-8 relative z-10"
        >
          <div className="text-center">
            <Link to="/dashboard" className="inline-flex items-center space-x-2 mb-6">
              <img src={Logo} alt="YatraOne Logo" className="h-16 w-auto mb-2 inline-block drop-shadow-lg" />
            </Link>
            {/* Step Indicator */}
            <div className="flex justify-center gap-2 mb-4">
              <div className={`h-2 w-8 rounded-full bg-green-600 transition-all`} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{t('feedbackform_title', 'Submit Feedback')}</h2>
            <p className="mt-2 text-gray-600">{t('feedbackform_subtitle', 'We value your feedback to improve our service')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <List className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className={`w-full pl-10 pr-4 py-3 border ${type ? 'border-green-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-colors appearance-none ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                value={type}
                onChange={e => setType(e.target.value as FeedbackType)}
                required
                disabled={loading}
              >
                <option value="" disabled>
                  {t('feedbackform_type_placeholder', 'Type (please select the type of feedback)')}
                </option>
                <option value="complaint">🚩 {t('feedbackform_type_complaint', 'Complaint')}</option>
                <option value="suggestion">💡 {t('feedbackform_type_suggestion', 'Suggestion')}</option>
                <option value="compliment">🎉 {t('feedbackform_type_compliment', 'Compliment')}</option>
                <option value="accessibility">♿ {t('feedbackform_type_accessibility', 'Accessibility')}</option>
                <option value="safety">🛡️ {t('feedbackform_type_safety', 'Safety')}</option>
                <option value="other">📝 {t('feedbackform_type_other', 'Other')}</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</span>
            </div>

            <div className="relative">
              <label className={floatingLabelClass(subject)}>{t('feedbackform_subject_label', 'Subject *')}</label>
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className={`w-full pl-10 pr-4 py-3 border ${subject.length > 0 ? 'border-green-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-colors pr-20 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                value={subject}
                onChange={e => setSubject(e.target.value.slice(0, subjectLimit))}
                required
                placeholder={t('feedbackform_subject_placeholder', 'Enter subject')}
                maxLength={subjectLimit}
                disabled={loading}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{subject.length}/{subjectLimit}</span>
            </div>
            <div className="relative">
              <label className={floatingLabelClass(message)}>{t('feedbackform_message_label', 'Message *')}</label>
              <MessageCircle className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
              <textarea
                className={`w-full pl-10 pr-4 py-3 border ${message.length > 0 ? 'border-green-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-colors pr-20 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, messageLimit))}
                required
                rows={5}
                placeholder={t('feedbackform_message_placeholder', 'Enter your message')}
                maxLength={messageLimit}
                disabled={loading}
              />
              <span className="absolute right-3 bottom-3 text-xs text-gray-400">{message.length}/{messageLimit}</span>
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold focus:ring-4 focus:ring-green-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              aria-busy={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? t('feedbackform_submitting', 'Submitting...') : t('feedbackform_submit', 'Submit Feedback')}
            </motion.button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-block px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors border border-gray-200 mt-2"
            >
              &larr; {t('feedbackform_back_dashboard', 'Back to Dashboard')}
            </button>
          </div>
        </motion.div>
      </div>
      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-300 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm">© {new Date().getFullYear()} Smart Transit. All rights reserved.</span>
          <div className="flex gap-6 text-sm">
            <Link to="/about" className="hover:text-green-400 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-green-400 transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-green-400 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeedbackForm;
