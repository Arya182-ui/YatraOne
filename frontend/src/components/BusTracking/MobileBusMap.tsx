import React, { useEffect, useState } from 'react';
import { useBusLocationWebSocket } from '../../lib/useBusLocationWebSocket';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import busMarkerUrl from '../../assets/bus-marker.svg';
import startIconUrl from '../../assets/start-marker.png';
import endIconUrl from '../../assets/end-marker.png';
import { MapContainer, TileLayer, Marker, Polyline, ZoomControl, Popup } from 'react-leaflet';
import { useRef } from 'react';
import { Map as LeafletMap } from 'leaflet';
import { busLocationAPI, reverseGeocodeAPI } from '../../lib/api';
import api from '../../lib/api';

interface MobileBusMapProps {
  busId: string;
  route?: any;
  bus?: any;
  defaultZoom?: number;
}

const fallbackCenter: [number, number] = [28.6139, 77.2090]; // Delhi as fallback

const liveBusIcon = new L.Icon({
  iconUrl: busMarkerUrl,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -36],
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
  shadowAnchor: [13, 41],
});

const startIcon = new L.Icon({
  iconUrl: startIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
});
const endIcon = new L.Icon({
  iconUrl: endIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
});

const MobileBusMap: React.FC<MobileBusMapProps> = ({ busId, route, bus, defaultZoom = 12 }) => {
  const { t } = useTranslation();
  // State for live bus location
  const wsUrlBase = import.meta.env.VITE_BACKEND_WS_URL || 'http://localhost:8000';
  const [wsFailed, setWsFailed] = useState(false);
  const [fallbackLocation, setFallbackLocation] = useState<any>(null);
  console.log('[MobileBusMap] wsUrlBase:', wsUrlBase, 'busId:', busId);
  const busLocation = useBusLocationWebSocket(busId, wsUrlBase, {
    onError: () => setWsFailed(true)
  });

  // --- Offline cache logic ---
  const CACHE_KEY = `mobilebusmap_last_location_${busId}`;
  // Save to cache whenever location updates (and online)
  useEffect(() => {
    if (navigator.onLine && busLocation && busLocation.latitude && busLocation.longitude) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(busLocation));
    }
  }, [busLocation]);

  // If offline, load from cache
  const [offlineLocation, setOfflineLocation] = useState<any>(null);
  useEffect(() => {
    function handleOffline() {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) setOfflineLocation(JSON.parse(cached));
      } catch {}
    }
    function handleOnline() {
      setOfflineLocation(null);
    }
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    if (!navigator.onLine) handleOffline();
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [busId]);
  const [loading, setLoading] = useState(true);
  const [busAddress, setBusAddress] = useState<string>("");
  const [busStatus, setBusStatus] = useState<string>("");
  const [upcomingStop, setUpcomingStop] = useState<string>("");
  const [eta, setEta] = useState<string>('N/A');
  const [avgSpeed, setAvgSpeed] = useState<string>('N/A');
  // Fetch ETA and avg speed when location or route changes
  useEffect(() => {
    async function fetchEta() {
      if (busLocation && route) {
        try {
          const res = await api.post('/bus-eta', {
            bus_lat: busLocation.latitude,
            bus_lon: busLocation.longitude,
            speed: bus?.speed,
            route_id: route.id || bus?.route,
          });
          if (res.data && typeof res.data.eta_minutes !== 'undefined' && res.data.eta_minutes !== null) {
            setEta(res.data.eta_minutes + ' min');
            setAvgSpeed(res.data.used_speed ? res.data.used_speed + ' km/h' : 'N/A');
          } else {
            setEta('N/A');
            setAvgSpeed('N/A');
          }
        } catch {
          setEta('N/A');
          setAvgSpeed('N/A');
        }
      } else {
        setEta('N/A');
        setAvgSpeed('N/A');
      }
    }
    fetchEta();
  }, [busLocation, route, bus]);
  const mapRef = useRef<LeafletMap | null>(null);
  // Determine bus status (not started, en route, reached, etc.)
  // (Removed duplicate declaration and assignment of routePoints)

  // Get route polyline: use all stops if available, else just start and end
  const getRoutePoints = () => {
    let points: [number, number][] = [];
    if (route && Array.isArray(route.stops) && route.stops.length > 1 && route.stops.every((stop: any) => stop && (stop.lat || stop.latitude) && (stop.lng || stop.longitude))) {
      // Support both lat/lng and latitude/longitude keys
      points = route.stops.map((stop: any) => [
        Number(stop.lat ?? stop.latitude),
        Number(stop.lng ?? stop.longitude)
      ]) as [number, number][];
    } else if (route && route.start_latitude && route.start_longitude && route.end_latitude && route.end_longitude) {
      points = [
        [Number(route.start_latitude), Number(route.start_longitude)],
        [Number(route.end_latitude), Number(route.end_longitude)],
      ];
    }
    // Filter out any invalid points
    return points.filter(pt => Array.isArray(pt) && pt.length === 2 && pt.every(n => typeof n === 'number' && !isNaN(n)));
  };
  const routePoints: [number, number][] = getRoutePoints();

  // Auto-zoom logic
  useEffect(() => {
    if (busLocation && mapRef.current) {
      mapRef.current.setView([busLocation.latitude, busLocation.longitude], 15, { animate: true });
    } else if (!busLocation && mapRef.current && routePoints.length > 1) {
      // Fit bounds to route (ensure valid points)
      const validPoints = routePoints.filter(pt => Array.isArray(pt) && pt.length === 2 && pt.every(n => typeof n === 'number' && !isNaN(n)));
      if (validPoints.length > 1) {
        const bounds = L.latLngBounds(validPoints as [number, number][]);
        mapRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
      }
    }
  }, [busLocation, route, routePoints]);
  useEffect(() => {
    if (!route || !busLocation) {
      setBusStatus("");
      setUpcomingStop("");
      return;
    }
    // Helper: distance between two lat/lng
    function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
      const toRad = (x: number) => (x * Math.PI) / 180;
      const R = 6371e3;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }
    const startDist = haversine(busLocation.latitude, busLocation.longitude, route.start_latitude, route.start_longitude);
    const endDist = haversine(busLocation.latitude, busLocation.longitude, route.end_latitude, route.end_longitude);
    const routeDist = haversine(route.start_latitude, route.start_longitude, route.end_latitude, route.end_longitude);
    // If before start
    if (startDist > routeDist && endDist > routeDist) {
      setBusStatus("not_started");
      setUpcomingStop("");
    } else if (endDist < 100) {
      setBusStatus("reached_destination");
      setUpcomingStop("");
    } else if (startDist < 100) {
      setBusStatus("just_started");
      setUpcomingStop(route.stops?.[0] || "");
    } else {
      setBusStatus("en_route");
      // Find next stop (if stops available)
      if (route.stops && route.stops.length > 0) {
        let nextStop = "";
        for (const stop of route.stops) {
          if (!nextStop) nextStop = stop;
        }
        setUpcomingStop(nextStop);
      } else {
        setUpcomingStop("");
      }
    }
  }, [route, busLocation]);

  // Fallback polling if no WebSocket data for 15s
  useEffect(() => {
    if (busLocation) return;
    let interval: any;
    const fetchLocation = async () => {
      try {
        const all = await busLocationAPI.getAllLocations();
        const match = (a: any, b: any) => a && b && String(a) === String(b);
        const busLoc = all.find((b: any) =>
          match(b.id, busId) ||
          match(b.bus_id, busId) ||
          match(b.busNumber, busId) ||
          match(b.number, busId)
        );
        if (busLoc && busLoc.latitude && busLoc.longitude) {
          setBusAddress(`${busLoc.latitude}, ${busLoc.longitude}`);
        }
      } catch { }
    };
    fetchLocation();
    interval = setInterval(fetchLocation, 15000);
    return () => clearInterval(interval);
  }, [busId, busLocation]);

  // Reverse geocode bus location using backend proxy
  useEffect(() => {
    if (busLocation) {
      reverseGeocodeAPI.getAddress(busLocation.latitude, busLocation.longitude)
        .then(data => {
          if (data.address) {
            const name = data.address.bus_station || data.address.suburb || data.address.town || data.address.city || data.address.village || "";
            let district = data.address.county || data.address.state_district || "";
            const state = data.address.state || "";
            const country = data.address.country || "";
            if (name && district && name.toLowerCase() === district.toLowerCase()) district = "";
            setBusAddress([name, district, state, country].filter(Boolean).join(", "));
          } else {
            setBusAddress(data.display_name || `${busLocation.latitude}, ${busLocation.longitude}`);
          }
        })
        .catch(() => setBusAddress(`${busLocation.latitude}, ${busLocation.longitude}`));
    } else {
      setBusAddress("");
    }
  }, [busLocation]);

  // (routePoints already declared and assigned above)

  // Center: bus if available, else route start, else fallback
  let center: [number, number] = fallbackCenter;
  if (busLocation) center = [busLocation.latitude, busLocation.longitude];
  else if (offlineLocation) center = [offlineLocation.latitude, offlineLocation.longitude];
  else if (routePoints.length > 0 && Array.isArray(routePoints[0]) && routePoints[0].length === 2 && routePoints[0].every(n => typeof n === 'number' && !isNaN(n))) center = routePoints[0] as [number, number];

  return (
    <div className="w-full flex flex-col">
      <div className="w-full h-[380px] sm:h-[420px] md:h-[480px] rounded-2xl overflow-hidden relative">
        <MapContainer
          center={center}
          zoom={busLocation ? 15 : defaultZoom}
          scrollWheelZoom={true}
          className="w-full h-full"
          zoomControl={false}
          dragging={true}
          style={{ borderRadius: '1.5rem', minHeight: 250 }}
          ref={mapRef as any}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {routePoints.length > 1 && (
            <Polyline positions={routePoints} color="#2563eb" weight={6} opacity={0.8} />
          )}
          {/* Start marker */}
          {route && (
            <Marker position={[route.start_latitude, route.start_longitude]} icon={startIcon} />
          )}
          {/* End marker */}
          {route && (
            <Marker position={[route.end_latitude, route.end_longitude]} icon={endIcon} />
          )}
          {/* Bus marker logic: only show if not reached destination or not before start */}
          {(busLocation || offlineLocation) && busStatus !== 'reached_destination' && busStatus !== 'not_started' && (
            <Marker position={busLocation ? [busLocation.latitude, busLocation.longitude] : [offlineLocation.latitude, offlineLocation.longitude]} icon={liveBusIcon}>
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <div className="font-bold text-blue-700 text-lg mb-1">{t('mobilebusmap.bus', 'Bus')} {bus?.number || busId}</div>
                  <div className="text-xs text-gray-500 mb-2">{t('mobilebusmap.last_update', 'Last update')}: {busLocation?.timestamp ? new Date(busLocation.timestamp).toLocaleTimeString() : offlineLocation?.timestamp ? new Date(offlineLocation.timestamp).toLocaleTimeString() : t('mobilebusmap.na', 'N/A')}</div>
                  <div className="mb-2">
                    <b>{t('mobilebusmap.route', 'Route')}:</b> {route?.route_name || bus?.route || '-'}
                  </div>
                  {bus && (
                    <>
                      <div><b>{t('mobilebusmap.status', 'Status')}:</b> {bus.status}</div>
                      <div><b>{t('mobilebusmap.occupancy', 'Occupancy')}:</b> {bus.currentOccupancy}/{bus.capacity}</div>
                      <div><b>{t('mobilebusmap.driver', 'Driver')}:</b> {bus.driver?.name || t('mobilebusmap.na', 'N/A')}</div>
                      <div><b>{t('mobilebusmap.amenities', 'Amenities')}:</b> {(bus.amenities || []).join(', ')}</div>
                    </>
                  )}
                  <div><b>{t('mobilebusmap.current_status', 'Current Status')}:</b> {busStatus === 'not_started' ? t('mobilebusmap.not_started', 'Not started') : busStatus === 'just_started' ? t('mobilebusmap.just_started', 'Just started') : busStatus === 'en_route' ? t('mobilebusmap.en_route', 'En route') : busStatus === 'reached_destination' ? t('mobilebusmap.reached', 'Reached') : '-'}</div>
                  <div><b>{t('mobilebusmap.destination', 'Destination')}:</b> {route?.end_latitude && route?.end_longitude ? `${route.end_latitude}, ${route.end_longitude}` : '-'}</div>
                  <div className="mt-2 text-xs text-gray-400">Lat: {busLocation ? busLocation.latitude : offlineLocation.latitude}, Lng: {busLocation ? busLocation.longitude : offlineLocation.longitude}</div>
                  {!busLocation && offlineLocation && (
                    <div className="text-yellow-600 font-semibold mt-2">{t('mobilebusmap.offline_cache', 'Offline: Showing last known location')}</div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
          <ZoomControl position="bottomright" />
        </MapContainer>
        {loading && (
          <div className="absolute left-1/2 -translate-x-1/2 top-2 z-[1000] bg-white/90 rounded-2xl px-5 py-2 shadow text-gray-500 text-sm">{t('mobilebusmap.loading', 'Loading bus location...')}</div>
        )}
      </div>
      {/* ETA Info Card below map (modern, compact, with bus info) */}
    </div>
  );
};

export default MobileBusMap;
