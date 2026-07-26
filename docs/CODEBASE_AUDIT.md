# Codebase Audit — HADashboardTheme

> Conducted: 2026-07-26

---

## Part 1: Root Directory Audit

### File Inventory

#### `app.js` (~10.5 KB, 274 lines)
- **Type:** Standalone vanilla JavaScript application
- **Purpose:** Original prototype of the Endfield Home Assistant dashboard. Connects to HA WebSocket API, fetches entity states (weather, lights, air quality, calendar), renders them into the DOM. Includes real-time clock updates, a 1.8s bootup loader animation, mock state management, HA WebSocket authentication flow, and interactive service calls (`callHAService`).
- **Status:** Legacy prototype — superseded by the React app in `endfield-dashboard/`

#### `index.html` (~22.4 KB, 571 lines)
- **Type:** HTML entry page for the standalone prototype
- **Purpose:** Full-page Endfield HUD preview with tactical corner brackets, animated bootup overlay ("INITIALIZING PROTOCOL AUTOMATION-CORE..."), top header with status pill and clock, topographic grid background, and grid sections for Lighting & Power, Air Quality, and Atmospheric Forecast.
- **Status:** Legacy prototype

#### `styles.css` (~18.5 KB, 944 lines)
- **Type:** CSS stylesheet for the standalone prototype
- **Purpose:** CSS custom properties (`--clr-primary: #FFFA01`, `--clr-pink: #E5007F`, `--clr-green: #00FF9A`, `--clr-bg-void: #0F0F0F`), technical font pairings, scanline overlay effects, keyframe animations (glitch, pulse, loadbar), dark industrial card styling, switch sliders, color selection dots, and modal dialogs.
- **Status:** Legacy prototype

#### `dashboard.yaml` (~5.7 KB, 188 lines)
- **Type:** Home Assistant Lovelace dashboard configuration
- **Purpose:** Defines a Lovelace section view ("ENDFIELD // TACTICAL DASHBOARD") using HA card components (`heading`, `tile`, `statistics-graph`, `weather-forecast`) with `card_mod` styling. Contains entity ID references used by the dashboard. Points to `http://192.168.1.110:8081` as Panel (iframe) view.
- **Status:** Active core config / entity reference

#### `general_ha_theme.yaml` (~5.1 KB, 100 lines)
- **Type:** Home Assistant theme definition
- **Purpose:** Defines the `Endfield Dark` theme. Configures HA theme variables (colors, typography, cards, dialogs, sidebars, switches, state icons) and injects global `card-mod` CSS including background SVG grid loading (`url('/local/contour_map.svg')`), tri-color side borders, hover animations, and `[SYS]` technical tags.
- **Status:** Active core config

#### `contour_map.svg` (~373 KB)
- **Type:** Vector graphic (created in Inkscape)
- **Purpose:** Topographic contour grid line pattern used as background texture in both the standalone web page and the HA theme (`url('/local/contour_map.svg')`).
- **Status:** Duplicate — a near-identical copy exists in `endfield-dashboard/public/contour_map.svg` (372,975 bytes vs 372,946 bytes)

#### `lib.typ` (~11.7 KB, 353 lines)
- **Type:** Typst document template library
- **Purpose:** Implements an Arknights: Endfield document theme for A4 PDF generation (inspired by `@preview/touying-endfield`). Contains color definitions, tri-color accent bars (`_accent-bar`), page headers/footers, alert/callout boxes, custom table layouts, styled code blocks, and outline formatting. Uses Inter and JetBrains Mono fonts.
- **Status:** Active documentation tooling

#### `.gitignore` (460 bytes, 31 lines)
- **Type:** Git configuration
- **Purpose:** Standard ignores for `node_modules/`, `dist/`, `build/`, `.env*`, logs, editor files. Also ignores the saved browser webpage asset folders.
- **Status:** Active

#### Saved Webpage Snapshots
| File | Size |
|---|---|
| `Arknights Endfield Tools & Database _ EndfieldTools.DEV.htm` + `_files/` | 321.6 KB |
| `Arknights_ Endfield - Over the Frontier, Into the Front.htm` + `_files/` | 630.1 KB |
| `Arknights_ Endfield - Over the Frontier, Into the Front2.htm` + `_files/` | 193.9 KB |

- **Type:** Browser "Save Page As" HTML snapshots
- **Purpose:** Design reference/inspiration — used for extracting color hex codes, layout structures, typography, and visual assets from official Endfield promotional websites and endfieldtools.dev.
- **Status:** Reference material (partially gitignored)

