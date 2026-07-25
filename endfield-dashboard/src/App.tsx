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

// Official SVG Logo
const EndfieldLogoSvg = ({ width = "40", height = "20" }: { width?: string, height?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 74.14 36.99" width={width} height={height}>
    <path fillRule="evenodd" fill="currentColor" d="M3.37,13.25h7.9V9.68H3.37V7.37H9.68L11.46,5.6V3.82H0V19.45H11.6V15.81H3.37ZM7.52,1.18h.23l.36.62h.52L8.2,1.1A.51.51,0,0,0,8.53.59C8.53.16,8.19,0,7.77,0H7.05V1.8h.47Zm0-.81h.21c.22,0,.34,0,.34.22S8,.84,7.73.84H7.52ZM0,37H3.38V30.8H11V27.24H3.38v-2.3h7.8V21.41H0ZM.59,1.4h.58l.12.4h.49L1.17,0H.61L0,1.8H.48ZM.73.92C.78.74.83.54.88.35h0c0,.18.1.39.15.57l0,.15H.68Zm54.69.55a.82.82,0,0,1-.48-.18l-.27.29a1.19,1.19,0,0,0,.74.26c.47,0,.74-.26.74-.56A.49.49,0,0,0,55.77.8L55.52.71c-.17-.06-.3-.1-.3-.2s.09-.15.24-.15a.67.67,0,0,1,.4.14L56.1.23A1,1,0,0,0,55.46,0c-.42,0-.71.24-.71.54a.52.52,0,0,0,.39.48l.26.1c.16.06.27.09.27.2S55.59,1.47,55.42,1.47ZM12.46,37h3.39V26.09H12.5l3.35-3.34V21.41H12.46ZM21.35,1.22c0-.22,0-.46-.06-.66h0l.19.39L22,1.8h.48V0H22V.62a6.26,6.26,0,0,0,.06.65h0L21.87.88,21.38,0H20.9V1.8h.45ZM28.45,0H28V1.8h.48ZM39.34,19a6.45,6.45,0,0,0,2.22-1.22A5.88,5.88,0,0,0,42.9,16a7.87,7.87,0,0,0,.69-2,11.46,11.46,0,0,0,.18-2.09v-.63a11,11,0,0,0-.14-1.77,9.85,9.85,0,0,0-.45-1.69,4.78,4.78,0,0,0-.89-1.55A7.34,7.34,0,0,0,40.89,5a6.33,6.33,0,0,0-2-.85,12.06,12.06,0,0,0-2.74-.29H28.9V19.45h7.21A9.93,9.93,0,0,0,39.34,19Zm-7-3.28H28.94l3.36-3.36V7.52h3.54c2.91,0,4.36,1.33,4.36,4v.12q0,4-4.36,4ZM41.42,1.08h.65V1.8h.46V0h-.46V.71h-.65V0H41V1.8h.47Zm7,.72h.47V.39h.53V0H47.9V.39h.53Zm-13.59,0a1,1,0,0,0,.65-.22V.79h-.73v.35h.32v.29a.53.53,0,0,1-.19,0,.49.49,0,0,1-.54-.56.5.5,0,0,1,.5-.55.53.53,0,0,1,.36.14l.25-.27A.91.91,0,0,0,34.83,0a.91.91,0,0,0-1,.93A.88.88,0,0,0,34.84,1.84Zm-20.39-.5.21-.26.46.72h.52L14.93.74l.6-.71H15l-.56.7h0V0H14V1.8h.48Zm6.46,29.43h7.9V27.2h-7.9V24.88h6.33L29,23.13v-1.8H17.55V37h11.6V33.33H20.91Zm38.47,0h-.09v.12h.09ZM27.18,16.12V3.87H23.82v9.81L16.9,3.87H13.12v15.6h3.35V9.14l7.35,10.33ZM59.38,31h-.09v.13h.09Zm.56,0h-.18v.11h.18Zm8.89,2H66.91v.46h1.57v.74H66.91v.15l1.82,1.26v-.36l.5-.18V33.68h-.4ZM58.64,21.41V36.9h15.5V21.41Zm3.56,9.26h.22a.56.56,0,0,0,0-.12h.2l-.07.11h.32V31H63v.15h-.13v.25c0,.07,0,.11-.06.13a.36.36,0,0,1-.19,0,.42.42,0,0,0,0-.15h.1s0,0,0,0v-.24h-.39a.64.64,0,0,1-.2.42.63.63,0,0,0-.12-.11.52.52,0,0,0,.16-.31h-.14V31h.15Zm.38.75a.73.73,0,0,0-.18-.16l.1-.08a.55.55,0,0,1,.19.14Zm-1.51-.55v-.15h.45a.75.75,0,0,0-.06-.13l.16-.06s.06.12.08.16l-.08,0h.44v.15h-.55a.37.37,0,0,1,0,.11H62v.07c0,.29,0,.41-.09.46a.2.2,0,0,1-.13.06h-.19a.32.32,0,0,0-.06-.15h.24s0-.11.06-.28h-.32a.65.65,0,0,1-.31.46.45.45,0,0,0-.11-.13.61.61,0,0,0,.28-.59Zm-.87-.26H61v1h-.17V31.5h-.45v.07H60.2Zm-.59,0h.48v.82c0,.08,0,.12-.06.14a.38.38,0,0,1-.2,0,.47.47,0,0,0-.06-.15h.14s0,0,0,0v-.17h-.2a.54.54,0,0,1-.18.35.58.58,0,0,0-.12-.1.61.61,0,0,0,.17-.5Zm-.47,0h.38v.67h-.23v.09h-.15Zm0,2.74L60,31.76h.92l-1.23,2.33h-.57Zm2,2.84-2,.4v-.7l2-.41Zm12.79.41H71.45l-.72-.37V34.37l-.42.16v-.85h-.24v1l.46-.17v1l-1.62.6v.44l-2-1.42v1.38H66V35.21L64,36.6H62.82l-1.67-1.19.62-.46,1.65,1.14L66,34.31v-.15H64.41v-.74H66V33h-2v.18l-.86.6,1,.64v.88l-1.6-1.1-1.47,1v.12l-1.92.41v-.25l1.6-2.76H61l.68-.91h.9l-.32.43H66v-.46h.92v.46h2v.72h.27V32h.84v.94h.46v.6l.2-.08V32.29h.84v.85l.21-.08v-1.3h.84v1l1-.4v2.54l-.84.35V33.57l-.21.08V35.3l-.84.35V34l-.21.08v1.78h2.32Zm-12-1.78.63-.46.86.59v.92Zm.59-1.5L63,33H61.89Zm-2.5-2.58h-.18v.11h.18Zm1.14,3.07h-.21l-.43.83.38-.09v-.1l1-.72-.47-.32ZM42.62,33.2h0ZM34.05,21.39H30.66V37H41.59V33.11H34.05Zm22.86,3.87A4.74,4.74,0,0,0,56,23.72a6.75,6.75,0,0,0-1.4-1.24,6.06,6.06,0,0,0-2-.85,11.64,11.64,0,0,0-2.75-.3h-7.2V33.19l3.4-3.4V25h3.54q4.36,0,4.36,4v.13q0,4-4.36,4H42.63V37h7.22a9.91,9.91,0,0,0,3.22-.48,6.29,6.29,0,0,0,2.22-1.22,5.84,5.84,0,0,0,1.34-1.78,7.62,7.62,0,0,0,.69-2,11.54,11.54,0,0,0,.18-2.09v-.63A11.17,11.17,0,0,0,57.36,27,9.43,9.43,0,0,0,56.91,25.26Zm3.91,5.51h-.45V31h.45Zm0,.36h-.45v.21h.45Zm1.59-.23.1-.08h-.15V31h.19A.55.55,0,0,0,62.41,30.9Zm.17.12h.16v-.2h-.22a.61.61,0,0,1,.15.12Z" />
  </svg>
);

const IconGameplay = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 50" width="100%" height="100%"><path fillRule="evenodd" fill="currentColor" d="M23.312,44.301 L18.497,49.105 L12.435,43.800 L17.195,43.800 L17.195,41.198 L17.195,38.997 L12.435,38.997 L17.542,34.527 L18.497,33.692 L18.757,33.952 L19.966,35.157 L20.654,35.844 L23.312,38.496 L25.259,38.496 L35.436,38.496 L36.242,38.496 L36.948,38.496 L37.859,38.496 L40.277,38.496 L40.791,38.496 L40.791,44.301 L23.312,44.301 ZM36.948,36.085 L36.242,36.085 L24.317,36.085 L20.214,31.986 L19.966,31.739 L19.966,23.492 L20.306,23.294 L30.347,17.513 L36.948,21.315 L40.729,23.492 L40.729,36.085 L39.626,36.085 L36.948,36.085 ZM30.347,24.808 C27.763,24.808 25.668,26.898 25.668,29.470 C25.668,32.048 27.763,34.137 30.347,34.137 C32.926,34.137 35.021,32.048 35.021,29.470 C35.021,26.898 32.926,24.808 30.347,24.808 ZM30.347,14.731 L29.139,15.424 L18.757,21.402 L17.542,22.101 L17.542,31.318 L16.904,31.875 L10.842,37.179 L6.249,41.198 L0.002,41.198 L0.002,0.895 L27.651,0.895 C31.283,4.518 33.316,6.546 36.948,10.169 L36.948,18.527 L31.556,15.424 L30.347,14.731 ZM7.898,4.605 L3.720,4.605 L3.720,8.765 L7.898,8.765 L7.898,4.605 ZM13.947,4.605 L9.776,4.605 L9.776,8.765 L13.947,8.765 L13.947,4.605 Z"></path></svg>
);

