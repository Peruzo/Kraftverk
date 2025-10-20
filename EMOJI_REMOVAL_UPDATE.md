# Emoji Removal & PT Images Update

## ✅ Genomfört

### 1. Alla Emojis Borttagna

**Tidigare emojis ersatta:**
- 🎯 → SVG Clock-ikon (Resultatorienterade)
- 🤝 → SVG Users-ikon (Community)
- 📊 → SVG Bar Chart-ikon (Data & Transparens)
- ⚡ → SVG Lightning-ikon (Smart träning)
- 📊 → SVG Bar Chart-ikon (Screening)
- 📝 → SVG Document-ikon (Personlig plan)
- 💪 → SVG Smile-ikon (1-till-1 sessioner)
- 📈 → SVG Activity-ikon (Uppföljning)
- 💡 → Text endast (KPI-note på Min sida)
- ✓ Checkmarks → Bortagna från policy-lista

**Filer uppdaterade:**
- `/app/pt/page.tsx` - "Vad ingår?" sektion
- `/app/om-oss/page.tsx` - Värdegrund & Policy
- `/app/min-sida/page.tsx` - KPI note
- Relaterade CSS-filer för SVG-styling

### 2. SVG-Ikoner Implementerade

**Nya ikoner (Feather/Lucide-stil):**
```tsx
// Bar Chart (Analytics)
<svg viewBox="0 0 24 24" stroke="currentColor">
  <path d="M3 3v18h18"/>
  <path d="M18 17V9"/>
  <path d="M13 17V5"/>
  <path d="M8 17v-3"/>
</svg>

// Users (Community)
<svg viewBox="0 0 24 24" stroke="currentColor">
  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
  <circle cx="9" cy="7" r="4"/>
  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
</svg>

// Lightning (Energy)
<svg viewBox="0 0 24 24" stroke="currentColor">
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
</svg>

// Clock (Goals/Time)
<svg viewBox="0 0 24 24" stroke="currentColor">
  <circle cx="12" cy="12" r="10"/>
  <polyline points="12 6 12 12 16 14"/>
</svg>

// Document (Plans)
<svg viewBox="0 0 24 24" stroke="currentColor">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
  <polyline points="14 2 14 8 20 8"/>
</svg>

// Activity (Progress)
<svg viewBox="0 0 24 24" stroke="currentColor">
  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
</svg>
```

**Styling:**
```css
.icon {
  color: var(--color-accent); /* Turkos */
  margin-bottom: var(--space-2);
}

.icon svg {
  display: block;
  margin: 0 auto;
}
```

### 3. PT/Instruktör-Bilder

**Alla 8 instruktörer har nu riktiga ansiktsbilder:**

1. **Emma Lindberg** - Kvinna, PT & Fysioterapeut
   - `https://images.unsplash.com/photo-1594744803329-e58b31de8bf5`
   - Professionell, vänlig look

2. **Marcus Johansson** - Man, Styrkelyft & CrossFit
   - `https://images.unsplash.com/photo-1568602471122-7832951cc4c5`
   - Maskulin, atletisk

3. **Sara Bergström** - Kvinna, Kondition & Löpning
   - `https://images.unsplash.com/photo-1438761681033-6461ffad8d80`
   - Energisk, sportig

4. **Alex Nguyen** - Man, Yoga & Mobilitet
   - `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d`
   - Lugn, fokuserad

5. **Jonas Karlsson** - Man, PT & Nybörjare
   - `https://images.unsplash.com/photo-1500648767791-00dcc994a43e`
   - Vänlig, tillgänglig

6. **Linda Andersson** - Kvinna, Styrka & Nutrition
   - `https://images.unsplash.com/photo-1544005313-94ddf0286df2`
   - Professionell, stark

7. **David Strömberg** - Man, Boxing & HIIT
   - `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d`
   - Intensiv, energisk

8. **Nina Holm** - Kvinna, Movement & Funktionell
   - `https://images.unsplash.com/photo-1487412720507-e7ab37603c6f`
   - Naturlig, holistisk

**Bildoptimering:**
- Format: `?q=80&w=400&h=400&fit=crop&crop=faces`
- Square crop (400x400) centrerad på ansikten
- Kvalitet 80% för balans mellan filstorlek och kvalitet
- CDN-leverans från Unsplash

### 4. TrainerCard Förbättringar

**Före:**
- 120px cirkulär avatar
- Placeholder-text (initialer) om ingen bild
- Basic styling

**Efter:**
- 160px cirkulär avatar
- 3px turkos border
- Glowing box-shadow (rgba(34, 211, 238, 0.2))
- Hover scale (1.05) med ökad shadow
- Fallback till UI Avatars API om bild saknas
- Bättre object-fit: cover & object-position: center

**CSS:**
```css
.avatar {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 3px solid var(--color-accent);
  box-shadow: 0 8px 16px rgba(34, 211, 238, 0.2);
  transition: all var(--transition-base);
}

.card:hover .avatar {
  transform: scale(1.05);
  box-shadow: 0 12px 24px rgba(34, 211, 238, 0.3);
}
```

### 5. Resultat

**Före:**
- ❌ Emojis överallt (oprofessionellt)
- ❌ Placeholder-initialer för PT:er
- ❌ Små, oansenliga avatarer

**Efter:**
- ✅ Rena SVG-ikoner (professionella)
- ✅ Riktiga ansiktsbilder för alla PT:er
- ✅ Större, mer visuella avatarer med glow-effekt
- ✅ Konsekvent design genom hela sidan

## 🎨 Design-Principer

### Ikoner
- Använd endast SVG-ikoner (Feather/Lucide-stil)
- Stroke-baserade (ej filled) för luftig känsla
- Färg: var(--color-accent) för konsistens
- Storlek: 40-48px beroende på kontext

### Bilder
- Verklighetstrogna porträtt (Unsplash)
- Square crops centrerade på ansikten
- Optimerade för web (q=80, w=400)
- CDN-leverans för snabb laddning
- Fallback till genererade avatarer

### Hover-Effekter
- Scale transforms (1.05)
- Ökad box-shadow
- Smooth transitions (300ms)
- GPU-accelererad performance

## 📝 Nästa Steg

1. **Överväg att lägga till:**
   - Lazy loading för bilder (`loading="lazy"`)
   - WebP format för ännu bättre komprimering
   - Blur placeholder medan bilder laddas

2. **Potential förbättring:**
   - Lägg till hover-tooltip med PT certifieringar
   - "Boka session" CTA direkt på TrainerCard
   - Filtrera PT:er efter specialitet

---

**Status:** Emoji-free & Professional Look ✨