---

## Part 2: `endfield-dashboard/` Source Code Audit

### Core Application

#### `src/App.tsx` (~12,854 bytes, ~420 lines) ⚠️ GOD COMPONENT
- **Purpose:** Root React component managing the full application lifecycle
- **Current responsibilities (doing too much):**
  1. WebSocket connection to Home Assistant (connect, reconnect)
  2. HA authentication handshake (auth_required → auth_ok → auth_invalid)
  3. Entity state subscription and state management (~15 state variables)
  4. Boot sequence animation state machine (booting → loading → complete)
  5. Light control functions (toggleLight, setBrightness, setColorTemp)
  6. Entity data transformation (parsing HA states into component-friendly formats)
  7. Inline ~170-line manual login screen
  8. Layout rendering
- **Code smells:**
  - Single 420-line component mixing presentation with business logic
  - WebSocket logic interleaved with UI rendering
  - Entity parsing logic embedded in the component
  - No error boundary, no individual section loading states
  - Light control functions defined inline
  - Magic protocol strings hardcoded throughout
- **Extraction opportunities:**
  - `useHomeAssistant()` hook — WebSocket + auth + state + service calls
  - `useBootSequence()` hook — boot animation state machine
  - `useClock()` hook — clock logic
  - `LoginForm` component — inline login screen
  - Entity transformer utilities — data parsing functions

#### `src/App.css` (~2,891 bytes)
- **Purpose:** Styles for the App component — dashboard grid layout, section containers, boot animation
- **Notes:** Contains some leftover/generic Vite template styles. Hero styles may conflict with custom dashboard styles.

#### `src/main.tsx` (~283 bytes)
- **Purpose:** Standard React entry point. Renders `<App />` into `#root` with StrictMode.
- **Status:** Clean, no issues.

#### `src/constants.ts` (~1,079 bytes)
- **Purpose:** Centralizes HA connection config and entity ID mappings. Loads from `localStorage` first with `.env` fallbacks.
- **Notes:** Hardcoded default fallbacks (e.g., `light.chandelure`) could cause confusion if `.env` is missing.

#### `src/index.css` (~29,058 bytes) ⚠️ MONOLITHIC
- **Purpose:** Massive global stylesheet containing everything:
  - CSS variables / custom properties (design token system)
  - Base/reset styles and scrollbar styling
  - Boot loader animations
  - Header styles
  - Weather, Lighting, Air Quality, Calendar section styles
  - Responsive media queries
  - All `@keyframes` animations
  - Custom web fonts (`SDK-Sans-Regular`, `Novecentosanswide-Bold`)
- **Code smells:** 29KB / ~1500+ lines in a single file. Should be split into modular CSS files for maintainability.

### Models

#### `src/models/ha.ts` (~2,686 bytes)
- **Purpose:** TypeScript interfaces and Zod schemas for HA entities, attributes, WebSocket payloads, and state maps.
- **Status:** Clean and well-organized. Good use of Zod for validating unpredictable WebSocket data. Could use a few more types (light attributes, air quality attributes).

### Components

#### `components/Header.tsx` (~7,066 bytes)
- **Purpose:** Top navigation bar with system status, clock, Spotify media controls, and settings panel.
- **Notes:** Timer logic is self-contained. Settings panel embedded inline — could be extracted. Spotify logic heavily hardcoded.

#### `components/BootLoader.tsx` (~901 bytes)
- **Purpose:** Glitching Endfield loading screen overlay.
- **Status:** Clean, simple presentation component. No issues.

#### `components/icons/icons.tsx` (~9,495 bytes)
- **Purpose:** Raw SVG code for ~15+ Endfield icons (WeatherSunny, WeatherCloudy, LightBulb, Fan, etc.)
- **Notes:** All icons in a single large file. Could split by domain or use SVGR pipeline.

### Section Components

#### `sections/AirQualitySection.tsx` (~7,286 bytes)
- **Purpose:** Air purifier controls and PM2.5/PM10/NO2/O3/SO2/CO gauges with animated indicators, AQI badge, trend indicators.
- **Notes:** Well-structured, clean props interface. Contains hardcoded static SVG sparkline chart instead of real historical data.

#### `sections/CalendarSection.tsx` (~9,144 bytes)
- **Purpose:** Calendar view with upcoming events, date grid, and current day highlighting.
- **Notes:** Date parsing and sorting logic embedded in render body — could extract to utility.