const IconHome = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="100%" height="100%"><path fillRule="evenodd" fill="currentColor" d="M35.744,33.156 L39.625,29.275 L31.369,21.019 L31.369,18.013 L39.616,9.766 L35.735,5.885 L26.176,15.443 L26.192,15.459 L26.185,15.459 L26.185,16.780 L22.854,16.780 L22.854,13.449 L24.184,13.449 L24.184,13.442 L24.191,13.449 L33.750,3.890 L29.869,0.009 L21.612,8.265 L18.606,8.265 L10.359,0.018 L6.478,3.899 L16.037,13.458 L16.053,13.442 L16.053,13.449 L17.365,13.449 L17.365,16.780 L14.042,16.780 L14.042,15.451 L14.035,15.451 L14.042,15.443 L4.484,5.885 L0.603,9.766 L8.859,18.022 L8.859,21.028 L0.612,29.275 L4.493,33.156 L14.052,23.597 L14.036,23.582 L14.042,23.582 L14.042,22.269 L17.365,22.269 L17.365,25.592 L16.044,25.592 L16.044,25.599 L16.037,25.592 L6.478,35.151 L10.359,39.032 L18.615,30.776 L21.622,30.776 L29.869,39.023 L33.750,35.142 L24.191,25.583 L24.175,25.599 L24.175,25.592 L22.854,25.592 L22.854,22.269 L26.185,22.269 L26.185,23.590 L26.193,23.590 L26.185,23.597 L35.744,33.156 Z"></path></svg>
);

