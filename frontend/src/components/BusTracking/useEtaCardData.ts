
import { useEffect, useState } from 'react';
import api, { reverseGeocodeAPI, busLocationAPI } from '../../lib/api';

// Fetches live bus location from /bus-locations-realtime and uses it for ETA, address, and status
export function useEtaCardData(bus: any, route: any) {
  const [eta, setEta] = useState('N/A');
  const [avgSpeed, setAvgSpeed] = useState('N/A');
  const [busAddress, setBusAddress] = useState('');
  const [busStatus, setBusStatus] = useState('');
  const [upcomingStop, setUpcomingStop] = useState('');
  const [liveLocation, setLiveLocation] = useState<any>(null);

  // Fetch live location for selected bus
  useEffect(() => {
    if (!bus || !bus.busNumber) {
      setLiveLocation(null);
      return;
    }
    let cancelled = false;
    async function fetchLive() {
      try {
        const all = await busLocationAPI.getAllLocations();
        const found = all.find((b: any) => b.id === bus.busNumber || b.bus_id === bus.busNumber || b.busNumber === bus.busNumber);
        if (!cancelled) setLiveLocation(found || null);
      } catch {
        if (!cancelled) setLiveLocation(null);
      }
    }
    fetchLive();
    const interval = setInterval(fetchLive, 10000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [bus]);

  // Fetch ETA and avg speed using live location
  useEffect(() => {
    async function fetchEta() {
      const loc = liveLocation || bus;
      if (loc && route && loc.latitude && loc.longitude) {
        try {
          const res = await api.post('/bus-eta', {
            bus_lat: loc.latitude,
            bus_lon: loc.longitude,
            speed: loc.speed,
            route_id: route.id || bus.route,
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
  }, [liveLocation, route, bus]);

  // Reverse geocode using live location
  useEffect(() => {
    const loc = liveLocation || bus;
    if (loc && loc.latitude && loc.longitude) {
      reverseGeocodeAPI.getAddress(loc.latitude, loc.longitude)
        .then(data => {
          if (data.address) {
            const name = data.address.bus_station || data.address.suburb || data.address.town || data.address.city || data.address.village || "";
            let district = data.address.county || data.address.state_district || "";
            const state = data.address.state || "";
            const country = data.address.country || "";
            if (name && district && name.toLowerCase() === district.toLowerCase()) district = "";
            setBusAddress([name, district, state, country].filter(Boolean).join(", "));
          } else {
            setBusAddress(data.display_name || `${loc.latitude}, ${loc.longitude}`);
          }
        })
        .catch(() => setBusAddress(`${loc.latitude}, ${loc.longitude}`));
    } else {
      setBusAddress("");
    }
  }, [liveLocation, bus]);

  // Status and next stop using live location
  useEffect(() => {
    const loc = liveLocation || bus;
    if (!route || !loc || !loc.latitude || !loc.longitude) {
      setBusStatus("");
      setUpcomingStop("");
      return;
    }
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
  }, [route, liveLocation, bus]);

  return { eta, avgSpeed, busAddress, busStatus, upcomingStop };
}
