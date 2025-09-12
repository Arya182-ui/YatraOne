import { useEffect, useRef, useState } from 'react';

export interface BusLocation {
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp?: string;
}

interface UseBusLocationWebSocketOptions {
  onError?: () => void;
}

export function useBusLocationWebSocket(
  busId: string,
  wsUrlBase: string,
  options?: UseBusLocationWebSocketOptions
): BusLocation | null {
  const [location, setLocation] = useState<BusLocation | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const errorCalled = useRef(false);

  useEffect(() => {
    if (!busId) return;
    errorCalled.current = false;
    const url = `${wsUrlBase.replace(/\/$/, '')}/ws/bus-location/${busId}`;
    wsRef.current = new WebSocket(url.replace('http', 'ws'));
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          setLocation({
            latitude: data.latitude,
            longitude: data.longitude,
            speed: data.speed,
            timestamp: data.timestamp,
          });
        }
      } catch {}
    };
    wsRef.current.onerror = () => {
      if (!errorCalled.current && options?.onError) {
        errorCalled.current = true;
        options.onError();
      }
    };
    wsRef.current.onclose = () => {
      if (!errorCalled.current && options?.onError && !location) {
        errorCalled.current = true;
        options.onError();
      }
    };
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busId, wsUrlBase]);

  return location;
}
