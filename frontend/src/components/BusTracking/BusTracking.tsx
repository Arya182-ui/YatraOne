// BusTrackingDashboard.tsx
// New dashboard layout as per requirements
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  MapPin,
  Bus,
  Clock,
  Users,
  Navigation,
  RefreshCw,
  Search,
  CheckCircle,
  // ChevronDoubleDown, // Not available in lucide-react
  // ChevronDoubleUp,   // Not available in lucide-react
} from 'lucide-react';
import { busAPI, routeAPI, userAPI, reverseGeocodeAPI } from '../../lib/api';
import { Bus as BusType, Route, User } from '../../types';
import LiveBusMap from './LiveBusMap';
import MobileBusMap from './MobileBusMap';
import EtaCard from './EtaCard';
import { useEtaCardData } from './useEtaCardData';

async function reverseGeocode(lat: number, lon: number) {
  if (!lat || !lon) return null;
  try {
    const data = await reverseGeocodeAPI.getAddress(lat, lon);
    if (data.address) {
      const name =
        data.address.bus_station ||
        data.address.suburb ||
        data.address.town ||
        data.address.city ||
        data.address.village ||
        "";
      let district = data.address.county || data.address.state_district || "";
      const state = data.address.state || "";
      const country = data.address.country || "";
      if (name && district && name.toLowerCase() === district.toLowerCase()) {
        district = "";
      }
      return [name, district, state, country].filter(Boolean).join(", ");
    }
    return data.display_name;
  } catch (err) {
    console.error("Reverse geocode error:", err);
    return null;
  }
}

