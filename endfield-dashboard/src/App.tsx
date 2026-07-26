import "./index.css";

import { BootLoader } from "./components/BootLoader";
import { Header } from "./components/Header";
import { AirQualitySection } from "./components/sections/AirQualitySection";
import { CalendarSection } from "./components/sections/CalendarSection";
import { LightingSection } from "./components/sections/LightingSection";
import { WeatherSection } from "./components/sections/WeatherSection";
import { ENTITY } from "./constants";
import { useBootSequence } from "./hooks/useBootSequence";
import { useClock } from "./hooks/useClock";
import { useHomeAssistant } from "./hooks/useHomeAssistant";

function App() {
  const { time, date } = useClock();
  const { loading } = useBootSequence();
  const {
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
  } = useHomeAssistant();

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
