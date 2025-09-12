import React, { useEffect, useState } from 'react';
import { useBusLocationWebSocket } from '../../lib/useBusLocationWebSocket';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import busMarkerUrl from '../../assets/bus-marker.svg';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Bus } from '../../types';
import api from '../../lib/api';
import { busLocationAPI } from '../../lib/api';

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

// Helper to fit map to markers
const FitBounds: React.FC<{ buses: Bus[] }> = ({ buses }) => {
  const map = useMap();
  useEffect(() => {
    const validBuses = buses.filter(bus => bus.currentLocation?.latitude && bus.currentLocation?.longitude);
    if (validBuses.length === 1) {
      map.setView([
        validBuses[0].currentLocation.latitude,
        validBuses[0].currentLocation.longitude
      ] as [number, number], 14);
    } else if (validBuses.length > 1) {
      const bounds: [number, number][] = validBuses.map(bus => [bus.currentLocation.latitude, bus.currentLocation.longitude]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [buses, map]);
  return null;
};

interface BusMapProps {
  buses?: Bus[];
}



const BusMap: React.FC<BusMapProps> = ({ buses = [] }) => {
  const wsUrlBase = import.meta.env.VITE_BACKEND_WS_URL || 'http://localhost:8000';
  const { t } = useTranslation();
  // State to store fallback locations and WebSocket status
  const [fallbackLocations, setFallbackLocations] = useState<Record<string, any>>({});
  const [wsFailed, setWsFailed] = useState<Record<string, boolean>>({});

  // For each bus, get live location from WebSocket
  const liveLocations = (buses || []).map(bus => {
    // Custom hook returns null if WebSocket fails
    const location = useBusLocationWebSocket(bus.id, wsUrlBase);
    return { bus, location };
  });

  // Fallback: fetch last known location from backend if WebSocket fails
  useEffect(() => {
    const fetchFallbacks = async () => {
      const failedIds = buses.filter(b => wsFailed[b.id]).map(b => b.id);
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
      } catch {}
    };
    fetchFallbacks();
  }, [buses, wsFailed]);

  return (
    <div className="w-full h-[40vh] rounded-2xl overflow-hidden shadow-xl border border-blue-200 dark:border-gray-700 relative">
      <MapContainer center={DEFAULT_CENTER as [number, number]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds buses={buses} />
        {liveLocations.map(({ bus, location }) => {
          if (location && location.latitude && location.longitude) {
            return (
              <Marker
                key={bus.id}
                position={[location.latitude, location.longitude]}
                icon={busIcon}
              >
                <Popup>
                  <div>
                    <strong>{t('bus_map.bus', 'Bus')}:</strong> {bus.number}<br />
                    <strong>{t('bus_map.driver', 'Driver')}:</strong> {bus.driver?.name || t('bus_map.na', 'N/A')}<br />
                    <strong>{t('bus_map.location', 'Location')}:</strong> {location.latitude}, {location.longitude}<br />
                  </div>
                </Popup>
              </Marker>
            );
          } else if (wsFailed[bus.id] && fallbackLocations[bus.id]) {
            // Show fallback marker with message
            const fallback = fallbackLocations[bus.id];
            return (
              <Marker
                key={bus.id}
                position={[fallback.latitude, fallback.longitude]}
                icon={busIcon}
              >
                <Popup>
                  <div>
                    <strong>{t('bus_map.bus', 'Bus')}:</strong> {bus.number}<br />
                    <strong>{t('bus_map.driver', 'Driver')}:</strong> {bus.driver?.name || t('bus_map.na', 'N/A')}<br />
                    <strong>{t('bus_map.location', 'Location')}:</strong> {fallback.latitude}, {fallback.longitude}<br />
                    <span className="text-red-500 font-semibold block mt-2">{t('bus_map.driver_not_sharing', 'Driver is not started sharing location yet')}</span>
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
