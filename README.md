# Kraftverk Studio — MVP

Premium-funktionellt gym för urbana 20–45-åringar som vill ha tydlig progression, mysigt community och "noll prestige".

## 🎯 Koncept

**Positionering:** Vetenskapligt träningslabb + lounge  
**Ton:** Mjuk, peppig, resultatorienterad utan machokultur  
**USP:** Personliga träningsuppdrag (quests) och öppna data med realtidsutveckling

## 🚀 Kom igång

### Installation

```bash
npm install
```

### Utveckling

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

### Bygg för produktion

```bash
npm run build
npm start
```

## 📁 Projektstruktur

```
KraftverkStudio/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Startsida
│   │   ├── medlemskap/         # Medlemskap & priser
│   │   ├── schema/             # Schema & bokning
│   │   ├── pt/                 # PT & Coaching
│   │   ├── om-oss/             # Om oss
│   │   ├── min-sida/           # Dashboard
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── layout/             # Header, Footer
│   │   ├── ui/                 # Button, Card, Badge
│   │   ├── booking/            # ClassCard, Filter
│   │   ├── membership/         # PricingCard
│   │   └── pt/                 # TrainerCard
│   ├── lib/
│   │   └── store/              # Zustand stores
│   ├── data/                   # Mock data (JSON)
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global styles & tokens
├── prisma/
│   └── schema.prisma           # Datamodell
└── public/                     # Statiska filer
```

## 🎨 Design System

### Färger

- **Bakgrund:** `#0B1220` (midnattsblå)
- **Ytor:** `#0F172A`
- **Text:** `#E5E7EB`
- **Accent:** `#22D3EE` (turkos)
- **Success:** `#10B981`
- **Warning:** `#F59E0B`

### Pulszoner

- **Grey:** Återhämtning
- **Blue:** Konditionsbyggande
- **Green:** Aerob zon
- **Orange:** Anaerob zon
- **Red:** Maxzon

## 📊 Features (MVP)

### ✅ Implementerat

- **Startsida** med hero, social proof, quest-teaser, schema-teaser
- **Medlemskap** med 3 nivåer + dagpass, jämförelsetabell
- **Schema & Boka** med filter, klasskort, pulszoner-visualisering
- **PT & Coaching** med instruktörskort och paketväljare
- **Om oss** med värdegrund, lokaler, instruktörer
- **Min sida** med bokningsöversikt, medlemskapsstatus, KPI-kort
- **API routes** för bokningar och checkout (mock)
- **Zustand state management** för auth & bookings
- **Responsiv design** med mobile-first approach

### 🔜 Nästa fas (Plus)

- Quest-motor med personliga träningsuppdrag
- Recovery-bokning (IR-bastu, bad, massage)
- Progress-dashboard med pulszon-data
- Företagssida med team-avtal
- Blogg/kunskap

### 🚀 Premium (framtid)

- Live pulszon-visualisering i klass
- Export till HealthKit/CSV
- Native app (iOS/Android)

## 🔧 Tech Stack

- **Framework:** Next.js 15.5 (App Router, Turbopack)
- **Language:** TypeScript 5
- **State:** Zustand (persist)
- **Database:** Prisma (SQLite för dev, PostgreSQL-ready)
- **Styling:** CSS Modules + Custom Properties
- **Auth:** Mock (produktion: magic link + TOTP)

## 📝 Data Schema

Se `prisma/schema.prisma` för full datamodell:

- **User** — Användare med medlemskap
- **Membership** — Medlemskapsnivåer
- **ClassTemplate** — Klasstyper
- **ClassInstance** — Specifika klasstillfällen
- **Booking** — Bokningar och kö
- **Trainer** — Instruktörer

## 🎯 Design Principer

1. **Noll prestige** — Inkluderande miljö för alla nivåer
2. **Tydlig progression** — Data och mål i fokus
3. **Vetenskaplig grund** — Pulsbaserad träning och periodisering
4. **Community** — Transparens och delad progress
5. **Accessibility** — WCAG 2.2 AA compliance

## 📱 Responsive Breakpoints

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

## 🔐 Environment Variables

Skapa `.env.local`:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 📄 Licens

© 2024 Kraftverk Studio. Alla rättigheter reserverade.





