---
name: Ummah Tech Fest Ghana
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c0caad'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8b947a'
  outline-variant: '#414a34'
  surface-tint: '#8fdb00'
  primary: '#ffffff'
  on-primary: '#203600'
  primary-container: '#a3fa00'
  on-primary-container: '#466f00'
  inverse-primary: '#426900'
  secondary: '#e9c349'
  on-secondary: '#3c2f00'
  secondary-container: '#af8d11'
  on-secondary-container: '#342800'
  tertiary: '#ffffff'
  on-tertiary: '#2f3131'
  tertiary-container: '#e2e2e2'
  on-tertiary-container: '#636465'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#a3fa01'
  primary-fixed-dim: '#8fdb00'
  on-primary-fixed: '#112000'
  on-primary-fixed-variant: '#314f00'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Sora
    fontSize: 64px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

This design system embodies a "Tech-Islamic Fusion" aesthetic, celebrating the intersection of spiritual heritage, cultural identity, and digital innovation. The brand personality is visionary, communal, and high-energy. It seeks to evoke a sense of professional excellence while remaining deeply rooted in Ghanaian culture and Islamic values.

The visual style is a hybrid of **Glassmorphism** and **High-Contrast Bold**. It utilizes translucent, frosted layers to represent the transparency and speed of technology, anchored by heavy borders and geometric patterns inspired by Islamic tessellations and Ghanaian Kente weaving. The result is a UI that feels like a futuristic terminal—sophisticated, global, yet distinctly local.

## Colors

The palette is anchored in a deep charcoal and black environment to provide a high-contrast stage for vibrant tech accents.

- **Primary (Neon Lime):** Represents the "Tech" energy—innovative, digital, and high-visibility. Used for primary calls to action, focus states, and key data points.
- **Secondary (Heritage Gold):** Represents "Ghana"—the rich history, wealth of knowledge, and cultural prestige. Used for sophisticated accents, high-level awards, and decorative patterns.
- **Neutral:** A range of deep charcoals and pure blacks used for surfaces to create depth and allow the glass effects to shimmer.
- **Support:** Pure white is used sparingly for high-readability body text and iconography against dark backgrounds.

## Typography

Typography in this design system emphasizes a hierarchy of technological precision and bold communication.

- **Headlines (Sora):** A geometric sans-serif that feels futuristic and sturdy. It should be used in heavy weights to command attention in hero sections and section titles.
- **Body (Inter):** Chosen for its exceptional legibility on dark screens. It maintains a clean, neutral tone that doesn't compete with the expressive headlines.
- **Technical Accents (Space Grotesk):** Used for metadata, labels, and small UI elements. Its slightly eccentric, monospaced-adjacent feel reinforces the "Tech" narrative.

## Layout & Spacing

This design system follows a **12-column fixed grid** for desktop and a **4-column fluid grid** for mobile devices. 

- **Vertical Rhythm:** Built on an 8px base unit. 
- **Section Breathing Room:** Massive vertical padding (80px to 120px) is encouraged between major sections to maintain a premium, "event-gallery" feel.
- **Adaptive Strategy:** On mobile, margins tighten to 16px to maximize screen real estate, while typography scales down significantly to ensure headlines remain impactful but readable without excessive wrapping.

## Elevation & Depth

Depth is achieved through **Glassmorphism** rather than traditional drop shadows. 

1.  **Background Layer:** Deep charcoal (#0F0F0F) with subtle geometric pattern overlays (5% opacity Gold or Lime).
2.  **Mid Layer (Glass):** Semi-transparent surfaces (approx. 40-60% opacity) with a `backdrop-filter: blur(12px)`. These layers have a 1px border in a low-opacity white or the primary neon lime.
3.  **Interactive Layer:** High-contrast elements that appear to "float" or glow. Glow effects (diffused neon lime) are used sparingly to indicate active states or primary calls to action.

## Shapes

The shape language balances modern software aesthetics with geometric cultural patterns. 

Elements use a **Rounded (0.5rem)** base to keep the UI feeling approachable and contemporary. However, decorative background elements and "Kente-tech" borders should remain sharp and geometric to reflect traditional weaving and Islamic architectural motifs. Buttons and interactive cards should use the `rounded-lg` (1rem) setting to feel distinct from the structural grid.

## Components

### Hero Sections
Large-scale layouts featuring a split design: one side showcasing high-energy, professional tech photography (e.g., developers at work, Ghanaian cityscapes at night) and the other utilizing bold, high-contrast typography. Use the Neon Lime for "Call to Action" buttons against the dark backgrounds.

### Speaker Cards
Cards should feature a "Kente-Tech" border—a high-contrast, 2px border that uses a repeating geometric pattern in Gold and Lime. The card body should use a frosted glass effect with high-legibility Inter typography for the bio.

### Multi-step Agenda
A clear, vertical timeline with "Neon Lime" nodes. Each step in the agenda should be a glass container. Completed steps should transition to a subtle Gold highlight, while upcoming steps remain semi-transparent.

### Buttons
- **Primary:** Solid Neon Lime background with Black text. No shadow, but a subtle glow on hover.
- **Secondary:** Ghost style with a Gold 2px border and Gold text. 
- **Tertiary:** Pure text with a "Space Grotesk" label and a trailing arrow icon.

### Input Fields
Dark backgrounds with a 1px border. On focus, the border glows Neon Lime and the label (Space Grotesk) shifts to a Gold accent color.
