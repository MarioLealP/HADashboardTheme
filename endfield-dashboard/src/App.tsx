import { useEffect, useRef, useState } from "react";
import "./index.css";

import { BootLoader } from "./components/BootLoader";
import { Header } from "./components/Header";
import { AirQualitySection } from "./components/sections/AirQualitySection";
import { CalendarSection } from "./components/sections/CalendarSection";
import { LightingSection } from "./components/sections/LightingSection";
import { WeatherSection } from "./components/sections/WeatherSection";
import { ENTITY } from "./constants";
import type {
  HAEntityState,
  HAServiceData,
  HAStateChangedEvent,
  HAStatesMap,
} from "./models/ha";

function App() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
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

  // Initial Bootup Loader State
  const [loading, setLoading] = useState(true);

  // Entities State (Empty by default, waiting for live HA data)
  const [states, setStates] = useState<HAStatesMap>({});

  // Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toTimeString().split(" ")[0]);
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      setDate(`${year}-${month}-${day}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Loader Timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // HA WebSocket Connection Auto-connect
  useEffect(() => {
    if (
      haUrl &&
      haToken &&
      haToken !== "your_long_lived_access_token_here" &&
      !wsRef.current
    ) {
      connectWebSocket(haUrl, haToken);
    }
  }, []);

  const connectWebSocket = (url: string, token: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    let wsUrl = url.replace(/^http/, "ws");
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
          // Fetch initial states
          ws.send(
            JSON.stringify({
              id: 1,
              type: "get_states",
            }),
          );
          // Subscribe to state changes
          ws.send(
            JSON.stringify({
              id: 2,
              type: "subscribe_events",
              event_type: "state_changed",
            }),
          );
        } else if (msg.id === 1 && msg.type === "result" && msg.success) {
          // Handle initial states
          const initialStates: HAStatesMap = {};
          msg.result.forEach((entity: HAEntityState) => {
            initialStates[entity.entity_id] = entity;
          });
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
  };

  const handleHAStateChange = (eventData: HAStateChangedEvent) => {
    const entityId = eventData.entity_id;
    const newState = eventData.new_state;
    if (!newState) return;
    setStates((prev) => ({ ...prev, [entityId]: newState }));
  };

  const callHAService = (
    domain: string,
    service: string,
    serviceData: HAServiceData,
  ) => {
    if (connected && wsRef.current) {
      wsRef.current.send(
        JSON.stringify({
          id: Date.now(),
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
  };

  const handleManualLogin = () => {
    if (haUrl && haToken) {
      localStorage.setItem("ha_url", haUrl);
      localStorage.setItem("ha_token", haToken);
      connectWebSocket(haUrl, haToken);
    }
  };

  // If not connected, show Login Screen (but wait for initial connection attempt)
  if (!connected && !loading && !isConnecting) {
    return (
      <div
        className="login-screen"
        style={{
          backgroundImage: "url(/bg_1.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 10000,
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="hud-bracket top-left">┌</div>
        <div className="hud-bracket top-right">┐</div>
        <div className="hud-bracket bottom-left">└</div>
        <div className="hud-bracket bottom-right">┘</div>

        {/* Blurred Background Logo Accent */}
        <img
          src="/blurred_logo.png"
          alt="blurred logo"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.1,
            pointerEvents: "none",
            width: "80vw",
            maxWidth: "800px",
          }}
        />

        <div
          className="login-panel ef-card"
          style={{
            zIndex: 2,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            maxWidth: "500px",
            width: "90%",
          }}
        >
          <div className="ef-accent-bar">
            <div className="bar-pink"></div>
            <div className="bar-green"></div>
            <div className="bar-yellow"></div>
          </div>
          <div
            className="card-inner"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              padding: "40px",
            }}
          >
            <div
              style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <img
                src="/title.svg"
                alt="Endfield Title"
                style={{ height: "30px", filter: "brightness(0) invert(1)" }}
              />
              <div className="brand-spec" style={{ opacity: 0.7 }}>
                ENDMINISTRATOR AUTHENTICATION REQUIRED
              </div>
              <div
                style={{
                  color: "var(--clr-pink)",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {statusMsg}
              </div>
            </div>

            <div
              className="form-group"
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                htmlFor="ha-url-input"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--clr-text-muted)",
                }}
              >
                HOME ASSISTANT URL
              </label>
              <input
                id="ha-url-input"
                type="text"
                className="tech-input"
                placeholder="http://homeassistant.local:8123"
                value={haUrl}
                onChange={(e) => setHaUrl(e.target.value)}
                style={{
                  padding: "10px",
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid var(--clr-card-border)",
                  color: "var(--clr-text-white)",
                  fontFamily: "var(--font-mono)",
                }}
              />
            </div>

            <div
              className="form-group"
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                htmlFor="ha-token-input"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--clr-text-muted)",
                }}
              >
                LONG-LIVED ACCESS TOKEN
              </label>
              <input
                id="ha-token-input"
                type="password"
                className="tech-input"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={haToken}
                onChange={(e) => setHaToken(e.target.value)}
                style={{
                  padding: "10px",
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid var(--clr-card-border)",
                  color: "var(--clr-text-white)",
                  fontFamily: "var(--font-mono)",
                }}
              />
            </div>

            <button
              type="button"
              className="tech-btn primary-btn"
              onClick={handleManualLogin}
              style={{
                padding: "12px",
                background: "var(--clr-primary)",
                color: "#000",
                fontWeight: "bold",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
              }}
            >
              INITIALIZE CONNECTION
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Endfield Bootup Loader */}
      <BootLoader loading={loading} />

      {/* Top Technical Header / Accent Bar */}
      <Header
        connected={connected}
        statusMsg={statusMsg}
        time={time}
        date={date}
        spotifyState={states[ENTITY.SPOTIFY]}
        callHAService={callHAService}
      />

      {/* Background SVG Map Overlay */}
      <div className="contour-bg-container">
        <img
          src="/contour_map.svg"
          alt="Topographic Contour Grid"
          className="contour-bg-img"
        />
        <div className="grid-scanlines"></div>
      </div>

      {/* Main Content Layout */}
      <main className="endfield-dashboard-grid">
        {/* Tactical HUD Corner Brackets */}
        <div className="hud-bracket top-left">┌</div>
        <div className="hud-bracket top-right">┐</div>
        <div className="hud-bracket bottom-left">└</div>
        <div className="hud-bracket bottom-right">┘</div>

        <LightingSection states={states} callHAService={callHAService} />
        <AirQualitySection states={states} callHAService={callHAService} />
        <WeatherSection states={states} />
        <CalendarSection states={states} />
      </main>
    </>
  );
}

export default App;
