/* ─────────────────────────────────────────────────────────────
   ENDFIELD INDUSTRIES // Home Assistant Interface Logic
   Supports Home Assistant WebSocket API & Interactive Mock Mode
   ───────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  // Bootup Loader Sequence
  setTimeout(() => {
    const loader = document.getElementById('ef-loader');
    if (loader) loader.classList.add('fade-out');
  }, 1800);

  // State Management
  const state = {
    connected: false,
    ws: null,
    haUrl: localStorage.getItem('ha_url') || '',
    haToken: localStorage.getItem('ha_token') || '',
    mockData: {
      'light.chandelure': { state: 'on', attributes: { brightness: 217, rgb_color: [255, 250, 1] } },
      'switch.shelf': { state: 'on' },
      'switch.extraplug': { state: 'off' },
      'sensor.shelf_energy': { state: '42.8' },
      'sensor.extraplug_energy': { state: '0.0' },
      'fan.core_300s_series': { state: 'on', attributes: { preset_mode: 'auto' } },
      'sensor.core_300s_series_pm2_5': { state: '8' },
      'sensor.core_300s_series_filter_lifetime': { state: '82' },
      'weather.forecast_home': { state: 'partlycloudy', attributes: { temperature: 24.5, humidity: 58, wind_speed: 14 } }
    }
  };

  // DOM Elements
  const liveTimeEl = document.getElementById('live-time');
  const liveDateEl = document.getElementById('live-date');
  const statusTextEl = document.getElementById('connection-status-text');
  const haConfigBtn = document.getElementById('ha-config-btn');
  const haModal = document.getElementById('ha-modal');
  const modalClose = document.getElementById('modal-close');
  const saveHaConfigBtn = document.getElementById('save-ha-config');
  const useMockBtn = document.getElementById('use-mock-mode');
  const haUrlInput = document.getElementById('ha-url-input');
  const haTokenInput = document.getElementById('ha-token-input');

  // Interactive Elements
  const toggleChandelure = document.getElementById('toggle-chandelure');
  const rangeChandelureBright = document.getElementById('range-chandelure-bright');
  const valChandelureBright = document.getElementById('val-chandelure-bright');
  const toggleShelf = document.getElementById('toggle-shelf');
  const valShelfEnergy = document.getElementById('val-shelf-energy');
  const toggleExtraplug = document.getElementById('toggle-extraplug');
  const valExtraplugEnergy = document.getElementById('val-extraplug-energy');
  const toggleFan = document.getElementById('toggle-fan');
  const valPm25 = document.getElementById('val-pm25');
  const valFilterPct = document.getElementById('val-filter-pct');
  const barFilterFill = document.getElementById('bar-filter-fill');

  // Clock Update
  function updateClock() {
    const now = new Date();
    liveTimeEl.textContent = now.toTimeString().split(' ')[0];
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    liveDateEl.textContent = `${year}-${month}-${day}`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Modal Handlers
  haConfigBtn.addEventListener('click', () => {
    haUrlInput.value = state.haUrl;
    haTokenInput.value = state.haToken;
    haModal.classList.remove('hidden');
  });

  modalClose.addEventListener('click', () => haModal.classList.add('hidden'));

  useMockBtn.addEventListener('click', () => {
    haModal.classList.add('hidden');
    setConnectionStatus(false, 'SYSTEM ONLINE (MOCK MODE)');
  });

  saveHaConfigBtn.addEventListener('click', () => {
    const url = haUrlInput.value.trim();
    const token = haTokenInput.value.trim();
    if (!url || !token) {
      alert('Please provide both Home Assistant Host URL and Long-Lived Access Token.');
      return;
    }
    localStorage.setItem('ha_url', url);
    localStorage.setItem('ha_token', token);
    state.haUrl = url;
    state.haToken = token;
    haModal.classList.add('hidden');
    connectWebSocket();
  });

  function setConnectionStatus(connected, message) {
    state.connected = connected;
    statusTextEl.textContent = message;
    const dot = document.querySelector('.status-dot');
    if (connected) {
      dot.style.background = '#00FF9A';
      dot.style.boxShadow = '0 0 8px #00FF9A';
    } else {
      dot.style.background = '#FFFA01';
      dot.style.boxShadow = '0 0 8px #FFFA01';
    }
  }

  // Home Assistant WebSocket API Connection
  function connectWebSocket() {
    if (!state.haUrl || !state.haToken) return;

    let wsUrl = state.haUrl.replace(/^http/, 'ws');
    if (!wsUrl.endsWith('/api/websocket')) {
      wsUrl = wsUrl.replace(/\/$/, '') + '/api/websocket';
    }

    setConnectionStatus(false, 'CONNECTING TO HA...');

    try {
      state.ws = new WebSocket(wsUrl);

      state.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        
        if (msg.type === 'auth_required') {
          state.ws.send(JSON.stringify({
            type: 'auth',
            access_token: state.haToken
          }));
        } else if (msg.type === 'auth_ok') {
          setConnectionStatus(true, 'HA WEBSOCKET ONLINE');
          // Subscribe to state changes
          state.ws.send(JSON.stringify({
            id: 1,
            type: 'subscribe_events',
            event_type: 'state_changed'
          }));
        } else if (msg.type === 'event' && msg.event.event_type === 'state_changed') {
          handleHAStateChange(msg.event.data);
        }
      };

      state.ws.onerror = (err) => {
        console.warn('HA WebSocket Error:', err);
        setConnectionStatus(false, 'CONNECTION FAILED (FALLBACK TO MOCK)');
      };

      state.ws.onclose = () => {
        setConnectionStatus(false, 'DISCONNECTED (MOCK MODE)');
      };
    } catch (e) {
      console.error(e);
      setConnectionStatus(false, 'ERROR (MOCK MODE)');
    }
  }

  function callHAService(domain, service, serviceData) {
    if (state.connected && state.ws) {
      state.ws.send(JSON.stringify({
        id: Date.now(),
        type: 'call_service',
        domain: domain,
        service: service,
        service_data: serviceData
      }));
    } else {
      console.log(`[Mock Service Call] ${domain}.${service}`, serviceData);
    }
  }

  function handleHAStateChange(eventData) {
    const entityId = eventData.entity_id;
    const newState = eventData.new_state;
    if (!newState) return;

    if (entityId === 'light.chandelure') {
      toggleChandelure.checked = newState.state === 'on';
      if (newState.attributes.brightness !== undefined) {
        const pct = Math.round((newState.attributes.brightness / 255) * 100);
        rangeChandelureBright.value = pct;
        valChandelureBright.textContent = `${pct}%`;
      }
    } else if (entityId === 'switch.shelf') {
      toggleShelf.checked = newState.state === 'on';
    } else if (entityId === 'switch.extraplug') {
      toggleExtraplug.checked = newState.state === 'on';
    } else if (entityId === 'sensor.shelf_energy') {
      valShelfEnergy.textContent = `${newState.state} W`;
    } else if (entityId === 'sensor.extraplug_energy') {
      valExtraplugEnergy.textContent = `${newState.state} W`;
    } else if (entityId === 'sensor.core_300s_series_pm2_5') {
      valPm25.textContent = newState.state;
    } else if (entityId === 'sensor.core_300s_series_filter_lifetime') {
      valFilterPct.textContent = `${newState.state}%`;
      barFilterFill.style.width = `${newState.state}%`;
    }
  }

  // Interactive UI Bindings
  toggleChandelure.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    callHAService('light', isChecked ? 'turn_on' : 'turn_off', { entity_id: 'light.chandelure' });
  });

  rangeChandelureBright.addEventListener('input', (e) => {
    const val = e.target.value;
    valChandelureBright.textContent = `${val}%`;
    const bright255 = Math.round((val / 100) * 255);
    callHAService('light', 'turn_on', { entity_id: 'light.chandelure', brightness: bright255 });
  });

  toggleShelf.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    valShelfEnergy.textContent = isChecked ? '42.8 W' : '0.0 W';
    callHAService('switch', isChecked ? 'turn_on' : 'turn_off', { entity_id: 'switch.shelf' });
  });

  toggleExtraplug.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    valExtraplugEnergy.textContent = isChecked ? '18.4 W' : '0.0 W';
    callHAService('switch', isChecked ? 'turn_on' : 'turn_off', { entity_id: 'switch.extraplug' });
  });

  toggleFan.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    const fanIcon = document.querySelector('.fan-icon-anim');
    if (isChecked) {
      fanIcon.style.animation = 'spin 3s linear infinite';
    } else {
      fanIcon.style.animation = 'none';
    }
    callHAService('fan', isChecked ? 'turn_on' : 'turn_off', { entity_id: 'fan.core_300s_series' });
  });

  // Color preset buttons
  document.querySelectorAll('.color-dot').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.color-dot').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const hexColor = e.target.dataset.color;
      console.log('Selected color:', hexColor);
    });
  });

  // Mode preset buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const mode = e.target.dataset.mode;
      callHAService('fan', 'set_preset_mode', { entity_id: 'fan.core_300s_series', preset_mode: mode });
    });
  });

  // PM2.5 Live Subtle Fluctuation Simulation for Mock Mode
  setInterval(() => {
    if (!state.connected) {
      const current = parseInt(valPm25.textContent, 10) || 8;
      const delta = (Math.random() - 0.5) * 2;
      const newVal = Math.max(4, Math.min(25, Math.round(current + delta)));
      valPm25.textContent = newVal;
    }
  }, 4000);

  // Auto-connect on load if saved credentials exist
  if (state.haUrl && state.haToken) {
    connectWebSocket();
  }
});
