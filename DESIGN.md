---
name: Sentinel Static
colors:
  surface: '#141313'
  surface-dim: '#141313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353434'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c7c6c6'
  on-secondary: '#303031'
  secondary-container: '#464747'
  on-secondary-container: '#b5b5b5'
  tertiary: '#ffffff'
  on-tertiary: '#342f2e'
  tertiary-container: '#eae0dd'
  on-tertiary-container: '#6a6361'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#eae0dd'
  tertiary-fixed-dim: '#cec5c2'
  on-tertiary-fixed: '#1f1b19'
  on-tertiary-fixed-variant: '#4b4644'
  background: '#141313'
  on-background: '#e5e2e1'
  surface-variant: '#353434'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 64px
    fontWeight: '600'
    lineHeight: 72px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  code-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

This design system is built for high-performance developer environments where clarity and focus are paramount. The aesthetic is rooted in **Minimalism** and **Corporate Modernity**, drawing inspiration from the precise, dark-mode interfaces of leading developer tools. 

The brand personality is calm, observant, and authoritative. It utilizes a "True Dark" canvas to eliminate visual noise, allowing critical data and task-oriented workflows to surface naturally. The emotional response should be one of quiet confidence—an interface that stays out of the way until it is needed.

**Key Stylistic Pillars:**
- **Stark Contrast:** High-value whites against deep blacks for immediate legibility.
- **Atmospheric Depth:** Depth is communicated through subtle luminosity and tonal shifts rather than traditional drop shadows.
- **Precision Engineering:** Tight alignment, geometric typography, and consistent 4px/8px scaling.

## Colors

The palette is strictly monochromatic with a singular functional accent. The background uses a true black (#0A0A0A) to ground the UI, while surface containers use slightly elevated grays to create structure without the need for heavy borders.

- **Primary Text (#EDEDED):** Used for headlines and critical information.
- **Secondary Text (#8A8A8A):** Used for descriptions, labels, and non-interactive metadata.
- **Accent (#2DD4BF):** A muted teal used exclusively for success states, active indicators, and subtle radial glows to draw attention to primary actions.
- **Surface (#171717):** The standard background for cards and bento-grid modules.

## Typography

The design system utilizes **Geist** for its systematic, geometric construction which excels in technical contexts. 

- **Headlines:** Use large sizes with tight letter-spacing to create a "display" feel. Headlines should always be Primary Text color.
- **Body:** Focused on readability. Body-md is the default for all standard descriptions.
- **Labels:** Used for buttons, chips, and table headers. Often paired with a slightly increased tracking (letter-spacing) for clarity at small sizes.
- **Mobile Scaling:** Display and Large Headlines should scale down significantly on mobile devices to prevent awkward wrapping, prioritizing a 24px-32px range for the primary view.

## Layout & Spacing

This design system follows a **Fluid Grid** philosophy with fixed maximum widths for content readability. 

- **The 24px Rule:** A minimum spacing of 24px (lg) must be maintained between distinct functional modules (Bento cards). This ensures the "Calm" aspect of the design by providing generous whitespace.
- **Bento Grid:** Layouts are organized into a grid of cards with consistent gutters. Cards can span multiple columns (1, 2, or 3) and rows to create visual interest.
- **Hit Targets:** All interactive elements (buttons, inputs, menu items) must maintain a minimum height of 48px to ensure accessibility and a premium, tactile feel.
- **Desktop Breakpoint:** 1280px.
- **Tablet Breakpoint:** 768px.
- **Mobile Breakpoint:** 375px (Margins reduce to 16px).

## Elevation & Depth

Elevation is achieved through **Tonal Layering** and **Subtle Glows** rather than shadows. 

- **Surface Tiers:**
  - Level 0 (Base): #0A0A0A
  - Level 1 (Card/Input): #171717
  - Level 2 (Hover/Active): #1F1F1F
- **Luminosity:** To highlight active states or primary cards, use a very soft, large-radius radial gradient using the Accent color at 5-10% opacity, positioned behind the element.
- **Borders:** Use low-contrast outlines (#262626) only when necessary to define boundaries on identical background colors. Otherwise, prefer tonal separation.

## Shapes

The shape language is controlled and modern. 

- **Standard Radius:** 0.5rem (8px) is the base for all cards, buttons, and inputs.
- **Large Radius:** 1rem (16px) is reserved for large bento-style sections or decorative containers.
- **Buttons:** Maintain the 8px radius for a sophisticated, professional look—avoid full pills to keep the "DevTool" aesthetic.

## Components

### Buttons
- **Primary:** Background #EDEDED, Text #0A0A0A. High contrast.
- **Secondary:** Background #171717, Border 1px #262626, Text #EDEDED.
- **Ghost:** Background transparent, Text #8A8A8A, Hover Text #EDEDED.

### Bento Cards
- Background: #171717.
- Padding: 24px.
- Interaction: On hover, the border color shifts to #333333 or a subtle Accent glow is applied to the top border.

### Input Fields
- Height: 48px.
- Background: #111111.
- Border: 1px solid #262626.
- Focus: 1px solid #2DD4BF.

### Chips / Status Indicators
- Small, 12px font, 4px-8px padding.
- Neutral states: #1F1F1F background with #8A8A8A text.
- Success states: #0D2D29 background with #2DD4BF text.

### Lists
- Items separated by 1px #171717 dividers.
- Hover state: Background #171717 with a subtle transition.
- Primary text for titles, secondary text for metadata/descriptions.