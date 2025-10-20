# Kraftverk Studio — Arkitektur & Implementation

## Översikt

Kraftverk Studio MVP är en full-stack Next.js 15-applikation med fokus på prestanda, användarvänlighet och skalbarhet.

## Tech Stack

### Frontend
- **Next.js 15.5** — React framework med App Router
- **TypeScript 5** — Type safety
- **CSS Modules** — Scoped styling med custom properties
- **Zustand** — Client state management med persist

### Backend
- **Next.js API Routes** — Serverless endpoints
- **Prisma** — ORM för databas (SQLite dev, PostgreSQL production)

### Development
- **Turbopack** — Snabb bundling
- **ESLint** — Code quality
- **Git** — Version control

## Filstruktur

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout med Header/Footer
│   ├── page.tsx             # Startsida
│   ├── medlemskap/          # Medlemskapssida
│   ├── schema/              # Schema & bokningssida
│   ├── pt/                  # PT & Coaching
│   ├── om-oss/              # Om oss
│   ├── min-sida/            # Auth-gated dashboard
│   └── api/                 # API routes
│       ├── bookings/        # Boknings-endpoints
│       ├── memberships/     # Medlemskaps-data
│       └── checkout/        # Checkout-flow
│
├── components/
│   ├── layout/              # Layout-komponenter
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   │
│   ├── ui/                  # Återanvändbara UI-komponenter
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Toast.tsx
│   │
│   ├── booking/             # Boknings-specifika komponenter
│   │   ├── ClassCard.tsx
│   │   └── FilterChips.tsx
│   │
│   ├── membership/          # Medlemskaps-komponenter
│   │   └── PricingCard.tsx
│   │
│   └── pt/                  # PT-komponenter
│       └── TrainerCard.tsx
│
├── lib/
│   ├── store/               # Zustand stores
│   │   ├── auth.ts          # Auth state
│   │   └── booking.ts       # Booking state
│   │
│   ├── api.ts               # API helper functions
│   └── utils.ts             # Utility functions
│
├── data/                    # Mock data (JSON)
│   ├── memberships.json
│   ├── classes.json
│   └── trainers.json
│
├── types/                   # TypeScript definitions
│   └── index.ts
│
└── styles/                  # Global styles
    ├── tokens.css           # Design tokens
    └── animations.css       # Animations
```

## Dataflöde

### 1. Server Components (RSC)
Standardläge för alla sidor i Next.js 15 App Router:
- Statiska sidor (Om oss, PT) renderas på servern
- Data fetching sker på servern
- SEO-optimerat

### 2. Client Components
Markerade med `"use client"`:
- Interaktiva komponenter (Header, Filter, Bokningskort)
- State management med Zustand
- Event handlers

### 3. API Routes
Serverless functions för backend-logik:
```
GET  /api/bookings?userId=X     → Hämta bokningar
POST /api/bookings              → Skapa bokning
DELETE /api/bookings/:id        → Avboka
GET  /api/memberships           → Hämta medlemskap
POST /api/checkout              → Checkout-flow
```

## State Management

### Zustand Stores

#### Auth Store (`lib/store/auth.ts`)
```ts
{
  user: User | null
  membership: Membership | null
  isAuthenticated: boolean
  login: (email, membershipId) => Promise<void>
  logout: () => void
}
```

- Persisteras i localStorage
- Mock login för MVP (magic link i produktion)

#### Booking Store (`lib/store/booking.ts`)
```ts
{
  userBookings: Booking[]
  isLoading: boolean
  error: string | null
  fetchBookings: (userId) => Promise<void>
  bookClass: (userId, classInstanceId) => Promise<Result>
  cancelBooking: (bookingId) => Promise<Result>
}
```

## Design System

### Färgpalett
Definierad i `styles/tokens.css`:
- **Bakgrund:** `#0B1220` (midnattsblå)
- **Ytor:** `#0F172A`
- **Text:** `#E5E7EB`
- **Accent:** `#22D3EE` (turkos)

### Pulszoner
```css
--zone-grey: #6B7280    /* Återhämtning */
--zone-blue: #3B82F6    /* Kondition */
--zone-green: #10B981   /* Aerob */
--zone-orange: #F59E0B  /* Anaerob */
--zone-red: #EF4444     /* Max */
```

