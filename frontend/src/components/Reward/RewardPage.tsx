import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';

const RewardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get(`/users/${user.id}/rewards`).then(res => {
      setPoints(res.data.points || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

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
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-2xl w-full mx-auto mt-14 mb-24 bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-green-200 dark:border-green-800 p-10 text-center animate-fade-in flex flex-col items-center gap-6 relative z-10">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-green-400/80 to-blue-400/70 dark:from-green-700/70 dark:to-blue-700/60 shadow-lg mb-2">
            <span className="material-symbols-rounded text-6xl text-white drop-shadow">★</span>
          </div>
          <h1 className="text-4xl font-extrabold mb-2 text-blue-800 dark:text-blue-200 tracking-tight">{t('reward.points_title', 'Your Reward Points')}</h1>
          {loading ? (
            <div className="text-2xl text-gray-500 font-semibold">{t('common.loading', 'Loading...')}</div>
          ) : (
            <div className="text-7xl font-extrabold text-green-600 dark:text-green-300 mb-2 drop-shadow-lg tracking-tight">{points}</div>
          )}
          <div className="text-lg text-gray-700 dark:text-gray-300 mt-2 font-medium">{t('reward.earn_points_hint', 'Earn points by reporting Lost & Found, commenting, or using the app more!')}</div>
          <div className="mt-8 text-base text-gray-400 dark:text-gray-500 italic">{t('reward.more_coming_soon', 'More games and rewards coming soon!')}</div>
        </div>
      </div>
    </div>
  );
};

export default RewardPage;
