import { useCallback, useEffect, useRef, useState } from "react";
import {
  HAEntityStateSchema,
  type HAServiceData,
  type HAStateChangedEvent,
  type HAStatesMap,
} from "../models/ha";

export function useHomeAssistant() {
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("OFFLINE");

  const [haUrl, setHaUrl] = useState(
    import.meta.env.VITE_HA_URL || localStorage.getItem("ha_url") || "",
  );
  const [haToken, setHaToken] = useState(
    import.meta.env.VITE_HA_TOKEN || localStorage.getItem("ha_token") || "",
  );

  const wsRef = useRef<WebSocket | null>(null);
  const msgIdRef = useRef(100);

  const [states, setStates] = useState<HAStatesMap>({});

  const handleHAStateChange = useCallback((eventData: HAStateChangedEvent) => {
    const entityId = eventData.entity_id;
    const newState = eventData.new_state;
    if (!newState) return;
    setStates((prev) => ({ ...prev, [entityId]: newState }));
  }, []);

  const connectWebSocket = useCallback(
    (url: string, token: string) => {
      if (wsRef.current) {
        wsRef.current.close();
      }

      let fullUrl = url;
      if (!/^https?:\/\//i.test(fullUrl)) {
        fullUrl = `http://${fullUrl}`;
      }
      let wsUrl = fullUrl.replace(/^http/i, "ws");
      if (!wsUrl.endsWith("/api/websocket")) {
        wsUrl = `${wsUrl.replace(/\/$/, "")}/api/websocket`;
      }

      setConnected(false);
      setIsConnecting(true);
      setStatusMsg("CONNECTING TO HA...");

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);

          if (msg.type === "auth_required") {
            ws.send(
              JSON.stringify({
                type: "auth",
                access_token: token,
              }),
            );
          } else if (msg.type === "auth_invalid") {
            setConnected(false);
            setIsConnecting(false);
            setStatusMsg("AUTHENTICATION FAILED");
          } else if (msg.type === "auth_ok") {
            setConnected(true);
            setIsConnecting(false);
            setStatusMsg("SYSTEM ONLINE");
            ws.send(
              JSON.stringify({
                id: 1,
                type: "get_states",
              }),
            );
            ws.send(
              JSON.stringify({
                id: 2,
                type: "subscribe_events",
                event_type: "state_changed",
              }),
            );
          } else if (msg.id === 1 && msg.type === "result" && msg.success) {
            const initialStates: HAStatesMap = {};
            if (Array.isArray(msg.result)) {
              msg.result.forEach((rawEntity: unknown) => {
                const parsed = HAEntityStateSchema.safeParse(rawEntity);
                if (parsed.success) {
                  initialStates[parsed.data.entity_id] = parsed.data;
                }
              });
            }
            setStates(initialStates);
          } else if (
            msg.type === "event" &&
            msg.event.event_type === "state_changed"
          ) {
            handleHAStateChange(msg.event.data);
          }
        };

        ws.onerror = (err) => {
          console.warn("HA WebSocket Error:", err);
          setConnected(false);
          setIsConnecting(false);
          setStatusMsg("CONNECTION FAILED");
        };

        ws.onclose = () => {
          setConnected(false);
          setIsConnecting(false);
          setStatusMsg("DISCONNECTED");
          wsRef.current = null;
        };
      } catch (e) {
        console.error(e);
        setConnected(false);
        setIsConnecting(false);
        setStatusMsg("ERROR");
      }
    },
    [handleHAStateChange],
  );

  useEffect(() => {
    if (
      haUrl &&
      haToken &&
      haToken !== "your_long_lived_access_token_here" &&
      !wsRef.current
    ) {
      connectWebSocket(haUrl, haToken);
    }
  }, [haUrl, haToken, connectWebSocket]);

  const callHAService = useCallback(
    (domain: string, service: string, serviceData: HAServiceData) => {
      if (connected && wsRef.current) {
        msgIdRef.current += 1;
        wsRef.current.send(
          JSON.stringify({
            id: msgIdRef.current,
            type: "call_service",
            domain: domain,
            service: service,
            service_data: serviceData,
            target: {
              entity_id: serviceData.entity_id,
            },
          }),
        );
      }
    },
    [connected],
  );

  const handleManualLogin = useCallback(() => {
    if (haUrl && haToken) {
      localStorage.setItem("ha_url", haUrl);
      localStorage.setItem("ha_token", haToken);
      connectWebSocket(haUrl, haToken);
    }
  }, [haUrl, haToken, connectWebSocket]);

  return {
    connected,
    isConnecting,
    statusMsg,
    states,
    haUrl,
    haToken,
    setHaUrl,
    setHaToken,
    callHAService,
    handleManualLogin,
  };
}
