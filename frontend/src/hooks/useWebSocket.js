import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = 'ws://localhost:3001';
const RECONNECT_DELAY = 3000;

export function useWebSocket() {
  const [products, setProducts] = useState([]);
  const [lastScan, setLastScan] = useState(null);
  const [connectedClients, setConnectedClients] = useState(0);
  const [wsStatus, setWsStatus] = useState('disconnected'); // 'connected' | 'disconnected' | 'reconnecting'
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const unmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (unmountedRef.current) return;

    setWsStatus('reconnecting');
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      if (unmountedRef.current) return;
      setWsStatus('connected');
    };

    ws.onmessage = (event) => {
      if (unmountedRef.current) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'UPDATE') {
          setProducts(data.products || []);
          if (data.lastScan) setLastScan(data.lastScan);
        } else if (data.type === 'CLIENTS') {
          setConnectedClients(data.count || 0);
        }
      } catch (e) {
        console.error('Erreur parsing WebSocket :', e);
      }
    };

    ws.onclose = () => {
      if (unmountedRef.current) return;
      setWsStatus('disconnected');
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
    };

    ws.onerror = (err) => {
      console.error('WebSocket erreur :', err);
      ws.close();
    };
  }, []);

  useEffect(() => {
    unmountedRef.current = false;
    connect();
    return () => {
      unmountedRef.current = true;
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return { products, setProducts, lastScan, connectedClients, wsStatus };
}
