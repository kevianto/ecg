import { useState, useEffect, useRef } from 'react';
import { ECGReading } from '../types';

export const useWebSocket = (url: string) => {
  const [data, setData] = useState<ECGReading | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    try {
      setConnectionStatus('connecting');
      setError(null);
      
      ws.current = new WebSocket(url);
      
      ws.current.onopen = () => {
        setConnectionStatus('connected');
        setError(null);
        console.log('WebSocket connected to:', url);
      };
      
      ws.current.onmessage = (event) => {
        try {
          const reading: ECGReading = JSON.parse(event.data);
          setData(reading);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          setError('Invalid data format received');
        }
      };
      
      ws.current.onclose = () => {
        setConnectionStatus('disconnected');
        console.log('WebSocket disconnected');
        
        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
      
      ws.current.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Connection error');
        setConnectionStatus('disconnected');
      };
    } catch (err) {
      console.error('Failed to connect to WebSocket:', err);
      setError('Failed to connect');
      setConnectionStatus('disconnected');
    }
  };

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  return { data, connectionStatus, error, reconnect: connect };
};