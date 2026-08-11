---
name: Sentinel Cinematic Intelligence
colors:
  surface: '#0f1412'
  surface-dim: '#0f1412'
  surface-bright: '#353a37'
  surface-container-lowest: '#0a0f0c'
  surface-container-low: '#181d1a'
  surface-container: '#1c211e'
  surface-container-high: '#262b28'
  surface-container-highest: '#313632'
  on-surface: '#dfe4de'
  on-surface-variant: '#c3c9b2'
  inverse-surface: '#dfe4de'
  inverse-on-surface: '#2c322e'
  outline: '#8d937e'
  outline-variant: '#434937'
  surface-tint: '#9fd744'
  primary: '#f7ffe3'
  on-primary: '#223600'
  primary-container: '#b7f15b'
  on-primary-container: '#486d00'
  inverse-primary: '#456800'
  secondary: '#92d957'
  on-secondary: '#193700'
  secondary-container: '#5fa125'
  on-secondary-container: '#153000'
  tertiary: '#fcfcfc'
  on-tertiary: '#2f3131'
  tertiary-container: '#dfdfdf'
  on-tertiary-container: '#616263'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#baf55e'
  primary-fixed-dim: '#9fd744'
  on-primary-fixed: '#121f00'
  on-primary-fixed-variant: '#334f00'
  secondary-fixed: '#adf670'
  secondary-fixed-dim: '#92d957'
  on-secondary-fixed: '#0c2000'
  on-secondary-fixed-variant: '#275000'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#0f1412'
  on-background: '#dfe4de'
  surface-variant: '#313632'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 72px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  data-point:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.0'
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-safe: 48px
  section-gap: 120px
---

## Brand & Style

The design system is engineered for a premium, high-stakes engineering environment. It evokes the feeling of a futuristic command center—sophisticated, predictive, and authoritative. The aesthetic leans heavily into Glassmorphism and Atmospheric Minimalist styles, prioritizing depth and light over flat surfaces.

The visual narrative is defined by:
- **Cinematic Depth:** Using layered transparency and backdrop blurs to create a sense of physical space within the screen.
- **Luminous Accents:** High-vibrancy greens act as "data signals" against a deep, shadowed environment.
- **Precision Engineering:** Sharp typography and generous whitespace reflect the accuracy of the underlying AI.
- **Atmospheric Lighting:** Subtle radial glows and soft bloom effects simulate a high-end hardware interface.

## Colors

The palette is rooted in a "Deep Obsidian" environment, providing a high-contrast foundation for luminous data visualization.

- **Foundational Dark:** Use #111613 for the primary canvas and #171D19 for slightly elevated background sections.
- **The Signal (Primary):** #B7F15B is reserved for critical actions, active states, and successful predictive insights.
- **Atmospherics:** Use soft radial gradients of the primary accent (10-15% opacity) in the background to create "blooms" of light behind key dashboard widgets.
- **Glass System:** Surfaces utilize rgba(255, 255, 255, 0.05) with a 20px to 40px backdrop blur to maintain legibility while preserving the cinematic depth.

## Typography

This system uses a tiered typeface strategy to balance cinematic impact with technical utility.

- **Display & Headings:** Use Geist for its precision and modern, technical edge. Hero headings should use heavy weights with tight, negative letter-spacing to feel impactful and "locked-in."
- **Interface & Body:** Inter provides neutral, high-legibility support for dense information and descriptions.
- **Technical Metadata:** JetBrains Mono is used for code snippets, timestamps, and "system status" labels to reinforce the developer-centric nature of the platform.

## Layout & Spacing

The layout philosophy follows a Fixed-Fluid Hybrid model. Content is contained within a max-width of 1440px to maintain readability on ultra-wide monitors common in engineering.

- **Rhythm:** Built on an 8px base unit. Component padding should lean towards generous (e.g., 32px or 48px) to provide "breathing room" for the dense data.
- **Grid:** A 12-column grid is utilized for dashboard views. For editorial or hero sections, use a 6-column centered layout.
- **Responsive Behavior:**
  - **Desktop:** 48px safe margins.
  - **Tablet:** 32px margins, 2-column dashboard reflow.
  - **Mobile:** 20px margins, typography scales down (refer to headline-lg-mobile), and glass blurs are reduced to maintain performance.

## Elevation & Depth

Depth is not communicated through traditional shadows, but through Tonal Stacking and Refractive Surfaces.

- **Level 0 (Canvas):** The primary #111613 background.
- **Level 1 (Sub-surface):** Subtle #171D19 containers for grouping large content blocks.
- **Level 2 (Glass Floating):** The standard interface container. Features a rgba(255, 255, 255, 0.05) fill, 40px backdrop blur, and a 1px stroke of rgba(255, 255, 255, 0.08).
- **Level 3 (Active/Hover):** Increase the border opacity to 0.2 and add a very soft primary-colored outer glow (bloom) with a 32px spread and 0.1 opacity.

## Shapes

The shape language is "Soft-Tech." It avoids the extreme playfulness of fully circular corners while rejecting the harshness of sharp 0px angles.

- **Standard Elements:** Buttons, input fields, and small cards use 0.5rem (8px).
- **Primary Containers:** Large glass dashboard widgets use 1rem (16px) to appear more premium and distinct.
- **Feature Elements:** Pill shapes (32px+) are reserved exclusively for status indicators, tags, and the primary "Sentinel" action button.

## Components

### Buttons
- **Primary:** Pill-shaped, background #B7F15B, text #111613. On hover, add a 12px bloom effect of the same color.
- **Ghost/Glass:** Pill-shaped, transparent background with 1px border of rgba(255, 255, 255, 0.2). On hover, the background fills to rgba(255, 255, 255, 0.05).

### Cards (Glass Widgets)
- Floating containers with the Level 2 elevation specs.
- Headers within cards should use label-caps typography to categorize data.
- Internal dividers should be 1px wide with rgba(255, 255, 255, 0.05).

### Input Fields
- Subtle, dark backgrounds (#171D19) with a bottom-only border of rgba(255, 255, 255, 0.2).
- Focus state: The border color transitions to the primary accent #B7F15B with a soft glow.

### Charts & Data Visualization
- Use the Primary and Secondary accents for data lines.
- Areas under lines should use a gradient fading from the accent color (20% opacity) to transparent.
- Grid lines in charts must be extremely subtle (rgba(255, 255, 255, 0.03)).

### Status Badges
- Small, pill-shaped components.
- Use a "pulsing" dot next to the text to indicate real-time AI processing.