const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 40" width="100%" height="100%"><path fillRule="evenodd" fill="currentColor" d="M-0.002,40.010 L-0.002,5.448 L5.894,5.448 L5.894,10.171 L6.956,10.171 L6.956,8.485 L6.956,5.448 L6.956,-0.008 L12.072,-0.008 L12.072,5.448 L12.072,8.485 L12.072,10.171 L13.134,10.171 L13.134,5.448 L28.881,5.448 L28.881,10.171 L29.943,10.171 L29.943,8.485 L29.940,8.485 L29.940,-0.008 L35.056,-0.008 L35.056,5.448 L35.059,5.448 L35.059,10.171 L36.121,10.171 L36.121,5.448 L42.014,5.448 L42.014,40.010 L-0.002,40.010 ZM38.159,16.680 L3.853,16.680 L3.853,35.999 L38.159,35.999 L38.159,16.680 ZM9.511,22.456 L6.956,22.456 L6.956,19.889 L9.511,19.889 L9.511,22.456 ZM12.065,25.023 L9.511,25.023 L9.511,22.456 L12.065,22.456 L12.065,25.023 ZM12.065,30.156 L9.511,30.156 L9.511,27.590 L12.065,27.590 L12.065,30.156 ZM17.174,27.590 L17.174,30.156 L14.620,30.156 L14.620,27.590 L17.174,27.590 ZM22.283,27.590 L22.283,30.156 L19.729,30.156 L19.729,27.590 L22.283,27.590 ZM27.392,27.590 L27.392,30.156 L24.838,30.156 L24.838,27.590 L27.392,27.590 ZM32.501,27.590 L32.501,30.156 L29.947,30.156 L29.947,27.590 L32.501,27.590 ZM29.947,22.456 L32.501,22.456 L32.501,25.023 L29.947,25.023 L29.947,22.456 ZM24.838,25.023 L24.838,22.456 L27.392,22.456 L27.392,25.023 L24.838,25.023 ZM19.729,25.023 L19.729,22.456 L22.283,22.456 L22.283,25.023 L19.729,25.023 ZM14.620,25.023 L14.620,22.456 L17.174,22.456 L17.174,25.023 L14.620,25.023 ZM14.620,27.590 L12.065,27.590 L12.065,25.023 L14.620,25.023 L14.620,27.590 ZM19.729,25.023 L19.729,27.590 L17.174,27.590 L17.174,25.023 L19.729,25.023 ZM24.838,25.023 L24.838,27.590 L22.283,27.590 L22.283,25.023 L24.838,25.023 ZM29.947,25.023 L29.947,27.590 L27.392,27.590 L27.392,25.023 L29.947,25.023 ZM12.065,19.889 L14.620,19.889 L14.620,22.456 L12.065,22.456 L12.065,19.889 ZM17.174,19.889 L19.729,19.889 L19.729,22.456 L17.174,22.456 L17.174,19.889 ZM22.283,19.889 L24.838,19.889 L24.838,22.456 L22.283,22.456 L22.283,19.889 ZM27.392,19.889 L29.947,19.889 L29.947,22.456 L27.392,22.456 L27.392,19.889 ZM35.056,19.889 L35.056,22.456 L32.501,22.456 L32.501,19.889 L35.056,19.889 ZM35.056,25.023 L35.056,27.590 L32.501,27.590 L32.501,25.023 L35.056,25.023 ZM35.056,32.724 L32.501,32.724 L32.501,30.156 L35.056,30.156 L35.056,32.724 ZM29.947,32.724 L27.392,32.724 L27.392,30.156 L29.947,30.156 L29.947,32.724 ZM24.838,32.724 L22.283,32.724 L22.283,30.156 L24.838,30.156 L24.838,32.724 ZM19.729,32.724 L17.174,32.724 L17.174,30.156 L19.729,30.156 L19.729,32.724 ZM14.620,32.724 L12.065,32.724 L12.065,30.156 L14.620,30.156 L14.620,32.724 ZM6.956,32.724 L6.956,30.156 L9.511,30.156 L9.511,32.724 L6.956,32.724 ZM6.956,27.590 L6.956,25.023 L9.511,25.023 L9.511,27.590 L6.956,27.590 Z"></path></svg>
);

