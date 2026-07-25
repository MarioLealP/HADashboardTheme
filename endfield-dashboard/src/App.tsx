import { useState, useEffect, useRef } from 'react';
import './index.css';

// Entities Configuration
const ENTITY = {
  MAIN_LIGHT: import.meta.env.VITE_ENTITY_MAIN_LIGHT || 'light.main_light',
  SHELF_SWITCH: import.meta.env.VITE_ENTITY_SHELF_SWITCH || 'switch.shelf',
  SHELF_POWER: import.meta.env.VITE_ENTITY_SHELF_POWER || 'sensor.shelf_energy',
  PLUG_SWITCH: import.meta.env.VITE_ENTITY_PLUG_SWITCH || 'switch.plug',
  PLUG_POWER: import.meta.env.VITE_ENTITY_PLUG_POWER || 'sensor.plug_energy',
  PURIFIER: import.meta.env.VITE_ENTITY_PURIFIER || 'fan.purifier',
  PM25: import.meta.env.VITE_ENTITY_PM25 || 'sensor.pm25',
  FILTER: import.meta.env.VITE_ENTITY_FILTER || 'sensor.filter',
  WEATHER: import.meta.env.VITE_ENTITY_WEATHER || 'weather.forecast_home',
};

function App() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('OFFLINE');
  
  const [haUrl, setHaUrl] = useState(import.meta.env.VITE_HA_URL || localStorage.getItem('ha_url') || '');
  const [haToken, setHaToken] = useState(import.meta.env.VITE_HA_TOKEN || localStorage.getItem('ha_token') || '');
  
  const wsRef = useRef<WebSocket | null>(null);

  // Initial Bootup Loader State
  const [loading, setLoading] = useState(true);

  // Entities State (Empty by default, waiting for live HA data)
  const [states, setStates] = useState<Record<string, any>>({});

  // Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0]);
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
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
    if (haUrl && haToken && haToken !== 'your_long_lived_access_token_here' && !wsRef.current) {
      connectWebSocket(haUrl, haToken);
    }
  }, []); 

  const connectWebSocket = (url: string, token: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    let wsUrl = url.replace(/^http/, 'ws');
    if (!wsUrl.endsWith('/api/websocket')) {
      wsUrl = wsUrl.replace(/\/$/, '') + '/api/websocket';
    }

    setConnected(false);
    setIsConnecting(true);
    setStatusMsg('CONNECTING TO HA...');

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        
        if (msg.type === 'auth_required') {
          ws.send(JSON.stringify({
            type: 'auth',
            access_token: token
          }));
        } else if (msg.type === 'auth_invalid') {
          setConnected(false);
          setIsConnecting(false);
          setStatusMsg('AUTHENTICATION FAILED');
        } else if (msg.type === 'auth_ok') {
          setConnected(true);
          setIsConnecting(false);
          setStatusMsg('SYSTEM ONLINE');
          // Fetch initial states
          ws.send(JSON.stringify({
            id: 1,
            type: 'get_states'
          }));
          // Subscribe to state changes
          ws.send(JSON.stringify({
            id: 2,
            type: 'subscribe_events',
            event_type: 'state_changed'
          }));
        } else if (msg.id === 1 && msg.type === 'result' && msg.success) {
          // Handle initial states
          const initialStates: Record<string, any> = {};
          msg.result.forEach((entity: any) => {
            initialStates[entity.entity_id] = entity;
          });
          setStates(initialStates);
        } else if (msg.type === 'event' && msg.event.event_type === 'state_changed') {
          handleHAStateChange(msg.event.data);
        }
      };

      ws.onerror = (err) => {
        console.warn('HA WebSocket Error:', err);
        setConnected(false);
        setIsConnecting(false);
        setStatusMsg('CONNECTION FAILED');
      };

      ws.onclose = () => {
        setConnected(false);
        setIsConnecting(false);
        setStatusMsg('DISCONNECTED');
        wsRef.current = null;
      };
    } catch (e) {
      console.error(e);
      setConnected(false);
      setIsConnecting(false);
      setStatusMsg('ERROR');
    }
  };

  const handleHAStateChange = (eventData: any) => {
    const entityId = eventData.entity_id;
    const newState = eventData.new_state;
    if (!newState) return;
    setStates(prev => ({ ...prev, [entityId]: newState }));
  };

  const callHAService = (domain: string, service: string, serviceData: any) => {
    if (connected && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        id: Date.now(),
        type: 'call_service',
        domain: domain,
        service: service,
        service_data: serviceData,
        target: {
          entity_id: serviceData.entity_id
        }
      }));
    }
  };

  const handleManualLogin = () => {
    if (haUrl && haToken) {
      localStorage.setItem('ha_url', haUrl);
      localStorage.setItem('ha_token', haToken);
      connectWebSocket(haUrl, haToken);
    }
  };

  // If not connected, show Login Screen (but wait for initial connection attempt)
  if (!connected && !loading && !isConnecting) {
    return (
      <div className="login-screen">
        <div className="hud-bracket top-left">┌</div>
        <div className="hud-bracket top-right">┐</div>
        <div className="hud-bracket bottom-left">└</div>
        <div className="hud-bracket bottom-right">┘</div>
        
        <div className="login-panel ef-card">
          <div className="ef-accent-bar">
            <div className="bar-pink"></div>
            <div className="bar-green"></div>
            <div className="bar-yellow"></div>
          </div>
          <div className="card-inner" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px' }}>
            <div style={{ textAlign: 'center' }}>
              <h1 className="brand-title" style={{ fontSize: '24px' }}>ENDFIELD <span className="brand-sub">INDUSTRIES</span></h1>
              <div className="brand-spec">ENDMINISTRATOR AUTHENTICATION REQUIRED</div>
              <div style={{ color: 'var(--clr-pink)', fontSize: '12px', marginTop: '10px' }}>{statusMsg}</div>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--clr-text-muted)' }}>HOME ASSISTANT URL</label>
              <input 
                type="text" 
                className="tech-input" 
                placeholder="http://homeassistant.local:8123"
                value={haUrl}
                onChange={e => setHaUrl(e.target.value)}
                style={{ padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--clr-card-border)', color: 'var(--clr-text-white)', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--clr-text-muted)' }}>LONG-LIVED ACCESS TOKEN</label>
              <input 
                type="password" 
                className="tech-input" 
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={haToken}
                onChange={e => setHaToken(e.target.value)}
                style={{ padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--clr-card-border)', color: 'var(--clr-text-white)', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <button 
              className="tech-btn primary-btn"
              onClick={handleManualLogin}
              style={{ padding: '12px', background: 'var(--clr-primary)', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
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
      {/* Tactical HUD Corner Brackets */}
      <div className="hud-bracket top-left">┌</div>
      <div className="hud-bracket top-right">┐</div>
      <div className="hud-bracket bottom-left">└</div>
      <div className="hud-bracket bottom-right">┘</div>

      {/* Endfield Bootup Loader */}
      <div id="ef-loader" className={`ef-loader-overlay ${!loading ? 'fade-out' : ''}`}>
        <div className="loader-content">
          <div className="loader-logo">EF</div>
          <div className="loader-text">INITIALIZING PROTOCOL AUTOMATION-CORE...</div>
          <div className="loader-sub">OVER THE FRONTIER, INTO THE FRONT</div>
          <div className="loader-progress">
            <div className="loader-bar"></div>
          </div>
        </div>
      </div>
      
      {/* Top Technical Header / Accent Bar */}
      <header className="endfield-header">
        <div className="accent-stripe">
          <div className="stripe-pink"></div>
          <div className="stripe-green"></div>
          <div className="stripe-yellow"></div>
        </div>
        
        <div className="header-content">
          <div className="brand-group">
            <div className="logo-box">
              <span className="logo-text">EF</span>
            </div>
            <div className="brand-titles">
              <h1 className="brand-title">ENDFIELD <span className="brand-sub">INDUSTRIES</span></h1>
              <div className="brand-spec">ENDMINISTRATOR COMMAND DASHBOARD // OS.v3.8</div>
            </div>
          </div>
          
          <div className="header-center-info">
            <div className="sys-status-pill">
              <span className="status-dot pulsing" style={{ background: connected ? '#00FF9A' : '#FFFA01', boxShadow: connected ? '0 0 8px #00FF9A' : '0 0 8px #FFFA01' }}></span>
              <span className="status-text">{statusMsg}</span>
            </div>
          </div>

          <div className="header-actions">
            <div className="clock-display">
              <span className="time-main">{time}</span>
              <span className="date-sub">{date}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Background SVG Map Overlay */}
      <div className="contour-bg-container">
        <img src="/contour_map.svg" alt="Topographic Contour Grid" className="contour-bg-img" />
        <div className="grid-scanlines"></div>
      </div>

      {/* Main Content Layout */}
      <main className="endfield-dashboard-grid">

        {/* Section 1: Light & Power */}
        <section className="dashboard-section" id="sec-lighting">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="sec-index">[SEC.01]</span>
              <h2 className="sec-title">LIGHTING & POWER CONTROL</h2>
            </div>
            <div className="sec-tag">WULING_AIC_HUB</div>
          </div>

          <div className="cards-grid">
            <article className="ef-card light-control-card">
              <div className="ef-accent-bar">
                <div className="bar-pink"></div>
                <div className="bar-green"></div>
                <div className="bar-yellow"></div>
              </div>
              <div className="card-inner">
                <div className="card-top">
                  <div className="icon-box">
                    <svg className="entity-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A7 7 0 0 0 5 9C5 11.38 6.19 13.47 8 14.74V17A1 1 0 0 0 9 18H15A1 1 0 0 0 16 17V14.74C17.81 13.47 19 11.38 19 9A7 7 0 0 0 12 2M9 21A1 1 0 0 0 10 22H14A1 1 0 0 0 15 21V20H9V21Z"/></svg>
                  </div>
                  <div className="entity-info">
                    <div className="entity-name">Main Light</div>
                    <div className="entity-id">{ENTITY.MAIN_LIGHT}</div>
                  </div>
                  <label className="ef-switch">
                    <input 
                      type="checkbox" 
                      checked={states[ENTITY.MAIN_LIGHT]?.state === 'on'} 
                      onChange={(e) => callHAService('light', e.target.checked ? 'turn_on' : 'turn_off', { entity_id: ENTITY.MAIN_LIGHT })} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                
                <div className="card-controls">
                  <div className="slider-group">
                    <div className="slider-header">
                      <span>BRIGHTNESS</span>
                      <span className="slider-val">{Math.round(((states[ENTITY.MAIN_LIGHT]?.attributes?.brightness || 0) / 255) * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      className="ef-range" 
                      min="0" max="100" 
                      value={Math.round(((states[ENTITY.MAIN_LIGHT]?.attributes?.brightness || 0) / 255) * 100)} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        const bright255 = Math.round((val / 100) * 255);
                        callHAService('light', 'turn_on', { entity_id: ENTITY.MAIN_LIGHT, brightness: bright255 });
                      }}
                    />
                  </div>
                </div>
              </div>
            </article>

            <article className="ef-card switch-card">
              <div className="ef-accent-bar">
                <div className="bar-pink"></div>
                <div className="bar-green"></div>
                <div className="bar-yellow"></div>
              </div>
              <div className="card-inner">
                <div className="card-top">
                  <div className="icon-box">
                    <svg className="entity-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M17 7H7A5 5 0 0 0 2 12A5 5 0 0 0 7 17H17A5 5 0 0 0 22 12A5 5 0 0 0 17 7M7 15A3 3 0 0 1 4 12A3 3 0 0 1 7 9A3 3 0 0 1 10 12A3 3 0 0 1 7 15Z"/></svg>
                  </div>
                  <div className="entity-info">
                    <div className="entity-name">Shelf Power Switch</div>
                    <div className="entity-id">{ENTITY.SHELF_SWITCH}</div>
                  </div>
                  <label className="ef-switch">
                    <input 
                      type="checkbox" 
                      checked={states[ENTITY.SHELF_SWITCH]?.state === 'on'} 
                      onChange={(e) => callHAService('switch', e.target.checked ? 'turn_on' : 'turn_off', { entity_id: ENTITY.SHELF_SWITCH })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                
                <div className="card-sensor-row">
                  <span className="sensor-label">LIVE CONSUMPTION:</span>
                  <span className="sensor-value">{states[ENTITY.SHELF_POWER]?.state || '0.0'} W</span>
                </div>
              </div>
            </article>

            <article className="ef-card switch-card">
              <div className="ef-accent-bar">
                <div className="bar-pink"></div>
                <div className="bar-green"></div>
                <div className="bar-yellow"></div>
              </div>
              <div className="card-inner">
                <div className="card-top">
                  <div className="icon-box">
                    <svg className="entity-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M16 7V3H14V7H10V3H8V7H7A2 2 0 0 0 5 9V14.5L8.5 18V21H15.5V18L19 14.5V9A2 2 0 0 0 17 7H16Z"/></svg>
                  </div>
                  <div className="entity-info">
                    <div className="entity-name">Auxiliary Plug</div>
                    <div className="entity-id">{ENTITY.PLUG_SWITCH}</div>
                  </div>
                  <label className="ef-switch">
                    <input 
                      type="checkbox" 
                      checked={states[ENTITY.PLUG_SWITCH]?.state === 'on'} 
                      onChange={(e) => callHAService('switch', e.target.checked ? 'turn_on' : 'turn_off', { entity_id: ENTITY.PLUG_SWITCH })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                
                <div className="card-sensor-row">
                  <span className="sensor-label">LIVE CONSUMPTION:</span>
                  <span className="sensor-value">{states[ENTITY.PLUG_POWER]?.state || '0.0'} W</span>
                </div>
              </div>
            </article>

          </div>
        </section>

        {/* Section 2: Air Quality */}
        <section className="dashboard-section" id="sec-air">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="sec-index">[SEC.02]</span>
              <h2 className="sec-title">AIR QUALITY & ATMOSPHERE</h2>
            </div>
            <div className="sec-tag">PROTOCOL_CORE</div>
          </div>

          <div className="cards-grid">
            <article className="ef-card fan-card">
              <div className="ef-accent-bar">
                <div className="bar-pink"></div>
                <div className="bar-green"></div>
                <div className="bar-yellow"></div>
              </div>
              <div className="card-inner">
                <div className="card-top">
                  <div className="icon-box fan-icon-anim" style={{ animation: states[ENTITY.PURIFIER]?.state === 'on' ? 'spin 3s linear infinite' : 'none' }}>
                    <svg className="entity-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"/></svg>
                  </div>
                  <div className="entity-info">
                    <div className="entity-name">Core 300S Air Purifier</div>
                    <div className="entity-id">{ENTITY.PURIFIER}</div>
                  </div>
                  <label className="ef-switch">
                    <input 
                      type="checkbox" 
                      checked={states[ENTITY.PURIFIER]?.state === 'on'} 
                      onChange={(e) => callHAService('fan', e.target.checked ? 'turn_on' : 'turn_off', { entity_id: ENTITY.PURIFIER })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="preset-modes">
                  <span className="preset-label">PRESET MODE:</span>
                  <div className="mode-buttons">
                    {['auto', 'sleep', 'favorite'].map(mode => (
                      <button 
                        key={mode}
                        className={`mode-btn ${states[ENTITY.PURIFIER]?.attributes?.preset_mode === mode ? 'active' : ''}`}
                        onClick={() => callHAService('fan', 'set_preset_mode', { entity_id: ENTITY.PURIFIER, preset_mode: mode })}
                      >
                        {mode.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            <article className="ef-card sensor-card">
              <div className="ef-accent-bar">
                <div className="bar-pink"></div>
                <div className="bar-green"></div>
                <div className="bar-yellow"></div>
              </div>
              <div className="card-inner">
                <div className="card-top">
                  <div className="icon-box text-green">
                    <svg className="entity-icon" viewBox="0 0 24 24" style={{ color: '#00FF9A' }}><path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>
                  </div>
                  <div className="entity-info">
                    <div className="entity-name">PM 2.5 Index</div>
                    <div className="entity-id">{ENTITY.PM25}</div>
                  </div>
                  <div className="tech-badge badge-good">OPTIMAL</div>
                </div>

                <div className="metric-display">
                  <span className="metric-big">{states[ENTITY.PM25]?.state || '--'}</span>
                  <span className="metric-unit">µg/m³</span>
                </div>

                <div className="sparkline-wrap">
                  <svg className="sparkline-chart" viewBox="0 0 200 40">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00FF9A" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="#00FF9A" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d="M0,35 Q30,25 60,30 T120,15 T180,22 L200,10 L200,40 L0,40 Z" fill="url(#chartGrad)"/>
                    <path d="M0,35 Q30,25 60,30 T120,15 T180,22 L200,10" fill="none" stroke="#00FF9A" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </article>

            <article className="ef-card gauge-card">
              <div className="ef-accent-bar">
                <div className="bar-pink"></div>
                <div className="bar-green"></div>
                <div className="bar-yellow"></div>
              </div>
              <div className="card-inner">
                <div className="card-top">
                  <div className="icon-box">
                    <svg className="entity-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"/></svg>
                  </div>
                  <div className="entity-info">
                    <div className="entity-name">Filter Lifetime Remaining</div>
                    <div className="entity-id">{ENTITY.FILTER}</div>
                  </div>
                </div>

                <div className="progress-bar-container">
                  <div className="progress-info">
                    <span>HEALTH STATUS</span>
                    <span className="progress-pct">{states[ENTITY.FILTER]?.state || '0'}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${states[ENTITY.FILTER]?.state || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Section 3: Weather Forecast */}
        <section className="dashboard-section" id="sec-weather">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="sec-index">[SEC.03]</span>
              <h2 className="sec-title">ATMOSPHERIC METRICS & FORECAST</h2>
            </div>
            <div className="sec-tag">TIANSHI_OBSERVATORY</div>
          </div>

          <div className="cards-grid weather-grid-layout">
            <article className="ef-card weather-main-card">
              <div className="ef-accent-bar">
                <div className="bar-pink"></div>
                <div className="bar-green"></div>
                <div className="bar-yellow"></div>
              </div>
              <div className="card-inner">
                <div className="weather-primary-row">
                  <div className="weather-icon-large">
                    <svg viewBox="0 0 24 24" width="56" height="56" fill="#FFFA01">
                      <path d="M12,6.5A5.5,5.5 0 0,1 17.5,12A5.5,5.5 0 0,1 12,17.5A5.5,5.5 0 0,1 6.5,12A5.5,5.5 0 0,1 12,6.5M12,2A1,1 0 0,1 13,3V4A1,1 0 0,1 12,5A1,1 0 0,1 11,4V3A1,1 0 0,1 12,2M12,19A1,1 0 0,1 13,20V21A1,1 0 0,1 12,22A1,1 0 0,1 11,21V20A1,1 0 0,1 12,19M4,11H3A1,1 0 0,1 2,12A1,1 0 0,1 3,13H4A1,1 0 0,1 5,12A1,1 0 0,1 4,11M21,11H20A1,1 0 0,1 19,12A1,1 0 0,1 20,13H21A1,1 0 0,1 22,12A1,1 0 0,1 21,11Z"/>
                    </svg>
                  </div>
                  <div className="weather-temp-wrap">
                    <span className="weather-temp">{states[ENTITY.WEATHER]?.attributes?.temperature || '--'}°C</span>
                    <span className="weather-state">{states[ENTITY.WEATHER]?.state || 'Unknown'}</span>
                  </div>
                  <div className="weather-sub-metrics">
                    <div className="sub-metric">
                      <span className="sub-label">HUMIDITY</span>
                      <span className="sub-val">{states[ENTITY.WEATHER]?.attributes?.humidity || '--'}%</span>
                    </div>
                    <div className="sub-metric">
                      <span className="sub-label">WIND</span>
                      <span className="sub-val">{states[ENTITY.WEATHER]?.attributes?.wind_speed || '--'} km/h</span>
                    </div>
                    <div className="sub-metric">
                      <span className="sub-label">PRESSURE</span>
                      <span className="sub-val">1014 hPa</span>
                    </div>
                  </div>
                </div>

              </div>
            </article>

          </div>
        </section>

      </main>
    </>
  );
}

export default App;
