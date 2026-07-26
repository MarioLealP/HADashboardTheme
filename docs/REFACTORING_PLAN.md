# Repository Refactoring Plan

> Created: 2026-07-26 | Based on [CODEBASE_AUDIT.md](./CODEBASE_AUDIT.md)

---

## Phase 1: Root Directory Cleanup

### Move legacy prototype files → `archive/prototype/`
These three files are the original vanilla JS dashboard, superseded by the React app:
- `app.js`
- `index.html`
- `styles.css`

### Move saved webpage reference → `reference/saved-pages/`
These are browser "Save As" snapshots used for design inspiration:
- `Arknights Endfield Tools & Database _ EndfieldTools.DEV.htm` + `_files/`
- `Arknights_ Endfield - Over the Frontier, Into the Front.htm` + `_files/`
- `Arknights_ Endfield - Over the Frontier, Into the Front2.htm` + `_files/`

### Move HA config files → `docs/home-assistant/`
- `dashboard.yaml` — HA Lovelace config (entity reference)
- `general_ha_theme.yaml` — HA theme definition

### Move Typst design doc tooling → `docs/typst/`
- `lib.typ` — Typst library for generating design PDFs

### Delete duplicate
- `contour_map.svg` — identical copy already exists in `endfield-dashboard/public/`

### Resulting root structure:
```
HADashboardTheme/
├── .git/
├── .github/
├── .gitignore
├── archive/prototype/          ← legacy vanilla JS prototype
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── docs/
│   ├── CICD_MIGRATION_GITEA.md
│   ├── CODEBASE_AUDIT.md
│   ├── COSMOS_CLOUD_ROUTES.md
│   ├── REFACTORING_PLAN.md
│   ├── SERVER_ARCHITECTURE.md
│   ├── home-assistant/
│   │   ├── dashboard.yaml
│   │   └── general_ha_theme.yaml
│   └── typst/
│       └── lib.typ
├── endfield-dashboard/         ← the actual app
└── reference/saved-pages/      ← design reference snapshots
```

---

## Phase 2: `endfield-dashboard/` Source Code Refactoring

### 2A. Break up `App.tsx` god component (~420 lines → ~80 lines)

**Extract `src/hooks/useHomeAssistant.ts`**
- WebSocket connection/reconnection logic
- HA authentication handshake (auth_required → auth_ok flow)
- Entity state subscription and state management
- Light control functions (toggleLight, setBrightness, setColorTemp)
- Exports: `{ entities, isConnected, toggleLight, setBrightness, setColorTemp }`

**Extract `src/hooks/useBootSequence.ts`**
- Boot animation state machine (booting → loading → complete)
- Timing/phase transition logic
- Exports: `{ bootPhase, isBootComplete }`

**Extract `src/services/entityTransformers.ts`**
- `transformWeatherData(entities)` → WeatherSection props
- `transformLightingData(entities)` → LightingSection props
- `transformAirQualityData(entities)` → AirQualitySection props
- `transformCalendarData(entities)` → CalendarSection props

**Resulting `App.tsx`** becomes a clean layout shell (~50-80 lines):
```tsx
function App() {
  const { entities, isConnected, toggleLight, setBrightness, setColorTemp } = useHomeAssistant();
  const { bootPhase, isBootComplete } = useBootSequence(isConnected);
  
  const weather = transformWeatherData(entities);
  const lighting = transformLightingData(entities);
  const airQuality = transformAirQualityData(entities);
  const calendar = transformCalendarData(entities);

  return (
    <div className="dashboard">
      {!isBootComplete && <BootLoader phase={bootPhase} />}
      <Header isConnected={isConnected} />
      <WeatherSection {...weather} />
      <LightingSection {...lighting} onToggle={toggleLight} ... />
      <AirQualitySection {...airQuality} />
      <CalendarSection {...calendar} />
    </div>
  );
}
```

### 2B. Split `index.css` monolith (~29KB → modular files)

Split into `src/styles/`:

| New File | Contents |
|---|---|
| `variables.css` | CSS custom properties / design tokens |
| `base.css` | Reset, scrollbar, global base styles |
| `animations.css` | All `@keyframes` definitions |
| `bootloader.css` | Boot animation styles |
| `header.css` | Header component styles |
| `weather.css` | Weather section styles |
| `lighting.css` | Lighting section styles |
| `air-quality.css` | Air quality section styles |
| `calendar.css` | Calendar section styles |

The `index.css` becomes a barrel file:
```css
@import './styles/variables.css';
@import './styles/base.css';
@import './styles/animations.css';
@import './styles/bootloader.css';
@import './styles/header.css';
@import './styles/weather.css';
@import './styles/lighting.css';
@import './styles/air-quality.css';
@import './styles/calendar.css';
```

### 2C. Move misplaced files

| File | From | To |
|---|---|---|
| `scrape.mjs` | project root | `scripts/scrape.mjs` |
| `agent.md` | project root | `docs/agent.md` |
| `design_document.md` | project root | `docs/design_document.md` |

### 2D. Clean up unused files
- Delete `src/assets/react.svg` — Vite boilerplate, unused
- Delete `src/assets/vite.svg` — Vite boilerplate, unused

### Final `endfield-dashboard/` structure:
```
endfield-dashboard/
├── .env
├── .gitignore
├── .oxlintrc.json
├── Dockerfile
├── Jenkinsfile
├── README.md
├── deploy/                     ← unchanged
├── docs/
│   ├── agent.md
│   └── design_document.md
├── index.html
├── package.json
├── public/                     ← unchanged
├── scripts/
│   └── scrape.mjs
├── src/
│   ├── App.tsx                 ← slim layout shell (~80 lines)
│   ├── App.css
│   ├── main.tsx
│   ├── constants.ts
│   ├── index.css               ← barrel @imports only
│   ├── assets/
│   │   └── hero.png
│   ├── components/
│   │   ├── BootLoader.tsx
│   │   ├── Header.tsx
│   │   ├── icons/
│   │   │   └── icons.tsx
│   │   └── sections/
│   │       ├── AirQualitySection.tsx
│   │       ├── CalendarSection.tsx
│   │       ├── LightingSection.tsx
│   │       └── WeatherSection.tsx
│   ├── hooks/
│   │   ├── useHomeAssistant.ts
│   │   └── useBootSequence.ts
│   ├── models/
│   │   └── ha.ts
│   ├── services/
│   │   └── entityTransformers.ts
│   └── styles/
│       ├── variables.css
│       ├── base.css
│       ├── animations.css
│       ├── bootloader.css
│       ├── header.css
│       ├── weather.css
│       ├── lighting.css
│       ├── air-quality.css
│       └── calendar.css
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Execution Order

1. **Phase 1** — Root cleanup (`git mv` operations)
2. **Phase 2A** — Extract hooks and services from App.tsx
3. **Phase 2B** — Split index.css into modular stylesheets
4. **Phase 2C** — Move scrape.mjs, agent.md, design_document.md
5. **Phase 2D** — Delete unused boilerplate assets
6. **Verify** — Run `npm run build` to ensure everything compiles
