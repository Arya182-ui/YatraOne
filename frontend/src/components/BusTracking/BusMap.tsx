import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import busMarkerUrl from '../../assets/bus-marker.svg';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Bus } from '../../types';
import api from '../../lib/api';

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
  const [etas, setEtas] = useState<{ [busId: string]: string | null }>({});

  useEffect(() => {
    async function fetchEtas() {
      const newEtas: { [busId: string]: string | null } = {};
      await Promise.all(
        (buses || []).map(async (bus) => {
          if (bus.currentLocation?.latitude && bus.currentLocation?.longitude && bus.route) {
            try {
              // For demo, use route's end as destination
              const res = await api.post('/bus-eta', {
                bus_lat: bus.currentLocation.latitude,
                bus_lon: bus.currentLocation.longitude,
                speed: bus.speed,
                route_id: bus.route,
              });
              if (res.data && typeof res.data.eta_minutes !== 'undefined' && res.data.eta_minutes !== null) {
                newEtas[bus.id] = res.data.eta_minutes + ' min';
              } else {
                newEtas[bus.id] = 'N/A';
              }
            } catch {
              newEtas[bus.id] = 'N/A';
            }
          } else {
            newEtas[bus.id] = 'N/A';
          }
        })
      );
      setEtas(newEtas);
    }
    if (buses.length > 0) fetchEtas();
  }, [buses]);

  const { t } = useTranslation();
  return (
    <div className="w-full h-[40vh] rounded-2xl overflow-hidden shadow-xl border border-blue-200 dark:border-gray-700 relative">
      <MapContainer center={DEFAULT_CENTER as [number, number]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds buses={buses} />
        {(buses || []).map(bus => (
          bus.currentLocation?.latitude && bus.currentLocation?.longitude ? (
            <Marker
              key={bus.id}
              position={[bus.currentLocation.latitude, bus.currentLocation.longitude]}
              icon={busIcon}
            >
              <Popup>
                <div>
                  <strong>{t('bus_map.bus', 'Bus')}:</strong> {bus.number}<br />
                  <strong>{t('bus_map.driver', 'Driver')}:</strong> {bus.driver?.name || t('bus_map.na', 'N/A')}<br />
                  <strong>{t('bus_map.location', 'Location')}:</strong> {bus.currentLocation.address || `${bus.currentLocation.latitude}, ${bus.currentLocation.longitude}`}<br />
                  <strong>{t('bus_map.eta', 'ETA')}:</strong> {etas[bus.id] || t('bus_map.na', 'N/A')}
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
      {buses.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">{t('bus_map.no_bus_selected', 'No bus selected')}</div>
      )}
    </div>
  );
};

export default BusMap;
