# Arknights: Endfield Design Document

This document catalogs the design elements, styles, and assets extracted from the official Arknights: Endfield website (`Arknights_ Endfield - Over the Frontier, Into the Front.htm` and its `_files` folder) for use in the Home Assistant Dashboard.

## 1. Color Palette

The official website heavily utilizes a high-contrast, brutalist/sci-fi industrial theme with neon accents.

- **Primary Dark Backgrounds**:
  - `#101010` (Main body background)
  - `#191919`, `#1f1f1f`, `#2e2e2e` (Secondary backgrounds, modals, panels)
  - `rgba(0,0,0,0.5)`, `rgba(0,0,0,0.75)` (Overlays and frosted glass backdrops)
- **Primary Light Colors (Text & Accents)**:
  - `#ffffff` (Primary text and high-contrast accents)
  - `#f2f2f2`, `#e6e6e6`, `#d9d9d9` (Light panels, dividers, inactive states)
- **Neutral Greys (Muted text, disabled elements)**:
  - `#4d4d4d`, `#6e6e6e`, `#888888`, `#b3b3b3`, `#cccccc`
- **Neon Brand Accents**:
  - **Yellow**: `#fffa00` (Used heavily for hover states, buttons, and prominent borders. Matches `rgb(255, 252, 115)`)
  - _Note: The website also implies secondary brand colors (pink/green/yellow) as seen in the custom dashboard's `ef-accent-bar`, but the primary extracted CSS overwhelmingly favors Neon Yellow as the interactive accent color._

## 2. Typography

The website utilizes specific fonts for its HUD and Sci-Fi feel.

- **Primary Font Families**:
  - `SDK-Sans-Regular`, `SDK-Sans-Medium`, `SDK-Sans-Bold` (Custom web fonts, Source Han Sans variants).
  - `Novecentosanswide-Bold` (Used for large, bold, spaced-out background text like "ENDFIELD").
- **Font Sizing**:
  - Relies heavily on `em` and `rem` scaling based on the viewport size using a custom `handleResize` function in the HTML to dynamically adjust the root `font-size` based on screen orientation (e.g., 16px down to 8px on small screens).

## 3. UI Patterns & Textures

The Endfield website isn't just solid colors; it uses intricate textures and gradients to achieve its look.

- **Dot Matrix Background (`points-bg.f3b559e8.png`)**:
  - A repeating 1.5em x 1.5em dot pattern.
  - Often overlaid with a linear-gradient mask to fade it out at the top/bottom: `-webkit-mask-image: linear-gradient(180deg, transparent 0, transparent 50%, black 90%, black);`
  - Applied with low opacity (e.g., `opacity: 0.08`).
- **Diagonal Hazard Stripes**:
  - Created purely with CSS linear gradients: `linear-gradient(-45deg, transparent, transparent 18.3%, black 0, black 31.6%, transparent 0, transparent 68.3%, black 0, black 81.6%, transparent 0, transparent)`
  - Background size is usually small (`0.5rem 0.5rem`).
  - Used in table headers (`th`) and modal headers.
- **Button Textures (`button-texture.63d91da2.png`)**:
  - Applied as a background to `.Button_button__njqVS`.
  - Buttons also feature a yellow clipped accent element (`clip-path: polygon(0 0, 25% 0, 25% 100%, 0 100%)`) that animates on hover.
- **Hollow Text (`.HallowText_hollowText__OJN57`)**:
  - Giant text with a background gradient clipped to the text (`-webkit-background-clip: text; color: rgba(0,0,0,0);`).
- **Frosted Glass / Blurs**:
  - Modals and overlays frequently use `backdrop-filter: blur(...)` combined with translucent backgrounds.
- **Additional Styles (`e37a3131cdbad34d_C7MX.css`)**:
  - Contains more specific utility classes and potentially new layout variables from the second webpage chunk.

## 4. Iconography (SVGs)

The website uses inline SVGs for crisp, scalable icons. These can be found in the main `.htm` file under `data-key` attributes.

- **Official Logo**: The triangular Endfield logo with intricate cutouts.
- **`home`**: A stylized, blocky house/facility icon.
- **`operator`**: An ID card or operator profile icon.
- **`lore`**: A stylized open book/file icon.
- **`information` (Media)**: A play button/media icon.
- **`calendar`**: A stylized calendar/schedule icon.
- **`aicGameplay` (Gameplay & AIC Factory Intro)**: A hexagonal gear/machinery icon.
- **`notice` (News)**: An exclamation mark inside a rigid geometric border.
- **`account`**: A minimalist person/user profile SVG.
- **`top-up center`**: A diamond/currency stylized icon.

## 5. Media & Image Assets

The `_files` folder contains numerous high-quality assets.

- **Backgrounds / Landscapes**:
  - `b15b6f01601d449faf342d0ca4b7d8de_P_6d.png` (Large landscape background, currently used for the Login Screen).
  - `354e288f1800d04aa1225dcdd0274d6e_P_6d.jpg` (~537KB)
  - `content.12b79950_P_6d.jpg` (~550KB)
  - `a1e1b78eb8dc250d3e5b5820a5da71c0_P_6d.jpg` (~410KB)
- **Logos & Branding**:
  - `title.1457e7b3acf74f0a6213_P_6d.svg` (The primary text logo SVG).
  - `blurred_logo.eccbe4f3_P_6d.png` (A large, soft-focus Endfield logo, excellent for watermarks/background accents).
  - `title.6025e3c9_P_6d.png` (Fallback PNG for the title).
- **Videos**:
  - `00240a644851abbdf0153120ebb5e26f_P_6d.mp4` (~41MB)
  - `01.1e0eb1_P_6d.mp4` (~53MB, likely the main hero background video loop).
- **3D Models (Lore Section)**:
  - `spaceship.752e25.bin` (Likely the Dijiang / Spacecraft model)
  - `anchor.0e6c6a.bin`
  - `factory.bd9a36.bin`
  - `pile.251dc1.bin`
  - `trinity.d6c060.bin`
  - `enemy.6a1a19.bin`

## 6. Dashboard Implementation Ideas

Based on these extracted styles, the Home Assistant dashboard could be enhanced by:

1.  **Dynamic Section Headers**: Replacing the `[SEC.01]` text with the `aicGameplay` (Gear) SVG, `[SEC.02]` with the `home` SVG, and `[SEC.03]` with the `calendar` SVG.
2.  **Textured Cards**: Applying the `points-bg` dot matrix or diagonal stripe gradients as subtle background overlays to the HA entity cards (e.g., inside `.ef-card`).
3.  **Neon Yellow Accents**: Shifting from the pink/green/yellow tri-color accent bar to a more authentic solid `#fffa00` yellow accent for active states (like when a light is turned ON).
4.  **Complex Button Shapes**: Updating entity toggle buttons to use the `clip-path` geometry and texture seen in the official buttons.
5.  **Watermarks**: Adding `blurred_logo.png` to the background of specific control panels to break up the uniform grey.
