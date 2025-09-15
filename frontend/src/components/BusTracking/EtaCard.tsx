import React from 'react';
import api from '../../lib/api';
import { useTranslation } from 'react-i18next';

interface EtaCardProps {
  eta: string;
  busNumber: string; // for display only
  busId: string; // document ID for lookups
  nextStop: string;
  location: string;
  status: string;
  driverName: string;
  avgSpeed: string;
  isLive?: boolean;
  lastUpdate?: string;
}

const EtaCard: React.FC<EtaCardProps> = ({ eta, busNumber, busId, nextStop, location, status, driverName, avgSpeed, isLive, lastUpdate }) => {
  // --- Offline cache logic ---
  const CACHE_KEY = `etacard_last_${busId}`;
  
  // Save to cache whenever eta/location updates (and online)
  React.useEffect(() => {
    if (navigator.onLine && eta && location) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ eta, location, nextStop, status, driverName, avgSpeed, lastUpdate }));
    }
  }, [eta, location, nextStop, status, driverName, avgSpeed, lastUpdate, busId]);

  // If offline, load from cache
  const [offlineData, setOfflineData] = React.useState<any>(null);
  React.useEffect(() => {
    function handleOffline() {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) setOfflineData(JSON.parse(cached));
      } catch {}
    }
    function handleOnline() {
      setOfflineData(null);
    }
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    if (!navigator.onLine) handleOffline();
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [busId]);
  const { t } = useTranslation();
  const [resolvedDriverName, setResolvedDriverName] = React.useState(driverName || t('eta_card.na', 'N/A'));
  const [resolvedEta, setResolvedEta] = React.useState(eta);
  const [resolvedAvgSpeed, setResolvedAvgSpeed] = React.useState(avgSpeed);

  // Fetch driver name if not provided
  React.useEffect(() => {
    async function fetchDriver() {
      if (driverName && driverName !== t('eta_card.na', 'N/A')) {
        setResolvedDriverName(driverName);
        return;
      }
      // Use busId directly for lookups
      if (!busId) {
        setResolvedDriverName(t('eta_card.na', 'N/A'));
        return;
      }
      try {
        const busRes = await api.get(`/buses/${busId}`);
        const busData = busRes.data;
        if (busData?.driver && busData.driver.name) {
          setResolvedDriverName(busData.driver.name);
        } else if (busData?.driverId) {
          const userRes = await api.get(`/users/${busData.driverId}`);
          const user = userRes.data;
          if (user && (user.firstName || user.lastName)) {
            setResolvedDriverName(`${user.firstName || ''} ${user.lastName || ''}`.trim() || t('eta_card.na', 'N/A'));
          } else if (user && user.name) {
            setResolvedDriverName(user.name);
          } else {
            setResolvedDriverName(t('eta_card.na', 'N/A'));
          }
        } else {
          setResolvedDriverName(t('eta_card.na', 'N/A'));
        }
      } catch {
        setResolvedDriverName(t('eta_card.na', 'N/A'));
      }
    }
    fetchDriver();
  }, [driverName, busId, t]);

  // Fetch ETA and avgSpeed if not provided
  React.useEffect(() => {
    async function fetchEta() {
      if (eta !== 'N/A' && avgSpeed !== 'N/A') {
        setResolvedEta(eta);
        setResolvedAvgSpeed(avgSpeed);
        return;
      }
      // Use busId directly for lookups
      if (!busId) {
        setResolvedEta('N/A');
        setResolvedAvgSpeed('N/A');
        return;
      }
      try {
        const busRes = await api.get(`/buses/${busId}`);
        const busData = busRes.data;
        if (busData && busData.currentLocation && busData.route) {
          const res = await api.post('/bus-eta', {
            bus_lat: busData.currentLocation.latitude,
            bus_lon: busData.currentLocation.longitude,
            speed: busData.speed,
            route_id: busData.route,
          });
          if (res.data) {
            setResolvedEta(typeof res.data.eta_minutes !== 'undefined' && res.data.eta_minutes !== null ? res.data.eta_minutes + ' min' : 'N/A');
            setResolvedAvgSpeed(res.data.used_speed ? res.data.used_speed + ' km/h' : 'N/A');
          } else {
            setResolvedEta('N/A');
            setResolvedAvgSpeed('N/A');
          }
        } else {
          setResolvedEta('N/A');
          setResolvedAvgSpeed('N/A');
        }
      } catch {
        setResolvedEta('N/A');
        setResolvedAvgSpeed('N/A');
      }
    }
    fetchEta();
  }, [eta, avgSpeed, busId]);

  // Prefer live props, then offline cache
  const showData = navigator.onLine || !offlineData ? { eta: resolvedEta, busNumber, nextStop, location, status, driverName: resolvedDriverName, avgSpeed: resolvedAvgSpeed, lastUpdate, isOffline: false } : { ...offlineData, isOffline: true };

  return (
    <div className="bg-gradient-to-br from-white via-indigo-50 to-white rounded-2xl px-5 py-3 shadow-lg border border-indigo-200 min-w-[220px] w-full max-w-md flex flex-col items-center gap-2">
      <div className="flex flex-row items-center justify-between w-full mb-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full w-8 h-8 text-lg font-bold shadow-md">
            <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3'/></svg>
          </span>
          <span className="text-lg font-extrabold text-indigo-700 tracking-tight drop-shadow">{showData.eta}</span>
          {isLive && !showData.isOffline && (
            <span className="flex items-center ml-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1" title="Live"></span>
              <span className="text-xs text-green-600 font-semibold">{t('eta_card.live', 'Live')}</span>
            </span>
          )}
          {showData.isOffline && (
            <span className="flex items-center ml-2">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1" title="Offline"></span>
              <span className="text-xs text-yellow-600 font-semibold">{t('eta_card.offline', 'Offline')}</span>
            </span>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500 font-semibold uppercase">{t('eta_card.bus', 'Bus')}</span>
          <span className="text-base font-bold text-blue-700">{showData.busNumber}</span>
          {showData.lastUpdate && (
            <span className="text-[10px] text-gray-400 mt-1">{t('eta_card.last_update', 'Updated')}: {new Date(showData.lastUpdate).toLocaleTimeString()}</span>
          )}
        </div>
      </div>
      <div className="w-full flex flex-row items-center justify-between gap-2">
        <div className="flex flex-col items-start">
          <span className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
            <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 17l-5-5m0 0l-5-5m5 5V3'/></svg>
            {t('eta_card.next_stop', 'Next Stop')}
          </span>
          <span className="text-base font-semibold text-gray-800">{showData.nextStop || '-'}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
            <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657A8 8 0 1112 4v4l4 2-4 2v4a8 8 0 005.657-1.343z'/></svg>
            {t('eta_card.location', 'Location')}
          </span>
          <span className="text-base font-semibold text-gray-800">{showData.location || '-'}</span>
        </div>
      </div>
      <div className="w-full flex flex-row items-center justify-between gap-2 mt-1">
        <div className="flex flex-col items-start">
          <span className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
            <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m4 4h-1v-4h-1'/></svg>
            {t('eta_card.status', 'Status')}
          </span>
          <span className="text-base font-semibold text-gray-800">{showData.status}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
            <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7'/></svg>
            {t('eta_card.driver', 'Driver')}
          </span>
          <span className="text-base font-semibold text-gray-800">{showData.driverName}</span>
        </div>
      </div>
      <div className="w-full flex flex-row gap-8 items-center justify-center mt-1">
        <div className="flex flex-col items-center">
          <span className="text-gray-500 text-xs flex items-center gap-1">
            <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m4 4h-1v-4h-1'/></svg>
            {t('eta_card.avg_speed', 'Avg Speed')}
          </span>
          <span className="text-base font-semibold text-gray-800">{showData.avgSpeed}</span>
        </div>
      </div>
    </div>
  );
};

export default EtaCard;
