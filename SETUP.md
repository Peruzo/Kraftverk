# Kraftverk Studio — Setup Guide

Snabbguide för att komma igång med Kraftverk Studio MVP.

## Förutsättningar

- **Node.js** 18+ installerat
- **npm** eller **pnpm** pakethanterare
- **Git** för versionhantering

## Installation

### 1. Installera dependencies

```bash
cd KraftverkStudio
npm install
```

Detta installerar:
- Next.js 15.5.4
- React 19.1.0
- TypeScript 5
- Zustand 5.0.8
- Prisma 6.1.0
- date-fns 4.1.0

### 2. Sätt upp databas (optional för MVP)

Projektet använder mock data som standard, men om du vill använda Prisma:

```bash
# Generera Prisma client
npx prisma generate

# Kör migrations (skapar SQLite-databas)
npx prisma migrate dev --name init

# Öppna Prisma Studio för att se data
npx prisma studio
```

### 3. Environment variables

Kopiera exempel-filen:

```bash
cp .env.example .env.local
```

Standardvärden fungerar för lokal utveckling.

## Kör projektet

### Development mode

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000)

### Production build

```bash
npm run build
npm start
```

## Projektstruktur

```
KraftverkStudio/
├── src/
│   ├── app/              # Sidor (Next.js App Router)
│   ├── components/       # React-komponenter
│   ├── lib/              # Utilities & stores
│   ├── data/             # Mock JSON data
│   ├── types/            # TypeScript types
│   └── styles/           # Global CSS
├── prisma/
│   └── schema.prisma     # Databas-schema
├── public/               # Statiska filer
└── README.md
```

## Navigera projektet

### Huvudsidor

- **Startsida:** `http://localhost:3000`
- **Medlemskap:** `http://localhost:3000/medlemskap`
- **Schema:** `http://localhost:3000/schema`
- **PT & Coaching:** `http://localhost:3000/pt`
- **Om oss:** `http://localhost:3000/om-oss`
- **Min sida:** `http://localhost:3000/min-sida`

### API Endpoints

- `GET /api/bookings?userId=X` — Hämta bokningar
- `POST /api/bookings` — Skapa bokning
- `DELETE /api/bookings/:id` — Avboka
- `GET /api/memberships` — Hämta medlemskap
- `POST /api/checkout` — Checkout

## Mock Data

Projektet använder JSON-filer för mock data under utveckling:

- `src/data/memberships.json` — 4 medlemskapsnivåer
- `src/data/classes.json` — 12 klasstyper
- `src/data/trainers.json` — 8 instruktörer

Du kan redigera dessa filer för att testa olika scenarier.

## State Management

### Auth (Demo mode)

Projektet auto-loggar in en demo-användare när du besöker `/min-sida`:

```ts
// Auto-login i min-sida/layout.tsx
email: "demo@kraftverk.se"
membership: "flex"
```

### Ändra demo-användare

Redigera `src/app/min-sida/layout.tsx`:

```tsx
await login("din@email.se", "studio-plus");
```

Medlemskap: `"base"`, `"flex"`, eller `"studio-plus"`

## Anpassa Design

### Färger

Redigera `src/styles/tokens.css`:

```css
:root {
  --color-bg: #0B1220;        /* Bakgrund */
  --color-accent: #22D3EE;    /* Accent-färg */
  /* ... */
}
```

### Komponenter

Alla komponenter finns i `src/components/`:

- `ui/` — Återanvändbara UI-komponenter
- `layout/` — Header & Footer
- `booking/` — Schema-relaterade komponenter
- `membership/` — Pricing cards
- `pt/` — Instruktörskort

## Linting & Formatting

### Kör linter

```bash
npm run lint
```

### Auto-fix

```bash
npm run lint --fix
```

## Troubleshooting

### Port redan i bruk

Om port 3000 används:

```bash
PORT=3001 npm run dev
```

### Zustand persist error

Rensa localStorage:

```js
// I browser console
localStorage.clear()
```

### TypeScript errors

Regenerera types:

```bash
rm -rf .next
npm run dev
```

## Nästa steg

### 1. Implementera riktig Auth

Ersätt mock login i `src/lib/store/auth.ts` med:
- NextAuth.js
- Magic link email
- TOTP 2FA

### 2. Koppla Prisma-databas

Uppdatera `src/app/api/` routes att använda Prisma client:

```ts
import { prisma } from "@/lib/db";

const bookings = await prisma.booking.findMany({
  where: { userId }
});
```

### 3. Lägg till Stripe

Implementera checkout i `src/app/api/checkout/route.ts`:

```ts
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

### 4. Deploy till Vercel

```bash
# Installera Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Support & Dokumentation

- **README.md** — Projektöversikt
- **ARCHITECTURE.md** — Teknisk arkitektur
- **prisma/schema.prisma** — Datamodell

## Vanliga uppgifter

### Lägg till ny sida

1. Skapa `src/app/ny-sida/page.tsx`
2. Lägg till i navigation (`src/components/layout/Header.tsx`)

### Lägg till ny komponent

1. Skapa `src/components/[kategori]/Component.tsx`
2. Skapa `src/components/[kategori]/Component.module.css`
3. Exportera och använd

### Lägg till ny API route

1. Skapa `src/app/api/[endpoint]/route.ts`
2. Implementera GET/POST/DELETE handlers
3. Använd från frontend via `src/lib/api.ts`

---

**Lycka till med utvecklingen! 🚀**






