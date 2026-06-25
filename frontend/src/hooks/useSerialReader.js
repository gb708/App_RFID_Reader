import { useState, useRef, useCallback } from 'react';

export function useSerialReader({ onScan }) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const portRef = useRef(null);
  const readerRef = useRef(null);
  const readingRef = useRef(false);

  const connect = useCallback(async () => {
    setError(null);

    if (!navigator.serial) {
      setError(
        "Votre navigateur ne supporte pas la Web Serial API. Utilisez Chrome ou Edge."
      );
      return;
    }

    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      portRef.current = port;
      setIsConnected(true);
      readingRef.current = true;

      const decoder = new TextDecoderStream();
      port.readable.pipeTo(decoder.writable);
      const reader = decoder.readable.getReader();
      readerRef.current = reader;

      let buffer = '';
      while (readingRef.current) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop(); // garder la partie incomplète
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed) {
            onScan(trimmed);
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Erreur Serial :', err);
        setError(`Erreur de connexion : ${err.message}`);
      }
      setIsConnected(false);
    }
  }, [onScan]);

  const disconnect = useCallback(async () => {
    readingRef.current = false;
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } catch (err) {
      console.error('Erreur déconnexion Serial :', err);
    }
    setIsConnected(false);
  }, []);

  return { isConnected, error, connect, disconnect };
}
