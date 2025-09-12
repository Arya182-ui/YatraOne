import React, { useRef } from 'react';
import { useBusLocationWebSocket } from '../../lib/useBusLocationWebSocket';
import { useTranslation } from 'react-i18next';
import { Map as LeafletMap } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import busMarkerUrl from '../../assets/bus-marker.svg';
import startIconUrl from '../../assets/start-marker.png';
import endIconUrl from '../../assets/end-marker.png';
import { busLocationAPI, reverseGeocodeAPI } from '../../lib/api';
import api from '../../lib/api';

const liveBusIcon = new L.Icon({
  iconUrl: busMarkerUrl,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -36],
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
  shadowAnchor: [13, 41],
});

const DEFAULT_CENTER_LIVE: [number, number] = [28.6139, 77.2090];

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

import type { Route, Bus } from '../../types';
type LiveBusMapProps = {
  busId: string;
  route?: Route;
  bus?: Bus;
};

const reverseGeocode = async (lat: number, lon: number) => {
  try {
    const data = await reverseGeocodeAPI.getAddress(lat, lon);
    if (data.address) {
      const name = data.address.bus_station || data.address.suburb || data.address.town || data.address.city || data.address.village || "";
      let district = data.address.county || data.address.state_district || "";
      const state = data.address.state || "";
      const country = data.address.country || "";
      if (name && district && name.toLowerCase() === district.toLowerCase()) district = "";
      return [name, district, state, country].filter(Boolean).join(", ");
    }
    return data.display_name;
  } catch {
    return `${lat}, ${lon}`;
  }
};