const BusTrackingDashboard: React.FC = () => {
  const { t } = useTranslation();
  // State for buses, routes, filters, selection
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('all');
  const [selectedBusId, setSelectedBusId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');


  // Fetch buses and routes
  useEffect(() => {
    setLoading(true);
    Promise.all([
      busAPI.getBuses(),
      routeAPI.getRoutes(),
      userAPI.getDrivers(),
    ]).then(([busList, routeList, driverList]) => {
      setBuses(busList);
      setRoutes(routeList);
      setDrivers(driverList);
      // No auto-select
    }).finally(() => setLoading(false));
  }, []);



  // Filtered buses: only those on selected route (if any)
  const filteredBuses = buses.filter(bus => {
    const statusMatch = selectedStatus === 'all' || bus.status === selectedStatus;
    const routeMatch = selectedRouteId === 'all' || (bus.routeIds && bus.routeIds.includes(selectedRouteId));
    const searchMatch =
      !search ||
      (bus.busNumber && bus.busNumber.toLowerCase().includes(search.toLowerCase())) ||
      (bus.route && bus.route.toLowerCase().includes(search.toLowerCase()));
    return statusMatch && routeMatch && searchMatch;
  });

  // Selected route and bus
  const selectedRoute = routes.find(r => r.id === (selectedRouteId !== 'all' ? selectedRouteId : (buses.find(b => b.busNumber === selectedBusId)?.routeIds?.[0] || ''))) || null;
  // Only allow selecting a bus if a route is selected
  const busesForSelectedRoute = selectedRouteId !== 'all' ? buses.filter(b => b.routeIds && b.routeIds.includes(selectedRouteId)) : [];
  const selectedBus = buses.find(b => b.busNumber === selectedBusId) || null;
  // Find driver for selectedBus
  const selectedDriver = selectedBus && selectedBus.driverId ? drivers.find(d => d.id === selectedBus.driverId) : null;

  // Clear selectedBusId when route changes, but do not auto-select any bus
  useEffect(() => {
    setSelectedBusId('');
  }, [selectedRouteId]);

  // Stats
  const totalBuses = buses.length;
  const activeBuses = buses.filter(b => b.status === 'active').length;
  const avgDelay = buses.length ? `${Math.round(buses.reduce((acc, b) => acc + (b.status === 'delayed' ? 3 : 0), 0) / buses.length)} min` : '0 min';
  const avgLoad = buses.length ? `${Math.round(buses.reduce((acc, b) => acc + (b.currentOccupancy / b.capacity) * 100, 0) / buses.length)}%` : '0%';

  // --- ETA Card Data for mobile ---
  const etaCardData = useEtaCardData(selectedBus, selectedRoute);

  // WebSocket for live bus location
  const ws = useRef<WebSocket | null>(null);
  useEffect(() => {
    if (!selectedBusId) return;
    ws.current = new WebSocket(`ws://localhost:8000/ws/bus-location/${selectedBusId}`);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Update your map marker or state here
      console.log("Location update:", data);
      // Optionally, you can fetch the updated bus data and update the state
      // busAPI.getBuses().then(updatedBuses => setBuses(updatedBuses));
    };

    return () => {
      ws.current && ws.current.close();
    };
  }, [selectedBusId]);


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
      {/* Main Content (no sidebar) */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="bg-white shadow flex items-center px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-indigo-700 mr-8">{t('bus_tracking.dashboard_title', 'Bus Tracking Dashboard')}</h1>
          <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3 md:gap-4 flex-wrap">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('bus_tracking.search_placeholder', 'Search bus, route...')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-[#f8f9fa] focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-800 text-base"
              />
            </div>
            <div className="w-full md:w-auto flex flex-col md:flex-row gap-3 md:gap-2">
              <StatusFilterDropdown value={selectedStatus} onChange={setSelectedStatus} />
              <RouteFilterDropdown routes={routes} value={selectedRouteId} onChange={setSelectedRouteId} />
              {selectedRouteId !== 'all' && (
                <div className="w-full md:w-auto">
                  {busesForSelectedRoute.length > 0 ? (
                    <select
                      className="w-full md:w-auto px-3 py-3 border border-gray-200 rounded-lg bg-[#f8f9fa] text-gray-700 focus:ring-2 focus:ring-indigo-400 mt-2 md:mt-0 text-base"
                      value={selectedBusId}
                      onChange={e => setSelectedBusId(e.target.value)}
                    >
                      <option value="">{t('bus_tracking.select_bus', 'Select Bus')}</option>
                      {busesForSelectedRoute.map(bus => {
                        const driver = drivers.find(d => d.id === bus.driverId);
                        return (
                          <option key={bus.id} value={bus.busNumber}>
                            {bus.busNumber} | {bus.status?.toUpperCase() || '-'}
                            {driver ? ` | Driver: ${driver.firstName} ${driver.lastName}` : ''}
                            {typeof bus.currentOccupancy === 'number' && typeof bus.capacity === 'number' ? ` | ${bus.currentOccupancy}/${bus.capacity}` : ''}
                          </option>
                        );
                      })}
                    </select>
                  ) : <span className="text-gray-400 ml-2">{t('bus_tracking.no_buses_for_route', 'No buses for this route')}</span>}
                </div>
              )}
            </div>
            <button
              className="w-full md:w-auto flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-base"
              onClick={() => {
                setLoading(true);
                Promise.all([
                  busAPI.getBuses(),
                  routeAPI.getRoutes(),
                ]).then(([busList, routeList]) => {
                  setBuses(busList);
                  setRoutes(routeList);
                }).finally(() => setLoading(false));
              }}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t('bus_tracking.refresh', 'Refresh')}
            </button>
          </div>
        </header>
        {/* Stats Overview */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
          <StatsCard icon={<Bus className="text-indigo-500" />} label={t('bus_tracking.total_buses', 'Total Buses')} value={totalBuses} />
          <StatsCard icon={<CheckCircle className="text-green-500" />} label={t('bus_tracking.active_buses', 'Active Buses')} value={activeBuses} />
          <StatsCard icon={<Clock className="text-orange-500" />} label={t('bus_tracking.avg_delay', 'Avg Delay')} value={avgDelay} />
          <StatsCard icon={<Users className="text-blue-500" />} label={t('bus_tracking.passenger_load', 'Passenger Load')} value={avgLoad} />
        </section>
        <main className="flex-1 flex flex-col md:flex-row gap-6 px-6 pb-6">
          {/* Map Section - Google Maps like card, clean and modern */}
          <section className="flex-1 flex flex-col">
            {/* ETA Card for mobile, above map */}
            {selectedRouteId !== 'all' && selectedBusId && (
              <div className="block md:hidden w-full flex justify-center mb-4">
                <EtaCard
                  eta={etaCardData.eta}
                  busNumber={selectedBus?.busNumber || selectedBusId}
                  nextStop={etaCardData.upcomingStop}
                  location={etaCardData.busAddress}
                  status={(() => {
                    if (etaCardData.busStatus === 'not_started') return 'Not started';
                    if (etaCardData.busStatus === 'just_started') return 'Just started';
                    if (etaCardData.busStatus === 'en_route') return 'En route';
                    if (etaCardData.busStatus === 'reached_destination') return 'Reached';
                    return '-';
                  })()}
                  driverName={selectedBus?.driver?.name || selectedBus?.driverName || 'N/A'}
                  avgSpeed={etaCardData.avgSpeed}
                />
              </div>
            )}
            <div className="bg-white rounded-3xl shadow-2xl p-0 flex flex-col h-full relative border border-gray-100 transition-all">
              <div className="flex items-center gap-2 px-4 md:px-6 pt-4 md:pt-6 pb-2">
                <MapPin className="w-6 h-6 text-[#4285F4]" />
                <span className="text-lg md:text-xl font-bold text-[#222] tracking-tight">{t('bus_tracking.live_map', 'Live Map')}</span>
              </div>
              <div className="flex-1 relative rounded-3xl overflow-hidden min-h-[400px] md:min-h-[500px] aspect-[16/9] m-2 md:m-0 shadow-lg border border-gray-200" style={{boxShadow: '0 4px 24px 0 rgba(60,64,67,0.10)'}}>
                {selectedRouteId === 'all' || !selectedBusId ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-base md:text-lg font-semibold px-2 text-center">
                    <span className="bg-white/80 rounded-xl px-4 py-3 border border-gray-200 shadow-md">
                      {selectedRouteId === 'all'
                        ? t('bus_tracking.select_route_to_view_map', 'Please select a route to view the map.')
                        : t('bus_tracking.select_bus_to_view_map', 'Please select a bus to view the map.')}
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Desktop Map */}
                    <div className="hidden md:block h-full w-full">
                      <LiveBusMap 
                        busId={selectedBus?.busNumber || selectedBusId}
                        route={selectedRoute || undefined}
                        bus={selectedBus || undefined}
                      />
                    </div>
                    {/* Mobile Map */}
                    <div className="block md:hidden h-full w-full">
                      <MobileBusMap 
                        busId={selectedBus?.busNumber || selectedBusId}
                        route={selectedRoute || undefined}
                        bus={selectedBus || undefined}
                        defaultZoom={12}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
          {/* Route Details Section */}
          <section className="w-full md:w-96 bg-white rounded-2xl shadow-lg p-0 flex flex-col">
            <div className="bg-indigo-50 rounded-t-2xl px-6 py-4 border-b border-indigo-100 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-indigo-500" />
              <span className="text-lg font-bold text-indigo-700">{t('bus_tracking.route_details', 'Route Details')}</span>
            </div>
            <div className="flex-1 px-6 py-6">
              <RouteDetailsPanel bus={selectedBus || undefined} route={selectedRoute || undefined} />
            </div>
          </section>
        </main>
  {/* Route Timeline removed as per request */}
      </div>
    </div>
  );
};


