# Endfield Dashboard Agent Guide

Welcome to the Home Assistant Endfield Dashboard project! This document serves as a guideline for AI agents and developers working on this codebase.

## 1. Project Overview

This project is a React-based frontend (powered by Vite and TypeScript) that connects to a Home Assistant instance via WebSockets. It acts as a custom dashboard theme heavily inspired by the UI aesthetics of "Arknights: Endfield."

## 2. Technology Stack

- **Framework**: React 18, TypeScript, Vite.
- **Styling**: Vanilla CSS (`index.css`). We **do not** use Tailwind or CSS-in-JS.
- **State / HA Connection**: Native WebSockets and React Hooks in `App.tsx`.
- **Formatting/Linting**: Biome and Prettier are installed for codebase maintenance. Use default/global configurations where possible.

## 3. UI & Design Guidelines

To maintain the Endfield aesthetic, adhere to the following principles:

- **Color Palette**:
  - Primary: Neon Yellow (`#fffa00` or `#FFFA01`)
  - Accents: Tactical Pink (`#E5007F`), Cyber Cyan (`#00FF9A`)
  - Backgrounds: Void Black / Dark Grey overlays (`rgba(25, 25, 25, 0.92)`)
- **Typography**: Use `SDK-Sans-Regular`, `SDK-Sans-Bold`, and monospace fonts (`JetBrains Mono`) for data readouts.
- **Components**:
  - Cards should have thin borders (`#2A2A2A`) and sharp corners (`border-radius: 2px`).
  - Use `.bg-dot-matrix` and `.bg-hazard-stripes` for authentic textural overlays.
  - Use crisp, stroke-based SVG icons over muddy filled ones.
- **Interactions**: Use CSS transitions for hover states. Active elements should glow (e.g., box-shadows using the neon yellow accent).

## 4. Development Workflow

- **Testing Changes**: Ensure you use `npm run build` or `npm run dev` to verify nothing is broken.
- **Linting**: Run `npx @biomejs/biome check .` or `npx prettier --write .` if requested to clean up code syntax. Note: Global configurations are preferred over project-specific config files for these tools unless explicitly requested by the user.
- **Dependencies**: Run `npm install` for newly added tools.

## 5. Target Device Optimization

- **Primary Target**: Microsoft Surface Pro 3.
- **Screen Specifications**: 12-inch display, 2160 x 1440 physical resolution, **3:2 Aspect Ratio**.
- **Design Strategy**: Because the dashboard is built for a 3:2 landscape orientation, CSS layout must optimize for this aspect ratio (often effectively ~1440x960 or ~1080x720 depending on Windows OS scaling). Use CSS Grid to utilize the taller vertical space effectively (e.g., side-by-side modular sections rather than single-column vertical stacking, where possible) to minimize scrolling and create a true "HUD" dashboard feel.

## 6. Deployment & CI/CD Knowledge

- **Server OS / Infrastructure**: AlmaLinux with CosmoCloud.
- **CI/CD Pipeline**: Automated deployment pipeline to build and host the Endfield Dashboard static bundle on the AlmaLinux server.

