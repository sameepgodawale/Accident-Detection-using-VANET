import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { AccidentAlert } from '@/types/emergency';
import { api, API_BASE_URL } from '@/lib/apiClient';

export function useAlerts() {
  const [alerts, setAlerts] = useState<AccidentAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>();

  // ── SAFE REST FETCH ───────────────────────────────────────────────
  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);

      const data = await api.get<AccidentAlert[]>('/alerts');

      const safeData = (data || [])
        .filter(Boolean) // ✅ remove undefined
        .map((a) => ({
          ...a,
          id: a?.id || a?._id || Math.random().toString(), // ✅ ensure id
          timestamp: new Date(a?.timestamp || Date.now()), // ✅ safe timestamp
        }));

      setAlerts(safeData);
      setError(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
      setAlerts([]); // ✅ prevent crash
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── SAFE WEBSOCKET (OPTIONAL) ─────────────────────────────────────
  const connectWs = useCallback(() => {
    try {
      const wsUrl = API_BASE_URL
        .replace(/^http/, 'ws')
        .replace(/\/api$/, '');

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (!msg?.data) return; // ✅ prevent crash

          const alert: AccidentAlert = {
            ...msg.data,
            id: msg.data?.id || msg.data?._id || Math.random().toString(),
            timestamp: new Date(msg.data?.timestamp || Date.now()),
          };

          setAlerts((prev) => {
            const safePrev = (prev || []).filter(Boolean);

            switch (msg.type) {
              case 'alert.new':
                toast.info('🚨 New Accident Detected', {
                  description: `${alert.address || "Unknown location"}`,
                });
                return [alert, ...safePrev];

              case 'alert.updated':
                return safePrev.map((a) =>
                  a.id === alert.id ? alert : a
                );

              case 'alert.resolved':
                return safePrev.filter((a) => a.id !== alert.id);

              default:
                return safePrev;
            }
          });

        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimeout.current = setTimeout(connectWs, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };

    } catch {
      // WebSocket not available → ignore
    }
  }, []);

  // ── INIT ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAlerts();

    // 🔴 KEEP DISABLED until backend WS fully ready
    // connectWs();

    return () => {
      wsRef.current?.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [fetchAlerts, connectWs]);

  // ── ACTIONS ──────────────────────────────────────────────────────
  const dispatchAlert = useCallback(async (alertId: string) => {
    try {
      const updated = await api.patch<AccidentAlert>(
        `/alerts/${alertId}/dispatch`,
        {}
      );

      setAlerts((prev) =>
        (prev || []).map((a) =>
          a.id === alertId
            ? {
                ...updated,
                id: updated?.id || updated?._id,
                timestamp: new Date(updated?.timestamp || Date.now()),
              }
            : a
        )
      );

      return updated;
    } catch (err) {
      throw err;
    }
  }, []);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      const updated = await api.patch<AccidentAlert>(
        `/alerts/${alertId}/acknowledge`,
        {}
      );

      setAlerts((prev) =>
        (prev || []).map((a) =>
          a.id === alertId
            ? {
                ...updated,
                id: updated?.id || updated?._id,
                timestamp: new Date(updated?.timestamp || Date.now()),
              }
            : a
        )
      );

      return updated;
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    alerts,
    isConnected,
    isLoading,
    error,
    dispatchAlert,
    acknowledgeAlert,
    refetch: fetchAlerts,
  };
}