function App() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('OFFLINE');
  
  const [haUrl, setHaUrl] = useState(import.meta.env.VITE_HA_URL || localStorage.getItem('ha_url') || '');
  const [haToken, setHaToken] = useState(import.meta.env.VITE_HA_TOKEN || localStorage.getItem('ha_token') || '');
  
  const wsRef = useRef<WebSocket | null>(null);

  // Hourly Drag-to-Scroll State
  const hourlyScrollRef = useRef<HTMLDivElement>(null);
  const [isDraggingHourly, setIsDraggingHourly] = useState(false);
  const [hourlyStartX, setHourlyStartX] = useState(0);
  const [hourlyScrollLeft, setHourlyScrollLeft] = useState(0);

  const handleHourlyMouseDown = (e: React.MouseEvent) => {
    if (!hourlyScrollRef.current) return;
    setIsDraggingHourly(true);
    setHourlyStartX(e.pageX - hourlyScrollRef.current.offsetLeft);
    setHourlyScrollLeft(hourlyScrollRef.current.scrollLeft);
  };

  const handleHourlyMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingHourly || !hourlyScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - hourlyScrollRef.current.offsetLeft;
    const walk = (x - hourlyStartX) * 1.5; 
    hourlyScrollRef.current.scrollLeft = hourlyScrollLeft - walk;
  };

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
      <div className="login-screen" style={{ backgroundImage: 'url(/bg_1.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', zIndex: 10000, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="hud-bracket top-left">┌</div>
        <div className="hud-bracket top-right">┐</div>
        <div className="hud-bracket bottom-left">└</div>
        <div className="hud-bracket bottom-right">┘</div>
        
        {/* Blurred Background Logo Accent */}
        <img src="/blurred_logo.png" alt="blurred logo" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.1, pointerEvents: 'none', width: '80vw', maxWidth: '800px' }} />

        <div className="login-panel ef-card" style={{ zIndex: 2, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', maxWidth: '500px', width: '90%' }}>
          <div className="ef-accent-bar">
            <div className="bar-pink"></div>
            <div className="bar-green"></div>
            <div className="bar-yellow"></div>
          </div>
          <div className="card-inner" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '40px' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <img src="/title.svg" alt="Endfield Title" style={{ height: '30px', filter: 'brightness(0) invert(1)' }} />
              <div className="brand-spec" style={{ opacity: 0.7 }}>ENDMINISTRATOR AUTHENTICATION REQUIRED</div>
              <div style={{ color: 'var(--clr-pink)', fontSize: '12px', fontWeight: 'bold' }}>{statusMsg}</div>
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
          <div className="loader-logo" style={{ border: 'none', background: 'transparent' }}>
            <EndfieldLogoSvg width="60" height="30" />
          </div>
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
            <div className="logo-box" style={{ background: 'transparent', padding: '0 10px', display: 'flex', alignItems: 'center' }}>
              <EndfieldLogoSvg width="40" height="20" />
            </div>
            <div className="brand-titles">
              <img src="/title.svg" alt="Endfield Title" style={{ height: '14px', marginBottom: '4px', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
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
          <div className="section-header bg-hazard-stripes">
            <div className="section-title-wrap">
              <span className="sec-index"><IconGameplay /></span>
              <h2 className="sec-title">LIGHTING & POWER CONTROL</h2>

            </div>
            <div className="sec-tag">WULING_AIC_HUB</div>
          </div>

          <div className="cards-grid">
            <article className="ef-card light-control-card bg-dot-matrix">
              <div className={`ef-accent-bar ${states[ENTITY.MAIN_LIGHT]?.state === 'on' ? 'active' : ''}`}>
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

            <article className="ef-card switch-card bg-dot-matrix">
              <div className={`ef-accent-bar ${states[ENTITY.SHELF_SWITCH]?.state === 'on' ? 'active' : ''}`}>
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

            <article className="ef-card switch-card bg-dot-matrix">
              <div className={`ef-accent-bar ${states[ENTITY.PLUG_SWITCH]?.state === 'on' ? 'active' : ''}`}>
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
          <div className="section-header bg-hazard-stripes">
            <div className="section-title-wrap">
              <span className="sec-index"><IconHome /></span>
              <h2 className="sec-title">AIR QUALITY & ATMOSPHERE</h2>
            </div>
            <div className="sec-tag">PROTOCOL_CORE</div>
          </div>

          <div className="cards-grid">
            <article className="ef-card fan-card bg-dot-matrix">
              <div className={`ef-accent-bar ${states[ENTITY.PURIFIER]?.state === 'on' ? 'active' : ''}`}>
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

            <article className="ef-card sensor-card bg-dot-matrix">
              <div className="ef-accent-bar active">
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

            <article className="ef-card gauge-card bg-dot-matrix">
              <div className="ef-accent-bar active">
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
          <div className="section-header bg-hazard-stripes">
            <div className="section-title-wrap">
              <span className="sec-index"><IconCalendar /></span>
              <h2 className="sec-title">ATMOSPHERIC METRICS & FORECAST</h2>
            </div>
            <div className="sec-tag">TIANSHI_OBSERVATORY</div>
          </div>

          <div className="cards-grid weather-grid-layout">
            <article className="ef-card weather-main-card bg-dot-matrix">
              <div className="ef-accent-bar active">
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
                      <span className="sub-val">{states[ENTITY.WEATHER]?.attributes?.pressure || '1014'} hPa</span>
                    </div>
                  </div>
                </div>

                <div className="forecast-divider"><span>HOURLY PROJECTION</span></div>
                
                <div 
                  className="hourly-forecast-scroll"
                  ref={hourlyScrollRef}
                  onMouseDown={handleHourlyMouseDown}
                  onMouseLeave={() => setIsDraggingHourly(false)}
                  onMouseUp={() => setIsDraggingHourly(false)}
                  onMouseMove={handleHourlyMouseMove}
                >
                  {(() => {
                    const mockHourly = Array.from({ length: 24 }).map((_, i) => {
                      const d = new Date(Date.now() + 3600000 * (i + 1));
                      return {
                        datetime: d.toISOString(),
                        temperature: Math.round(20 + Math.sin(i / 4) * 8),
                        condition: i % 5 === 0 ? 'cloudy' : i % 8 === 0 ? 'rainy' : 'sunny'
                      };
                    });
                    const hourlyForecasts = states[ENTITY.WEATHER]?.attributes?.forecast || states[ENTITY.WEATHER]?.attributes?.hourly_forecast || mockHourly;
                    
                    return hourlyForecasts.slice(0, 24).map((hour: any, i: number) => {
                      const date = new Date(hour.datetime);
                      const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
                      return (
                        <div key={i} className="hourly-item">
                          <div className="h-time">{timeStr}</div>
                          <svg className="f-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', margin: '2px 0' }}>
                            {hour.condition.includes('rain') ? (
                              <>
                                <path d="M7 16a4 4 0 0 1-.88-7.9 6 6 0 0 1 11.76 0A4 4 0 0 1 17 16H7z" />
                                <path d="M8 19v2m4-2v2m4-2v2" />
                              </>
                            ) : hour.condition.includes('cloud') ? (
                              <path d="M7 16a4 4 0 0 1-.88-7.9 6 6 0 0 1 11.76 0A4 4 0 0 1 17 16H7z" />
                            ) : (
                              <>
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34L4.93 4.93" />
                              </>
                            )}
                          </svg>
                          <div className="h-temp">{hour.temperature}°</div>
                        </div>
                      );
                    });
                  })()}
                </div>

                <div className="forecast-divider"><span>5-DAY ATMOSPHERIC PROJECTION</span></div>
                
                <div className="weather-forecast-grid">
                  {(() => {
                    const mockForecast = [
                      { datetime: new Date(Date.now() + 86400000 * 1).toISOString(), condition: 'sunny', temperature: 28, templow: 18 },
                      { datetime: new Date(Date.now() + 86400000 * 2).toISOString(), condition: 'partlycloudy', temperature: 26, templow: 17 },
                      { datetime: new Date(Date.now() + 86400000 * 3).toISOString(), condition: 'cloudy', temperature: 24, templow: 16 },
                      { datetime: new Date(Date.now() + 86400000 * 4).toISOString(), condition: 'rainy', temperature: 22, templow: 15 },
                      { datetime: new Date(Date.now() + 86400000 * 5).toISOString(), condition: 'sunny', temperature: 29, templow: 19 },
                    ];
                    const forecasts = states[ENTITY.WEATHER]?.attributes?.forecast || mockForecast;
                    return forecasts.slice(0, 5).map((day: any, i: number) => {
                      const date = new Date(day.datetime);
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                      return (
                        <div key={i} className="forecast-day">
                          <div className="f-date">{dayName}</div>
                          <svg className="f-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {day.condition.includes('rain') ? (
                              <>
                                <path d="M7 16a4 4 0 0 1-.88-7.9 6 6 0 0 1 11.76 0A4 4 0 0 1 17 16H7z" />
                                <path d="M8 19v2m4-2v2m4-2v2" />
                              </>
                            ) : day.condition.includes('cloud') ? (
                              <path d="M7 16a4 4 0 0 1-.88-7.9 6 6 0 0 1 11.76 0A4 4 0 0 1 17 16H7z" />
                            ) : (
                              <>
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34L4.93 4.93" />
                              </>
                            )}
                          </svg>
                          <div className="f-temp-wrap">
                            <span className="f-temp-high">{day.temperature}°</span>
                            {day.templow && <span className="f-temp-low">/ {day.templow}°</span>}
                          </div>
                          <div className="f-condition">{day.condition}</div>
                        </div>
                      );
                    });
                  })()}
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
