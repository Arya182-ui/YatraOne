import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, FileText, Send, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  MapPin,
  MessageSquare,
  Package,
  Award,
  Bus,
  TrendingUp,
  Star,
  Target,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { busAPI, achievementsAPI, userDashboardAnalyticsAPI } from '../../lib/api';
import { sosAPI } from '../../lib/api';
import { Link } from 'react-router-dom';

const UserDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // SOS & Incident Report state
  const [showSOS, setShowSOS] = useState(false);
  const [sosMessage, setSOSMessage] = useState('');
  const [sosSending, setSOSSending] = useState(false);
  const [sosSent, setSOSSent] = useState(false);

  const [showIncident, setShowIncident] = useState(false);
  const [incidentType, setIncidentType] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentPhoto, setIncidentPhoto] = useState<File | null>(null);
  const [incidentSending, setIncidentSending] = useState(false);
  const [incidentSent, setIncidentSent] = useState(false);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const [analyticsData] = await Promise.all([
        busAPI.getBuses(),
        achievementsAPI.getAchievements(),
        achievementsAPI.getUserAchievements(user.id),
        userDashboardAnalyticsAPI.getAnalytics(),
      ]);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, [user]);

  const quickActions = [
    {
      icon: MapPin,
      title: 'Track Buses',
      description: 'Real-time bus locations',
      path: '/tracking',
      accent: 'from-blue-400 via-blue-200 to-white',
      iconBg: 'from-blue-500 via-blue-400 to-blue-300',
      text: 'text-blue-700 dark:text-blue-200',
      premium: false,
    },
    {
      icon: MessageSquare,
      title: 'Give Feedback',
      description: 'Share your experience',
      path: '/feedback',
      accent: 'from-cyan-400 via-blue-100 to-white',
      iconBg: 'from-cyan-500 via-blue-400 to-cyan-300',
      text: 'text-cyan-700 dark:text-cyan-200',
      premium: false,
    },
    {
      icon: Package,
      title: 'Lost & Found',
      description: 'Report or find items',
      path: '/lost-found',
      accent: 'from-indigo-400 via-blue-100 to-white',
      iconBg: 'from-indigo-500 via-blue-400 to-indigo-300',
      text: 'text-indigo-700 dark:text-indigo-200',
      premium: false,
    },
    {
      icon: Award,
      title: 'Rewards',
      description: 'Redeem your points',
      path: '/rewards',
      accent: 'from-blue-400 via-cyan-200 to-white',
      iconBg: 'from-blue-500 via-cyan-400 to-blue-300',
      text: 'text-blue-700 dark:text-blue-200',
      premium: true,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400">{t('Loading dashboard...')}</span>
        </div>
      </div>
    );
  }

  // Calculate points change and level progress
  let pointsChange = null;
  let percentToNextLevel = null;
  if (analytics) {
    // Example: analytics.last_month_points, analytics.points
    if (typeof analytics.last_month_points === 'number' && typeof analytics.points === 'number') {
      const diff = analytics.points - analytics.last_month_points;
      if (analytics.last_month_points > 0) {
        pointsChange = ((diff / analytics.last_month_points) * 100).toFixed(1);
      } else if (analytics.points > 0) {
        pointsChange = '100';
      } else {
        pointsChange = '0';
      }
    }
    if (typeof analytics.level_progress === 'number') {
      percentToNextLevel = Math.round(analytics.level_progress * 100);
    }
  }

  return (
  <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-purple-100 to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 p-4 sm:p-6 lg:p-8 overflow-x-hidden font-sans">
      {/* Animated background gradient waves */}
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
  <div className="max-w-7xl mx-auto relative z-10">
        <div className="fixed z-50 bottom-8 right-8 flex flex-col gap-6 items-end">
          {/* Modern, dark SOS Button */}
          <button
            onClick={() => setShowSOS(true)}
            className="w-20 h-20 flex items-center justify-center rounded-3xl bg-gradient-to-br from-blue-900 via-blue-700 to-blue-800 text-red-400 shadow-2xl border-2 border-blue-900/60 dark:border-blue-800/80 backdrop-blur-xl hover:scale-105 hover:shadow-[0_8px_32px_0_rgba(30,58,138,0.25)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-800 relative group overflow-hidden"
            title={t('Send SOS')}
            style={{boxShadow: '0 8px 32px 0 rgba(30,58,138,0.18)'}}
          >
            {/* Icon with bold glow */}
            <span className="absolute inset-0 bg-gradient-to-br from-red-700/40 via-blue-900/10 to-blue-700/20 blur-2xl opacity-80 z-0" />
            <AlertTriangle className="w-11 h-11 z-10 drop-shadow-xl animate-pulse text-red-400" />
            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1 bg-blue-900/90 text-white text-xs rounded shadow opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap border border-blue-800">{t('Send SOS')}</span>
          </button>
          {/* Modern, dark Incident Report Button */}
          <button
            onClick={() => setShowIncident(true)}
            className="w-20 h-20 flex items-center justify-center rounded-3xl bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-700 text-yellow-400 shadow-2xl border-2 border-blue-900/60 dark:border-blue-800/80 backdrop-blur-xl hover:scale-105 hover:shadow-[0_8px_32px_0_rgba(202,138,4,0.22)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-yellow-700 relative group overflow-hidden"
            title={t('Report Incident')}
            style={{boxShadow: '0 8px 32px 0 rgba(202,138,4,0.15)'}}
          >
            {/* Icon with bold glow */}
            <span className="absolute inset-0 bg-gradient-to-br from-yellow-600/40 via-blue-900/10 to-blue-700/20 blur-2xl opacity-80 z-0" />
            <FileText className="w-11 h-11 z-10 drop-shadow-xl animate-pulse text-yellow-400" />
            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1 bg-blue-900/90 text-yellow-200 text-xs rounded shadow opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap border border-yellow-700">{t('Report Incident')}</span>
          </button>
        </div>

        {/* SOS Modal */}
        {showSOS && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <button onClick={() => setShowSOS(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">✕</button>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600 dark:text-red-400"><AlertTriangle /> {t('Send SOS')}</h2>
              {sosSent ? (
                <div className="text-green-600 font-semibold text-center py-8">{t('SOS sent successfully!')}</div>
              ) : (
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    setSOSSending(true);
                    if (!user) return;
                    try {
                      await sosAPI.sendSOS({ user_id: user.id, message: sosMessage });
                      setSOSSending(false);
                      setSOSSent(true);
                      setTimeout(() => { setShowSOS(false); setSOSSent(false); setSOSMessage(''); }, 1500);
                    } catch {
                      setSOSSending(false);
                      alert(t('Failed to send SOS. Please try again.'));
                    }
                  }}
                  className="space-y-4"
                >
                  <textarea
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={4}
                    placeholder={t('Describe your emergency (optional)')}
                    value={sosMessage}
                    onChange={e => setSOSMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-base disabled:opacity-60"
                    disabled={sosSending}
                  >
                    <Send className="w-4 h-4" /> {sosSending ? t('Sending...') : t('Send SOS')}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Incident Report Modal */}
        {showIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <button onClick={() => setShowIncident(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">✕</button>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-600 dark:text-yellow-400"><FileText /> {t('Report Incident')}</h2>
              {incidentSent ? (
                <div className="text-green-600 font-semibold text-center py-8">{t('Incident reported successfully!')}</div>
              ) : (
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    setIncidentSending(true);
                    if (!user) return;
                    try {
                      const formData = new FormData();
                      formData.append('user_id', user.id);
                      formData.append('type', incidentType);
                      formData.append('description', incidentDesc);
                      if (incidentPhoto) formData.append('photo', incidentPhoto);
                      const res = await sosAPI.sendIncident(formData);
                      setIncidentSending(false);
                      setIncidentSent(true);
                      // Show toast for success
                      import('react-hot-toast').then(({ toast }) => toast.success(t('Incident reported successfully!')));
                      setTimeout(() => {
                        setShowIncident(false);
                        setIncidentSent(false);
                        setIncidentType('');
                        setIncidentDesc('');
                        setIncidentPhoto(null);
                      }, 1500);
                    } catch (err) {
                      setIncidentSending(false);
                      import('react-hot-toast').then(({ toast }) => toast.error(t('Failed to report incident. Please try again.')));
                    }
                  }}
                  className="space-y-4"
                >
                  <select
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={incidentType}
                    onChange={e => setIncidentType(e.target.value)}
                    required
                  >
                    <option value="">{t('Select Incident Type')}</option>
                    <option value="harassment">{t('Harassment')}</option>
                    <option value="theft">{t('Theft')}</option>
                    <option value="accident">{t('Accident')}</option>
                    <option value="medical">{t('Medical Emergency')}</option>
                    <option value="other">{t('Other')}</option>
                  </select>
                  <textarea
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={4}
                    placeholder={t('Describe the incident...')}
                    value={incidentDesc}
                    onChange={e => setIncidentDesc(e.target.value)}
                    required
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Camera className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{t('Attach Photo (optional)')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => setIncidentPhoto(e.target.files?.[0] || null)}
                    />
                  </label>
                  {incidentPhoto && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{incidentPhoto.name}</div>
                  )}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold text-base disabled:opacity-60"
                    disabled={incidentSending}
                  >
                    <Send className="w-4 h-4" /> {incidentSending ? t('Reporting...') : t('Report Incident')}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 flex flex-col md:flex-row items-center md:items-end gap-12"
        >
          <div className="relative flex-shrink-0 group">
            {/* Animated avatar ring with glow and glass reflection */}
            <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 shadow-2xl flex items-center justify-center border-8 border-transparent animate-spin-slow relative before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-tr before:from-blue-300/40 before:via-purple-300/30 before:to-pink-300/20 before:blur-xl before:z-0 group-hover:scale-105 group-hover:shadow-[0_0_48px_12px_rgba(99,102,241,0.25)] transition-all duration-300">
              <div className="w-36 h-36 rounded-full bg-white/90 dark:bg-gray-900/80 flex items-center justify-center z-10 relative shadow-2xl group-hover:shadow-[0_0_40px_10px_rgba(168,85,247,0.18)] transition-all duration-300 overflow-hidden">
                {user?.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.firstName || 'User'}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 select-none animate-gradient-text">
                    {user?.firstName?.[0] ?? 'U'}
                  </span>
                )}
              </div>
              {/* Glass reflection */}
              <div className="absolute left-7 top-7 w-28 h-8 bg-white/30 rounded-full blur-md rotate-[-18deg] opacity-60 pointer-events-none"></div>
            </div>
            <span className="absolute bottom-2 right-2 bg-green-500 border-4 border-white dark:border-gray-900 w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">●</span>
          </div>
          <div>
            <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 mb-4 tracking-tight drop-shadow-2xl animate-gradient-text">
              {t('Welcome back, {{name}}! 👋', { name: user?.firstName })}
            </h1>
            <p className="text-2xl text-gray-700 dark:text-gray-300 font-medium max-w-2xl">
              {t("Here's what's happening with your Smart Bus experience today.")}
            </p>
          </div>
        </motion.div>

        {/* Stats Cards (from backend analytics) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-20"
        >
          {/* Stat Card - Total Points */}
          <div className="relative group rounded-3xl overflow-hidden shadow-2xl border border-indigo-100 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:scale-[1.05] hover:shadow-[0_8px_40px_0_rgba(99,102,241,0.10)] transition-transform duration-300">
            <div className="relative z-10 p-10 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-1 font-semibold tracking-wide">{t('Total Points')}</p>
                  <p className="text-5xl font-extrabold text-gray-900 dark:text-white drop-shadow-xl animate-bounce-slow">{analytics?.points ?? 0}</p>
                </div>
                <div className="p-6 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl animate-spin-slow">
                  <Star className="w-9 h-9 text-white" />
                </div>
              </div>
              <div className="mt-8 flex items-center text-xl text-green-600 dark:text-green-400 font-bold">
                <TrendingUp className="w-6 h-6 mr-2" />
                {pointsChange !== null
                  ? t('{{val}}% from last month', { val: pointsChange })
                  : t('No data for last month')}
              </div>
            </div>
          </div>
          {/* Stat Card - Current Level */}
          <div className="relative group rounded-3xl overflow-hidden shadow-2xl border border-indigo-100 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:scale-[1.05] hover:shadow-[0_8px_40px_0_rgba(99,102,241,0.10)] transition-transform duration-300">
            <div className="relative z-10 p-10 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-1 font-semibold tracking-wide">{t('Current Level')}</p>
                  <p className="text-5xl font-extrabold text-gray-900 dark:text-white drop-shadow-xl animate-bounce-slow">{analytics?.level ?? 1}</p>
                </div>
                <div className="p-6 bg-gradient-to-tr from-green-500 via-blue-500 to-purple-500 rounded-2xl shadow-xl animate-spin-slow">
                  <Target className="w-9 h-9 text-white" />
                </div>
              </div>
              <div className="mt-8">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 h-4 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${percentToNextLevel ?? 0}%` }}
                  ></div>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 font-bold">
                  {percentToNextLevel !== null
                    ? t('{{val}}% to next level', { val: percentToNextLevel })
                    : t('No progress data')}
                </p>
              </div>
            </div>
          </div>
          {/* Stat Card - Active Buses */}
          <div className="relative group rounded-3xl overflow-hidden shadow-2xl border border-indigo-100 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:scale-[1.05] hover:shadow-[0_8px_40px_0_rgba(99,102,241,0.10)] transition-transform duration-300">
            <div className="relative z-10 p-10 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-1 font-semibold tracking-wide">{t('Active Buses')}</p>
                  <p className="text-5xl font-extrabold text-gray-900 dark:text-white drop-shadow-xl animate-bounce-slow">
                    {analytics?.active_buses ?? 0}
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-tr from-orange-500 via-pink-500 to-yellow-400 rounded-2xl shadow-xl animate-spin-slow">
                  <Bus className="w-9 h-9 text-white" />
                </div>
              </div>
              <div className="mt-8 text-xl text-gray-600 dark:text-gray-400 font-bold">
                {t('Out of {{count}} total buses', { count: analytics?.total_buses ?? 0 })}
              </div>
            </div>
          </div>
          {/* Stat Card - Achievements */}
          <div className="relative group rounded-3xl overflow-hidden shadow-2xl border border-indigo-100 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:scale-[1.05] hover:shadow-[0_8px_40px_0_rgba(99,102,241,0.10)] transition-transform duration-300">
            <div className="relative z-10 p-10 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-1 font-semibold tracking-wide">{t('Achievements')}</p>
                  <p className="text-5xl font-extrabold text-gray-900 dark:text-white drop-shadow-xl animate-bounce-slow">
                    {analytics?.completed_achievements ?? 0}
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-tr from-purple-500 via-pink-500 to-blue-500 rounded-2xl shadow-xl animate-spin-slow">
                  <Award className="w-9 h-9 text-white" />
                </div>
              </div>
              <div className="mt-8 text-xl text-gray-600 dark:text-gray-400 font-bold">
                {t('Out of {{count}} total', { count: analytics?.total_achievements ?? 0 })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('Quick Actions')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.path}
                  className="group"
                >
                  <motion.div
                    whileHover={{ scale: 1.08, y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative rounded-3xl shadow-2xl border border-blue-100 dark:border-blue-900/40 p-8 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl transition-all duration-200 flex flex-col items-center overflow-hidden hover:shadow-[0_8px_40px_0_rgba(59,130,246,0.10)] group-hover:ring-2 group-hover:ring-blue-300`}
                  >
                    {/* Glassy gradient background accent */}
                    <div className={`absolute inset-0 z-0 bg-gradient-to-br ${action.accent} opacity-60 blur-[2px] pointer-events-none`} />
                    {/* Glass reflection */}
                    <div className="absolute left-6 top-6 w-24 h-6 bg-white/30 rounded-full blur-md rotate-[-18deg] opacity-50 pointer-events-none z-10"></div>
                    {/* Icon */}
                    <div className={`relative z-20 p-6 rounded-full mb-4 bg-gradient-to-tr ${action.iconBg} shadow-xl border-4 border-white dark:border-gray-900 animate-bounce-slow`}>
                      <Icon className="w-14 h-14 text-white drop-shadow-lg" />
                    </div>
                    {/* Title */}
                    <h3 className={
                      'relative z-20 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-blue-700 via-blue-500 to-cyan-400 dark:from-blue-200 dark:via-blue-400 dark:to-cyan-300 mb-2 text-center drop-shadow'}>
                      {t(action.title)}
                    </h3>
                    {/* Description */}
                    <p className={`relative z-20 text-lg text-center font-semibold mb-1 ${action.text}`}>
                      {t(action.description)}
                    </p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>

  {/* Content Grid removed as per user request */}
      </div>
    </div>
  );
};

export default UserDashboard;