const LiveBusMap: React.FC<LiveBusMapProps> = ({ busId, route, bus }) => {
  const [driverName, setDriverName] = React.useState<string>('N/A');

  // Fetch driver name if not present in bus object
  React.useEffect(() => {
    async function fetchDriver() {
      if (bus?.driver && bus.driver.name) {
        setDriverName(bus.driver.name);
        return;
      }
      // Try to get driverId from bus object
      const driverId = (bus as any)?.driverId;
      if (driverId) {
        try {
          const res = await api.get(`/users/${driverId}`);
          if (res.data && (res.data.firstName || res.data.lastName)) {
            setDriverName(`${res.data.firstName || ''} ${res.data.lastName || ''}`.trim() || 'N/A');
          } else if (res.data && res.data.name) {
            setDriverName(res.data.name);
          } else {
            setDriverName('N/A');
          }
        } catch {
          setDriverName('N/A');
        }
      } else {
        setDriverName('N/A');
      }
    }
    fetchDriver();
  }, [bus]);
  const { t } = useTranslation();
  const wsUrlBase = import.meta.env.VITE_BACKEND_WS_URL || 'http://localhost:8000';
  const [wsFailed, setWsFailed] = React.useState(false);
  const [fallbackLocation, setFallbackLocation] = React.useState<any>(null);
  const location = useBusLocationWebSocket(busId, wsUrlBase, {
    onError: () => setWsFailed(true)
  });
  const [busAddress, setBusAddress] = React.useState<string>("");
  const [busStatus, setBusStatus] = React.useState<string>("");
  const [upcomingStop, setUpcomingStop] = React.useState<string>("");
  const [eta, setEta] = React.useState<string>('N/A');
  const [avgSpeed, setAvgSpeed] = React.useState<string>('N/A');

  const mapRef = useRef<LeafletMap | null>(null);

  // Fetch ETA and avg speed from backend when location or route changes
  React.useEffect(() => {
    const loc = location || fallbackLocation;
    if (!loc || !route) {
      setEta('N/A');
      setAvgSpeed('N/A');
      return;
    }
    let cancelled = false;
    async function fetchEta() {
      try {
        const routeId = route && ('id' in route ? route.id : undefined) || bus?.route;
        const res = await api.post('/bus-eta', {
          bus_lat: loc.latitude,
          bus_lon: loc.longitude,
          speed: loc.speed,
          route_id: routeId,
        });
        if (!cancelled && res.data) {
          setEta(typeof res.data.eta_minutes !== 'undefined' && res.data.eta_minutes !== null ? res.data.eta_minutes + ' min' : 'N/A');
          setAvgSpeed(res.data.used_speed ? res.data.used_speed + ' km/h' : 'N/A');
        }
      } catch {
        if (!cancelled) {
          setEta('N/A');
          setAvgSpeed('N/A');
        }
      }
    }
    fetchEta();
    return () => { cancelled = true; };
  }, [location, fallbackLocation, route, bus]);

  // Fallback: fetch last known location if WebSocket fails
  React.useEffect(() => {
    if (!wsFailed) return;
    let cancelled = false;
    const fetchFallback = async () => {
      try {
        const all = await busLocationAPI.getAllLocations();
        const busLoc = all.find((b: any) => b.id === busId || b.bus_id === busId || b.busNumber === busId);
        if (!cancelled && busLoc && busLoc.latitude && busLoc.longitude) {
          setFallbackLocation(busLoc);
          setBusAddress(`${busLoc.latitude}, ${busLoc.longitude}`);
        }
      } catch {}
    };
    fetchFallback();
    return () => { cancelled = true; };
  }, [wsFailed, busId]);

  // Reverse geocode bus location
  React.useEffect(() => {
    if (location) {
      reverseGeocode(location.latitude, location.longitude).then(addr => setBusAddress(addr || ""));
    } else if (fallbackLocation) {
      reverseGeocode(fallbackLocation.latitude, fallbackLocation.longitude).then(addr => setBusAddress(addr || ""));
    } else {
      setBusAddress("");
    }
  }, [location, fallbackLocation]);

  // Determine bus status (not started, en route, reached, etc.)
  React.useEffect(() => {
    const loc = location || fallbackLocation;
    if (!route || !loc) {
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
    const startDist = haversine(loc.latitude, loc.longitude, route.start_latitude, route.start_longitude);
    const endDist = haversine(loc.latitude, loc.longitude, route.end_latitude, route.end_longitude);
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
  }, [route, location, fallbackLocation]);

  // Auto-focus map on marker when location changes, but fix zoom
  React.useEffect(() => {
    const loc = location || fallbackLocation;
    if (loc && mapRef.current) {
      mapRef.current.setView([loc.latitude, loc.longitude], 13, { animate: true });
    }
  }, [location, fallbackLocation]);

  // Calculate map center: prefer bus location, else fallback, else route start, else default
  let mapCenter: [number, number] = DEFAULT_CENTER_LIVE;
  if (location) mapCenter = [location.latitude, location.longitude];
  else if (fallbackLocation) mapCenter = [fallbackLocation.latitude, fallbackLocation.longitude];
  else if (route) mapCenter = [route.start_latitude, route.start_longitude];

  // Polyline for route
  const routeLine: [number, number][] = route
    ? [
        [route.start_latitude, route.start_longitude],
        [route.end_latitude, route.end_longitude],
      ]
    : [];

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <MapContainer
          center={mapCenter}
          zoom={location ? 13 : 11}
          style={{ height: '100%', width: '100%', borderRadius: 16, boxShadow: '0 2px 16px #0001' }}
          ref={mapRef as any}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          />
          {/* Draw route polyline */}
          {route && <Polyline positions={routeLine} color="#2563eb" weight={6} opacity={0.8} dashArray="8 12" />} 
          {/* Start marker */}
          {route && (
            <Marker position={[route.start_latitude, route.start_longitude]} icon={startIcon}>
              <Popup>
                <b>Start Point</b><br />
                {route.route_name}
              </Popup>
            </Marker>
          )}
          {/* End marker */}
          {route && (
            <Marker position={[route.end_latitude, route.end_longitude]} icon={endIcon}>
              <Popup>
                <b>End Point</b><br />
                {route.route_name}
              </Popup>
            </Marker>
          )}
          {/* Bus marker logic: only show if not reached destination or not before start */}
          {(location || fallbackLocation) && busStatus !== 'reached_destination' && busStatus !== 'not_started' && (
            <Marker position={location ? [location.latitude, location.longitude] : [fallbackLocation.latitude, fallbackLocation.longitude]} icon={liveBusIcon}>
              <Popup>
                <div style={{ minWidth: 200 }}>
                  <div className="font-bold text-blue-700 text-lg mb-1">{t('livebusmap.bus', 'Bus')} {bus?.number || busId}</div>
                  <div className="text-xs text-gray-500 mb-2">{t('livebusmap.last_update', 'Last update')}: {location?.timestamp ? new Date(location.timestamp).toLocaleTimeString() : t('livebusmap.na', 'N/A')}</div>
                  <div className="mb-2">
                    <b>{t('livebusmap.route', 'Route')}:</b> {route?.route_name || bus?.route || '-'}
                  </div>
                  {bus && (
                    <>
                      <div><b>{t('livebusmap.status', 'Status')}:</b> {bus.status}</div>
                      <div><b>{t('livebusmap.occupancy', 'Occupancy')}:</b> {bus.currentOccupancy}/{bus.capacity}</div>
                      <div><b>{t('livebusmap.driver', 'Driver')}:</b> {bus.driver?.name || t('livebusmap.na', 'N/A')}</div>
                      <div><b>{t('livebusmap.amenities', 'Amenities')}:</b> {(bus.amenities || []).join(', ')}</div>
                    </>
                  )}
                  <div className="mt-2 text-xs text-gray-400">Lat: {location ? location.latitude : fallbackLocation.latitude}, Lng: {location ? location.longitude : fallbackLocation.longitude}</div>
                  {wsFailed && fallbackLocation && (
                    <div className="text-red-500 font-semibold mt-2">{t('livebusmap.driver_not_sharing', 'Driver is not started sharing location yet')}</div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
          {/* Always show destination marker if reached or passed */}
          {busStatus === 'reached_destination' && route && (
            <Marker position={[route.end_latitude, route.end_longitude]} icon={endIcon}>
              <Popup>
                <b>{t('livebusmap.destination_reached', 'Destination Reached')}</b><br />
                {route.route_name}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      {/* Info cards below map, responsive flex */}
      <div className="w-full flex flex-col items-center mt-4">
        <div className="bg-gradient-to-br from-white via-indigo-50 to-white rounded-3xl px-12 py-4 shadow-2xl border border-indigo-200 min-w-[340px] max-w-2xl w-full flex flex-col items-center gap-3 transition-all duration-300">
          <div className="flex flex-row items-center justify-between w-full mb-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full w-9 h-9 text-xl font-bold shadow-md">
                <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3'/></svg>
              </span>
              <span className="text-xl font-extrabold text-indigo-700 tracking-tight drop-shadow">{eta}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 font-semibold uppercase">Bus</span>
              <span className="text-base font-bold text-blue-700">{bus?.number || busId}</span>
            </div>
          </div>
          <div className="w-full flex flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-start">
              <span className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
                <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 17l-5-5m0 0l-5-5m5 5V3'/></svg>
                Next Stop
              </span>
              <span className="text-base font-semibold text-gray-800">{upcomingStop || '-'}</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
                <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657A8 8 0 1112 4v4l4 2-4 2v4a8 8 0 005.657-1.343z'/></svg>
                Location
              </span>
              <span className="text-base font-semibold text-gray-800">{busAddress || '-'}</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
                <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m4 4h-1v-4h-1'/></svg>
                Status
              </span>
              <span className="text-base font-semibold text-gray-800">
                {busStatus === 'not_started' && <span className="text-orange-600 font-semibold">Not started</span>}
                {busStatus === 'just_started' && <span className="text-green-700 font-semibold">Just started</span>}
                {busStatus === 'en_route' && <span className="text-blue-700 font-semibold">En route</span>}
                {busStatus === 'reached_destination' && <span className="text-green-700 font-semibold">Reached</span>}
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
                <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7'/></svg>
                Driver
              </span>
              <span className="text-base font-semibold text-gray-800">{driverName}</span>
            </div>
          </div>
          <div className="w-full flex flex-row gap-8 items-center justify-center mt-2">
            <div className="flex flex-col items-center">
              <span className="text-gray-500 text-xs flex items-center gap-1">
                <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m4 4h-1v-4h-1'/></svg>
                Avg Speed
              </span>
              <span className="text-base font-semibold text-gray-800">{avgSpeed}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-500 text-xs flex items-center gap-1">
                <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2z'/></svg>
                Tracking
              </span>
              <span className="text-base font-semibold text-gray-800 text-center">{busAddress || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveBusMap;
