import React from 'react';
import { useTranslation } from 'react-i18next';

interface EtaCardProps {
  eta: string;
  busNumber: string;
  nextStop: string;
  location: string;
  status: string;
  driverName: string;
  avgSpeed: string;
}

const EtaCard: React.FC<EtaCardProps> = ({ eta, busNumber, nextStop, location, status, driverName, avgSpeed }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-gradient-to-br from-white via-indigo-50 to-white rounded-2xl px-5 py-3 shadow-lg border border-indigo-200 min-w-[220px] w-full max-w-md flex flex-col items-center gap-2">
      <div className="flex flex-row items-center justify-between w-full mb-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full w-8 h-8 text-lg font-bold shadow-md">
            <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3'/></svg>
          </span>
          <span className="text-lg font-extrabold text-indigo-700 tracking-tight drop-shadow">{eta}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500 font-semibold uppercase">{t('eta_card.bus', 'Bus')}</span>
          <span className="text-base font-bold text-blue-700">{busNumber}</span>
        </div>
      </div>
      <div className="w-full flex flex-row items-center justify-between gap-2">
        <div className="flex flex-col items-start">
          <span className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
            <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 17l-5-5m0 0l-5-5m5 5V3'/></svg>
            {t('eta_card.next_stop', 'Next Stop')}
          </span>
          <span className="text-base font-semibold text-gray-800">{nextStop || '-'}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
            <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657A8 8 0 1112 4v4l4 2-4 2v4a8 8 0 005.657-1.343z'/></svg>
            {t('eta_card.location', 'Location')}
          </span>
          <span className="text-base font-semibold text-gray-800">{location || '-'}</span>
        </div>
      </div>
      <div className="w-full flex flex-row items-center justify-between gap-2 mt-1">
        <div className="flex flex-col items-start">
          <span className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
            <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m4 4h-1v-4h-1'/></svg>
            {t('eta_card.status', 'Status')}
          </span>
          <span className="text-base font-semibold text-gray-800">{status}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
            <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7'/></svg>
            {t('eta_card.driver', 'Driver')}
          </span>
          <span className="text-base font-semibold text-gray-800">{driverName || t('eta_card.na', 'N/A')}</span>
        </div>
      </div>
      <div className="w-full flex flex-row gap-8 items-center justify-center mt-1">
        <div className="flex flex-col items-center">
          <span className="text-gray-500 text-xs flex items-center gap-1">
            <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m4 4h-1v-4h-1'/></svg>
            {t('eta_card.avg_speed', 'Avg Speed')}
          </span>
          <span className="text-base font-semibold text-gray-800">{avgSpeed}</span>
        </div>
      </div>
    </div>
  );
};

export default EtaCard;
