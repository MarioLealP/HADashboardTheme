# Endfield Home Assistant dashboard

A wall-tablet dashboard for Home Assistant in the style of *Arknights: Endfield*: a boot sequence, a clock header,
and sections for lighting, weather, air quality and the calendar. React 19 + TypeScript + Vite, talking to Home
Assistant over its WebSocket API (`src/hooks/useHomeAssistant.ts`).

Status: an early prototype (2026-07), not maintained. My Home Assistant now uses its own native dashboards.

- `endfield-dashboard/` - the app (`npm install && npm run dev`). Entity ids come from `VITE_ENTITY_*` variables
  (`src/constants.ts`).
- `endfield-dashboard/docs/design_document.md` - the palette, type and motion studied from the game's website.
- `docs/home-assistant/` - a matching theme and YAML dashboard for Home Assistant itself.

**Security note:** the app takes a Home Assistant long-lived token in the browser (typed in, or baked in at build
time). Anyone who can load the page can read that token, so only ever run it on a trusted LAN screen. A proper
version would sit behind a reverse proxy that holds the credential.

Game art, 3D models and videos are not included (they belong to Hypergryph / GRYPHLINE); put your own in
`endfield-dashboard/public/`. Code: MIT, see `LICENSE`.
