import React, { useEffect, useState } from 'react';
import { useBusLocationWebSocket, BusLocation } from '../../lib/useBusLocationWebSocket';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import busMarkerUrl from '../../assets/bus-marker.svg';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Bus } from '../../types';
import { busLocationAPI, reverseGeocodeAPI } from '../../lib/api';

const busIcon = new L.Icon({
  iconUrl: busMarkerUrl,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -36],
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
  shadowAnchor: [13, 41],
});

const DEFAULT_CENTER: [number, number] = [28.6139, 77.2090]; // Delhi as default

// Helper to fit map to live/fallback bus markers
const FitBounds: React.FC<{ buses: Bus[]; liveLocations: Record<string, any>; fallbackLocations: Record<string, any>; }> = ({ buses, liveLocations, fallbackLocations }) => {
  const map = useMap();
  useEffect(() => {
    // Collect all visible bus marker positions
    const positions: [number, number][] = buses.map(bus => {
      const live = liveLocations[bus.id];
      if (live && live.latitude && live.longitude) {
        return [live.latitude, live.longitude];
      } else if (fallbackLocations[bus.id]) {
        return [fallbackLocations[bus.id].latitude, fallbackLocations[bus.id].longitude];
      }
      return undefined;
    }).filter(Boolean) as [number, number][];
    if (positions.length === 1) {
      map.setView(positions[0], 14);
    } else if (positions.length > 1) {
      map.fitBounds(positions, { padding: [50, 50] });
    }
  }, [buses, liveLocations, fallbackLocations, map]);
  return null;
};

interface BusMapProps {
  buses?: Bus[];
}




const BusMap: React.FC<BusMapProps> = ({ buses = [] }) => {
  const wsUrlBase = import.meta.env.VITE_BACKEND_WS_URL || 'http://localhost:8000';
  const { t } = useTranslation();

  // Use the hook for each bus to get live locations
  const liveLocations: Record<string, BusLocation | null> = {};
  (buses || []).forEach(bus => {
    liveLocations[bus.id] = useBusLocationWebSocket(bus.id, wsUrlBase);
  });

  // --- Offline cache logic ---
  // Cache key for localStorage
  const CACHE_KEY = 'busmap_last_locations';
  // Save to cache whenever liveLocations update (and online)
  useEffect(() => {
    if (navigator.onLine) {
      const toCache: Record<string, any> = {};
      Object.entries(liveLocations).forEach(([id, loc]) => {
        if (loc && loc.latitude && loc.longitude) {
          toCache[id] = loc;
        }
      });
      if (Object.keys(toCache).length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(toCache));
      }
    }
  }, [liveLocations]);

  // If offline, load from cache
  const [offlineLocations, setOfflineLocations] = useState<Record<string, any>>({});
  useEffect(() => {
    function handleOffline() {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) setOfflineLocations(JSON.parse(cached));
      } catch {}
    }
    function handleOnline() {
      setOfflineLocations({});
    }
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    // On mount, if offline, load cache
    if (!navigator.onLine) handleOffline();
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // State to store fallback locations and WebSocket status (optional, can keep for fallback logic)
  const [fallbackLocations, setFallbackLocations] = useState<Record<string, any>>({});
  // wsFailed state removed (no longer needed)
  const [busAddresses, setBusAddresses] = useState<Record<string, string>>({});

  // Fallback: fetch last known location from backend if WebSocket fails

  useEffect(() => {
    const fetchFallbacks = async () => {
      const failedIds = buses.filter(b => !liveLocations[b.id]).map(b => b.id);
      if (failedIds.length === 0) return;
      try {
        const all = await busLocationAPI.getAllLocations();
        const fallback: Record<string, any> = {};
        for (const id of failedIds) {
          const found = all.find((b: any) => String(b.id) === String(id) || String(b.bus_id) === String(id) || String(b.busNumber) === String(id));
          if (found && found.latitude && found.longitude) {
            fallback[id] = found;
          }
        }
        setFallbackLocations(prev => ({ ...prev, ...fallback }));
      } catch { }
    };
    fetchFallbacks();
  }, [buses, liveLocations]);

  // Fetch reverse geocoded address for each bus location
  useEffect(() => {
    (async () => {
      const updates: Record<string, string> = {};
      for (const bus of buses) {
        let lat: number | undefined, lon: number | undefined;
        const location = liveLocations[bus.id];
        if (location && location.latitude && location.longitude) {
          lat = location.latitude;
          lon = location.longitude;
  } else if (fallbackLocations[bus.id]) {
          lat = fallbackLocations[bus.id].latitude;
          lon = fallbackLocations[bus.id].longitude;
        }
        if (lat && lon) {
          try {
            const res = await reverseGeocodeAPI.getAddress(lat, lon);
            updates[bus.id] = res.display_name || `${lat}, ${lon}`;
          } catch {
            updates[bus.id] = `${lat}, ${lon}`;
          }
        }
      }
      setBusAddresses(prev => ({ ...prev, ...updates }));
    })();
  }, [buses, liveLocations, fallbackLocations]);

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-xl border border-blue-200 dark:border-gray-700 relative">
      <MapContainer center={DEFAULT_CENTER as [number, number]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
  <FitBounds buses={buses} liveLocations={liveLocations} fallbackLocations={fallbackLocations} />
        {(buses || []).map(bus => {
          // Always use SVG marker for all buses
          // Prefer live, then fallback, then offline cache
          const location = liveLocations[bus.id];
          let lat, lon, isOffline = false;
          if (location && location.latitude && location.longitude) {
            lat = location.latitude;
            lon = location.longitude;
          } else if (fallbackLocations[bus.id]) {
            lat = fallbackLocations[bus.id].latitude;
            lon = fallbackLocations[bus.id].longitude;
          } else if (offlineLocations[bus.id]) {
            lat = offlineLocations[bus.id].latitude;
            lon = offlineLocations[bus.id].longitude;
            isOffline = true;
          }
          if (lat && lon) {
            return (
              <Marker
                key={bus.id}
                position={[lat, lon]}
                icon={busIcon}
              >
                <Popup>
                  <div>
                    <strong>{t('bus_map.bus', 'Bus')}:</strong> {bus.number}<br />
                    <strong>{t('bus_map.driver', 'Driver')}:</strong> {bus.driver?.name || t('bus_map.na', 'N/A')}<br />
                    <strong>{t('bus_map.location', 'Location')}:</strong> {lat}, {lon}<br />
                    <span className="text-xs text-gray-500">{busAddresses[bus.id] || ''}</span>
                    {isOffline && (
                      <span className="text-yellow-600 font-semibold block mt-2">{t('bus_map.offline_cache', 'Offline: Showing last known location')}</span>
                    )}
                    {!location && !isOffline && fallbackLocations[bus.id] && (
                      <span className="text-red-500 font-semibold block mt-2">{t('bus_map.driver_not_sharing', 'Driver is not started sharing location yet')}</span>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
      {buses.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">{t('bus_map.no_bus_selected', 'No bus selected')}</div>
      )}
    </div>
  );
};

export default BusMap;