#### `sections/LightingSection.tsx` (~9,754 bytes)
- **Purpose:** Light controls — toggle, brightness slider, color temperature slider.
- **Notes:** Slider drag state handled well. Takes callback props cleanly.

#### `sections/WeatherSection.tsx` (~11,880 bytes)
- **Purpose:** Largest section. Current weather, 5-day forecast, hourly forecast, weather detail cards (humidity, wind, pressure, UV, visibility, feels-like).
- **Notes:** Weather icon mapping logic embedded — could be a utility. Contains mock data fallback logic. Drag-to-scroll logic mixed with rendering.

### Configuration & Build

| File | Purpose | Status |
|---|---|---|
| `package.json` | Vite + React 19, oxlint, TypeScript 5.8 | Clean, no test framework |
| `vite.config.ts` | Standard Vite + React plugin | Clean |
| `tsconfig*.json` | TypeScript configuration (3 files) | Standard |
| `.oxlintrc.json` | Linter config | Clean |
| `.env` | HA credentials (VITE_HA_URL, VITE_HA_TOKEN, VITE_HA_PORT) | ⚠️ Contains real token |
| `.gitignore` | Standard Node ignores | Clean |

### Deployment & CI/CD

| File | Purpose |
|---|---|
| `Jenkinsfile` | Multibranch pipeline — builds Docker image, pushes to `localhost:5000` |
| `Dockerfile` | Multi-stage build: Vite app → Nginx Alpine container |
| `deploy/docker-compose.yml` | Main app compose with Watchtower |
| `deploy/app/docker-compose.yml` | App container definition |
| `deploy/jenkins/Dockerfile` + `docker-compose.yml` | Jenkins CI container |
| `deploy/registry/docker-compose.yml` | Docker registry on port 5000 |
| `deploy/gitea/docker-compose.yml` | Gitea Actions migration stack |
| `deploy/setup_almalinux_docker.sh` | Server Docker setup script |
| `deploy/setup_almalinux_jenkins.sh` | Server Jenkins setup script |
| `deploy/endfield-dashboard.nginx.conf` | Nginx reverse proxy config |

### Utilities & Documentation

| File | Purpose | Recommended Location |
|---|---|---|
| `scrape.mjs` | Puppeteer script to scrape 3D models from Endfield website | `scripts/` |
| `agent.md` | AI agent instruction file (project context, coding guidelines) | `docs/` |
| `design_document.md` | Design document (color palette, fonts, UI textures, architecture) | `docs/` |
| `README.md` | Project readme | Root (keep) |

### Public Assets

| File | Size | Purpose |
|---|---|---|
| `public/bg_1.png` | 1.18 MB | Background image |
| `public/blurred_logo.png` | 101 KB | Blurred logo overlay |
| `public/contour_map.svg` | 373 KB | Topographic grid background |
| `public/favicon.svg` | 9.5 KB | Browser favicon |
| `public/icons.svg` | 5 KB | SVG icon sprite |
| `public/title.svg` | 3 KB | Title graphic |
| `public/video1.mp4` | 41.7 MB | Background video |
| `public/video2.mp4` | 53.2 MB | Background video |
| `public/models/*.bin` (6 files) | ~2.6 MB total | 3D model binary data |

### Source Assets

| File | Size | Status |
|---|---|---|
| `src/assets/hero.png` | 13 KB | Used |
| `src/assets/react.svg` | 4.1 KB | ❌ Vite boilerplate — unused |
| `src/assets/vite.svg` | 8.7 KB | ❌ Vite boilerplate — unused |

### Empty Directories
- `src/styles/` — empty (should house split CSS)
- `src/utils/` — empty (should house extracted utilities)

---

## Severity Summary

| Issue | Severity | Impact |
|---|---|---|
| `App.tsx` god component (420 lines, ~15 state vars) | 🔴 High | Maintainability, testability |
| `index.css` monolith (29KB, 1500+ lines) | 🔴 High | Maintainability |
| Root directory cluttered with legacy/reference files | 🟡 Medium | Developer experience |
| No test framework configured | 🟡 Medium | Quality assurance |
| Empty `src/styles/` and `src/utils/` directories | 🟢 Low | Confusing structure |
| Vite boilerplate assets still present | 🟢 Low | Cleanliness |
| `scrape.mjs` in project root | 🟢 Low | Organization |