### Spacing System
```css
--space-1: 0.25rem  (4px)
--space-2: 0.5rem   (8px)
--space-3: 0.75rem  (12px)
--space-4: 1rem     (16px)
--space-6: 1.5rem   (24px)
--space-8: 2rem     (32px)
--space-12: 3rem    (48px)
--space-16: 4rem    (64px)
```

## Komponentmönster

### 1. UI-komponenter
Återanvändbara, atomic komponenter:
```tsx
// Button.tsx
<Button variant="primary" size="lg" fullWidth>
  Boka pass
</Button>
```

### 2. Feature-komponenter
Domän-specifika komponenter:
```tsx
// ClassCard.tsx
<ClassCard 
  classInstance={instance} 
  onBook={() => handleBook(instance.id)} 
/>
```

### 3. Layout-komponenter
Strukturella komponenter:
```tsx
// Header.tsx - Client component med navigation
// Footer.tsx - Server component med statiska länkar
```

## Routing & Navigation

### App Router (Next.js 15)
```
/                    → Startsida
/medlemskap          → Medlemskap & priser
/schema              → Schema & bokning
/pt                  → PT & Coaching
/om-oss              → Om oss
/min-sida            → Dashboard (auth-gated)
```

### Dynamic Routes
```
/api/bookings/[id]   → DELETE booking
```

## Bokningsflöde

1. **Användare besöker /schema**
2. **Filtrerar klasser** (kategori, intensitet)
3. **Klickar "Boka"** på ClassCard
4. **Frontend:**
   - Kollar auth state (Zustand)
   - Validerar bokningsfönster per medlemskap
5. **API Call:**
   - POST /api/bookings
   - Skapar booking-objekt
6. **Response:**
   - Success → Uppdatera local state, visa toast
   - Error → Visa felmeddelande
7. **Kö-hantering:**
   - Om fullt → status: "waitlist"
   - Push-notis när plats frigörs (framtida feature)

## Avbokningsflöde

1. **Användare går till /min-sida**
2. **Ser kommande bokningar**
3. **Klickar "Avboka"**
4. **Frontend:**
   - Kollar 2-timmars policy (utils.ts)
5. **API Call:**
   - DELETE /api/bookings/:id
   - Validerar policy på server
6. **Response:**
   - Success → Ta bort från lista, visa toast
   - Error (för sent) → Visa felmeddelande

## Performance Optimering

### 1. Server-Side Rendering
- Statiska sidor pre-renderas
- SEO-optimerat
- Snabb första laddning

### 2. Code Splitting
- Automatisk route-baserad splitting
- Lazy loading av komponenter

### 3. Image Optimization
- Next.js Image-komponent (framtida)
- WebP/AVIF format

### 4. Caching
- Zustand persist → localStorage
- API responses cacheable

## Säkerhet

### MVP (Mock)
- Client-side auth state
- No real authentication
- Mock API responses

### Production (Framtida)
- Magic link authentication
- TOTP 2FA
- JWT tokens
- Rate limiting på API
- CSRF protection
- Input sanitization

## Accessibility (WCAG 2.2 AA)

### Implementerat
- ✅ Semantisk HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Color contrast (minimum 4.5:1)
- ✅ Responsive touch targets (min 44x44px)

### Skip Links
```tsx
<a href="#main-content" className="sr-only">
  Hoppa till huvudinnehåll
</a>
```

## Testing Strategy (Framtida)

### Unit Tests
- Component testing (Vitest + React Testing Library)
- Utility functions (Vitest)

### Integration Tests
- API routes (Vitest)
- Store logic (Zustand testing utils)

### E2E Tests
- Bokningsflöde (Playwright)
- Membership signup (Playwright)

## Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deployment Targets
- **Vercel** (rekommenderat för Next.js)
- **Railway** (alternativ med PostgreSQL)
- **Fly.io** (self-hosted option)

### Environment Variables
Se `.env.example` för konfiguration.

## Skalbarhet

### Nuvarande (MVP)
- SQLite databas
- Mock data i JSON
- Client-side state

### Framtida
- PostgreSQL / PlanetScale
- Redis för sessions & kö
- Server-side caching
- CDN för static assets
- Microservices för recovery/quests

## Roadmap

### Phase 1: MVP ✅
- Startsida, Medlemskap, Schema, PT, Om oss, Min sida
- Mock API & auth
- Responsiv design

### Phase 2: Plus
- Quest-motor
- Recovery-bokning
- Progress-dashboard
- Företagssida
- Blogg/CMS

### Phase 3: Premium
- Live pulszon-data
- Native app
- HealthKit integration
- Advanced analytics





