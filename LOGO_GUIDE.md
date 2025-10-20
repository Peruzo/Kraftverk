# Kraftverk Studio — Logo Guide

## 🎨 Logotyp Design

### Koncept
Logotypen kombinerar ett **hexagon** (styrka, struktur) med en **blixt** (kraft, energi) för att representera "Kraftverk" (power plant).

### Komponenter

#### 1. Ikon (40x40px)
```
┌─────────────┐
│   Hexagon   │  Geometrisk form = struktur
│   + Blixt   │  Energi = kraft
│   Gradient  │  Turkos → Grön
└─────────────┘
```

**Teknisk:**
- SVG-baserad (skalbar, skarp på alla skärmar)
- Gradient från `#22D3EE` (turkos) → `#10B981` (grön)
- Glow effect: `drop-shadow(0 0 8px rgba(34, 211, 238, 0.4))`
- Hover: Rotation 5° + ökad glow

#### 2. Typografi
**KRAFTVERK:**
- Font-weight: 900 (black)
- Letter-spacing: -0.02em (tight)
- Gradient clip: vit → turkos
- Font-size: 1.25rem (20px)

**STUDIO:**
- Font-weight: 600 (semibold)
- Letter-spacing: 0.15em (spaced)
- Text-transform: uppercase
- Font-size: 0.625rem (10px)
- Color: muted grey

### Färgpalett

**Primary:**
- Turkos: `#22D3EE` (accent)
- Grön: `#10B981` (success/zone)
- Vit: `#ffffff` (text)

**Background:**
- Semi-transparent fill: `rgba(34, 211, 238, 0.1)`

### States & Animations

#### Default
```css
filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.4));
```

#### Hover
```css
filter: drop-shadow(0 0 16px rgba(34, 211, 238, 0.8))
        drop-shadow(0 0 24px rgba(34, 211, 238, 0.4));
transform: rotate(5deg);
```

Transition: `300ms ease`

### Responsive Behavior

**Desktop (>768px):**
- Full logo: Ikon + Text

**Mobile (<768px):**
- Ikon endast
- Text döljs för att spara plats

### Usage

#### React Component
```tsx
import Logo from "@/components/layout/Logo";

<Link href="/">
  <Logo />
</Link>
```

#### Standalone SVG (Favicon)
- Location: `/public/favicon.svg`
- Size: 64x64px
- Format: SVG (modern browsers)

### Favicon Variants

**Primary (implementerat):**
- `favicon.svg` - SVG för moderna browsers
- 64x64px, dynamiskt gradient

**Framtida:**
- `favicon.ico` - Fallback för gamla browsers
- `apple-touch-icon.png` - iOS home screen
- `manifest.json` - PWA icons

### Symbolik

**Hexagon:**
- 6 sidor = styrka, stabilitet
- Geometri = vetenskap, precision
- Modern, tech-feel

**Blixt:**
- Kraft, energi (Kraftverk = power plant)
- Dynamik, rörelse
- Progression, power

**Gradient:**
- Turkos → Grön = pulszoner
- Progression från startzon till konditionszon
- Levande, organiskt

### Placeringar

**Implementerat:**
- ✅ Header (navbar)
- ✅ Footer
- ✅ Favicon (browser tab)

**Framtida:**
- Loading screen
- 404 page
- Email templates
- Social share cards

### Technical Specs

**Format:**
- SVG (vector, scalable)
- Inline i React component
- No external dependencies

**Performance:**
- < 1KB gzipped
- CSS-only animations
- GPU-accelerated transforms

**Accessibility:**
- Decorative role (text backup finns)
- Color contrast: AA compliant
- Semantic HTML structure

### Brand Guidelines

**DO:**
- ✅ Använd alltid gradient (turkos → grön)
- ✅ Behåll glow-effekt
- ✅ Använd hexagon + blixt tillsammans
- ✅ Respektera spacing runt logga

**DON'T:**
- ❌ Ändra färger utanför gradient
- ❌ Förvräng proportioner
- ❌ Ta bort glow-effekten
- ❌ Använd bitmaps (PNG/JPG) - alltid SVG

### Export Sizes

**Web:**
- Header: 40x40px
- Footer: 40x40px
- Favicon: 64x64px

**Print (framtida):**
- Business card: 600x600px
- Poster: 2400x2400px
- Export från SVG (infinit skalning)

### Color Variations (framtida)

**Dark mode (current):**
- Background: Dark navy
- Icon: Turkos-grön gradient
- Glow: Turkos

**Light mode:**
- Background: White
- Icon: Deep blue-teal gradient
- Glow: Subtle blue

**Monochrome:**
- All white för dark backgrounds
- All black för light backgrounds

---

## 🎨 Design Rationale

**Varför hexagon + blixt?**
- Hexagon = starkaste geometriska formen i naturen (bikakors)
- Blixt = kraft, energi, "Kraftverk"
- Kombination = "smart styrka"

**Varför gradient?**
- Representerar progression (nyckelord i varumärket)
- Pulszoner (turkos → grön = träningszoner)
- Levande, dynamisk = inte statiskt gym

**Varför glow?**
- Energi, kraft
- Premium feel
- Tech-forward (neon, sci-fi)
- Syns i dark theme

---

**Status:** Professional Logo ✅
**Next Level:** Animated logo loading sequence