// --- Stats Card ---
function StatsCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <motion.div whileHover={{ scale: 1.04 }} className="bg-white rounded-xl shadow p-4 flex flex-col items-center gap-2 transition-all">
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-50 mb-1">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}

// --- Status Filter Dropdown ---
function StatusFilterDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  return (
    <select
      className="px-3 py-2 border border-gray-200 rounded-lg bg-[#f8f9fa] text-gray-700 focus:ring-2 focus:ring-indigo-400"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="all">{t('bus_tracking.status_all', 'All Status')}</option>
      <option value="active" className="text-green-600">{t('bus_tracking.status_active', 'Active')}</option>
      <option value="delayed" className="text-orange-600">{t('bus_tracking.status_delayed', 'Delayed')}</option>
      <option value="inactive" className="text-gray-500">{t('bus_tracking.status_inactive', 'Inactive')}</option>
    </select>
  );
}

// --- Route Filter Dropdown ---
function RouteFilterDropdown({ routes, value, onChange }: { routes: Route[]; value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  return (
    <select
      className="px-3 py-2 border border-gray-200 rounded-lg bg-[#f8f9fa] text-gray-700 focus:ring-2 focus:ring-indigo-400"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="all">{t('bus_tracking.all_routes', 'All Routes')}</option>
      {routes.map(route => (
        <option key={route.id} value={route.id || ''}>{route.route_name}</option>
      ))}
    </select>
  );
}

// --- Route Details Panel ---
function RouteDetailsPanel({ bus, route }: { bus?: BusType; route?: Route }) {
  const { t } = useTranslation();
  const [startAddress, setStartAddress] = useState<string>('');
  const [endAddress, setEndAddress] = useState<string>('');

  useEffect(() => {
    if (!route) {
      setStartAddress('');
      setEndAddress('');
      return;
    }
    async function fetchAddresses() {
      if (!route) return;
      if (route.start_latitude && route.start_longitude) {
        const addr = await reverseGeocode(route.start_latitude, route.start_longitude);
        setStartAddress(addr || `${route.start_latitude}, ${route.start_longitude}`);
      }
      if (route.end_latitude && route.end_longitude) {
        const addr = await reverseGeocode(route.end_latitude, route.end_longitude);
        setEndAddress(addr || `${route.end_latitude}, ${route.end_longitude}`);
      }
    }
    fetchAddresses();
  }, [route]);

  if (!route || !bus) {
    return <div className="text-gray-400 text-center py-8 text-base font-semibold">{t('bus_tracking.select_route_and_bus', 'Please select a route and bus to see details.')}</div>;
  }
  const stops = route.stops || [];
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500">{t('bus_tracking.route_name', 'Route Name')}</span>
        <span className="font-bold text-indigo-700 text-lg">{route.route_name}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500">{t('bus_tracking.start_location', 'Start Location')}</span>
        <span className="font-medium text-gray-800">{startAddress}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500">{t('bus_tracking.end_location', 'End Location')}</span>
        <span className="font-medium text-gray-800">{endAddress}</span>
      </div>
      <div className="flex flex-row gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">{t('bus_tracking.speed_limit', 'Speed Limit')}</span>
          <span className="font-medium text-gray-800">{route.speed_limit} {t('bus_tracking.km_per_hour', 'km/h')}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">{t('bus_tracking.distance', 'Distance')}</span>
          <span className="font-medium text-gray-800">{route.total_distance_km?.toFixed(2) || '-'} {t('bus_tracking.km', 'km')}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500">{t('bus_tracking.stops', 'Stops')}</span>
        <span className="font-medium text-gray-800">{stops.length > 0 ? stops.join(', ') : '-'}</span>
      </div>
    </div>
  );
}

export default BusTrackingDashboard;
