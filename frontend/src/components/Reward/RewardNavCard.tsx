
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const RewardNavCard: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="relative overflow-hidden rounded-3xl group">
      {/* Animated glassy gradient background */}
      <div className="pointer-events-none select-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[120%] h-40 bg-gradient-to-r from-yellow-200/40 via-pink-100/30 to-amber-100/40 blur-2xl animate-gradient-wave rounded-full"></div>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-30 animate-pulse"
            style={{
              width: `${16 + Math.random() * 18}px`,
              height: `${16 + Math.random() * 18}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle at 50% 50%, #fff7, #fff0 70%)`,
              filter: 'blur(1.5px)',
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      <div className="relative z-10 bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl border border-yellow-200 dark:border-yellow-700 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4 hover:scale-[1.04] transition-transform duration-200">
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-amber-300 to-pink-300 dark:from-yellow-600 dark:via-yellow-700 dark:to-pink-700 shadow-xl mb-2 border-4 border-white dark:border-gray-900">
          <span className="material-symbols-rounded text-6xl text-yellow-100 drop-shadow-lg">stars</span>
        </div>
        <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-yellow-500 via-amber-500 to-pink-500 dark:from-yellow-300 dark:via-yellow-400 dark:to-pink-300 mb-1 tracking-tight drop-shadow">{t('Rewards')}</div>
        <div className="text-lg font-semibold text-gray-800 dark:text-yellow-200 mb-2">{t('Earn & Redeem Points')}</div>
        <p className="text-gray-600 dark:text-gray-200 text-base mb-2 text-center max-w-xs font-medium">{t('Check your points and earn more by using the app!')}</p>
        <Link to="/rewards" className="px-8 py-3 bg-gradient-to-r from-yellow-400 via-amber-400 to-pink-400 text-white rounded-full shadow-xl hover:from-yellow-500 hover:to-pink-500 transition font-bold text-lg mt-2 ring-2 ring-yellow-200 dark:ring-yellow-700">
          {t('View Rewards')}
        </Link>
      </div>
    </div>
  );
};

export default RewardNavCard;
