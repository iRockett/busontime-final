# BusemNaCzas.pl AI-Builder Pixel Recreation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate the current BusemNaCzas.pl single-page landing site with matching assets, Polish copy, layout, responsive behavior, motion, accessibility, SEO, and interaction states in an AI builder such as Lovable, Bolt, or Base44.

**Architecture:** Prefer importing the existing repository or its ready source ZIP because that is the only deterministic route to a pixel-identical result. If the builder must generate from prompts, use React + TypeScript with one content source, focused section components, global CSS tokens, uploaded local media, and no invented business data. Build in gated passes: foundation, static layout, interactions, responsive rules, accessibility/SEO, then screenshot comparison.

**Tech Stack:** React 19, TypeScript, Vite 6, CSS/Tailwind-compatible setup, Framer Motion 12, Lenis 1.3, Lucide React, Vitest + Testing Library.

## Global Constraints

- Entire public site language: Polish (`lang="pl"`).
- Preserve all spelling, punctuation, prices, phone number, service areas, vehicle facts, and asset filenames exactly.
- Use supplied media. Do not regenerate, reinterpret, recolor, crop offline, replace, or add stock imagery.
- Preserve current visual behavior, including mobile hero cropping and blank top-left navigation area. Do not add a header logo that current source does not render.
- No gradients except existing recommended price-card gradient, vehicle overlay, and subtle cloud overlay.
- No generic AI-builder additions: no dashboard, login, CMS, chatbot, newsletter, cookie banner, floating WhatsApp, extra statistics, stock testimonials, extra pages, or invented badges.
- No invented email, legal address, company registration data, deposit amount, cross-border policy, or availability claim beyond existing copy.
- Testimonials remain explicitly demonstrative data in source; do not present them as verified production reviews.
- Contact form currently validates locally and displays a demo confirmation; it must not claim a message was delivered.
- Target WCAG 2.2 AA: semantic landmarks, keyboard operation, visible focus, proper labels, reduced motion, meaningful image alternatives, adequate contrast, and touch-friendly controls.
- Reference viewports: desktop `1440×1000`; mobile `390×844`; also verify `768×1024`, `1100×900`, and `320×700`.
- Maximum content width `1200px`; desktop side gutters `24px`; mobile side gutters `16px`.
- Breakpoints: `1100px` and `680px`.
- Production build and all seven current tests must pass.

---

## 1. Best Recreation Route

Use this priority order:

1. **Repository import:** import `C:\dev\busnaczas-final` or connect its Git repository. Preserve `src`, `public/assets`, `index.html`, and package dependencies. This gives highest fidelity.
2. **Source ZIP import:** upload `outputs/busemnaczas-landing-page.zip`, then replace any older files with current `src`, `public/assets`, and `index.html` from repository.
3. **Prompt rebuild:** upload every asset in section 3 plus both live reference screenshots, paste Master Prompt from section 14, then issue staged prompts from section 15 one at a time.

Never ask builder to “make something similar.” Ask it to **clone supplied implementation and screenshots without redesign**.

## 2. Canonical File Map

Builder output should preserve these responsibilities even if its internal paths differ:

```text
index.html                         metadata, fonts, JSON-LD, root mount
src/main.tsx                       React root
src/App.tsx                        section order and page composition
src/content.ts                     all repeated business data
src/styles.css                     tokens, layout, breakpoints, states
src/components/Nav.tsx             fixed navigation and mobile menu
src/components/VehicleShowcase.tsx vehicle tabs, content swap, arrows
src/components/Gallery.tsx         six-image grid and lightbox
src/components/Testimonials.tsx    timed testimonial carousel
src/components/Faq.tsx             single-open accordion
src/components/Contact.tsx         local-validating demo form
src/components/Reveal.tsx          reduced-motion-aware entrance
public/assets/*                    immutable local media
public/robots.txt                  crawler policy
public/sitemap.xml                 canonical URL
```

## 3. Required Asset Upload Manifest

Upload files with exact names. Paths in UI must remain `/assets/<filename>`.

| File | Dimensions / media | Size | Exact use |
|---|---:|---:|---|
| `busemnaczas-hero-brand.webp` | 1672×941 WebP | 148,992 B | hero poster, static fallback, OpenGraph image |
| `busemnaczas-hero.mp4` | 1920×1080 H.264, 24 fps, 5.041667 s, no required audio | 2,879,302 B | autoplay hero video |
| `renault-trafic-brazowy-portrait.png` | 1078×1459 PNG | 2,688,862 B | brown vehicle card |
| `renault-trafic-stalowy-portrait-extended.png` | 959×1641 PNG | 2,340,551 B | steel vehicle card |
| `gallery-01.jpeg` | 1295×1054 JPEG | 348,356 B | gallery item 1 |
| `gallery-02.png` | 1447×1087 PNG | 2,673,135 B | gallery item 2 |
| `gallery-03.png` | 1455×1081 PNG | 2,473,502 B | gallery item 3 |
| `gallery-04.jpeg` | 1600×1200 JPEG | 487,268 B | gallery item 4 |
| `gallery-05.jpeg` | 1600×1200 JPEG | 203,681 B | gallery item 5 |
| `gallery-06.jpeg` | 1600×1200 JPEG | 450,356 B | gallery item 6 |
| `busemnaczas-footer-logo.png` | 527×473 PNG | 149,095 B | cropped footer brand image |

Reference screenshots:

- `output/playwright/live-desktop.png` — current top viewport at `1440×1000`.
- `outputs/busemnaczas-hero-update-mobile.png` — mobile visual-language guide from an earlier accepted capture. It is not source of truth for current hero height; current CSS contract in sections 6.2 and 8 is canonical.

Do not use other similarly named PNG/WebP vehicle assets unless source explicitly references them. They are alternates or historic exports.

## 4. Brand and Design System

### Character

Premium editorial automotive landing page. Calm, dependable, restrained. Quality comes from proportion, white space, typography, vehicle photography, crisp alignment, and small interaction feedback.

Avoid generic rental templates, SaaS gradients, blue-drenched sections, glossy cards, oversized icons, decorative blobs, excessive shadows, bounce, parallax, spin, or visual clutter.

### Typography

- Headings and display: `Inter Tight`, weights 500, 600, 650, 700.
- Body and UI: `Inter`, weights 400, 500, 600.
- Google Fonts URL:

```html
https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@500;600;650;700&display=swap
```

### Tokens

```css
--blue: #0057b8;
--blue-hover: #00489a;
--focus-blue: #2e7de1;
--ink: #111111;
--muted: #626a75;
--line: #e9eef4;
--soft: #f8fafc;
--white: #ffffff;
--hero-dark: #101a22;
--contact-dark: #111111;
--contact-card: #171a1e;
```

- Base body: white background, `#111`, minimum width `320px`, no horizontal overflow.
- Main container: `min(1200px, calc(100% - 48px))`; at ≤680px use `min(100% - 32px, 1200px)`.
- Main section vertical padding: `128px`; mobile `84px`.
- Radius family: `8`, `9`, `11`, `12`, `13`, `14`, `16`, `18px`; do not normalize everything to one radius.
- Shadows: subtle, low opacity, blue only around primary CTAs; no deep black card shadows.
- H2: `Inter Tight`, `clamp(42px, 4vw, 64px)`, line-height `1.04`, letter-spacing `-0.05em`, weight `600`.
- Section eyebrow: 12px, uppercase, weight 700, letter-spacing `.14em`, blue.
- Body copy: muted gray, comfortable `1.6–1.7` line height.

## 5. Exact Data Source

Implement a single content object with these values:

```ts
export const siteContent = {
  phone: { display: '+48 514 574 594', href: 'tel:+48514574594' },
  nav: [
    ['Oferta', 'oferta'],
    ['Cennik', 'cennik'],
    ['Galeria', 'galeria'],
    ['FAQ', 'faq'],
    ['Kontakt', 'kontakt'],
  ],
  serviceAreas: ['Wieruszów', 'Kępno', 'Ostrzeszów', 'Syców', 'Kluczbork', 'Wieluń', 'Złoczew'],
  pickupLocations: ['Galewice', 'Łęka Mroczeńska'],
  vehicles: [
    {
      id: 'brazowy',
      name: 'Renault Trafic',
      finish: 'Brązowy',
      image: '/assets/renault-trafic-brazowy-portrait.png',
      specs: ['9 miejsc', 'Manualna skrzynia', '1.6 dCi BiTurbo (125 KM)', 'Diesel · ok. 8 l/100 km', 'EURO 5'],
      equipment: ['Klimatyzacja dwustrefowa', 'Wersja LONG i duży bagażnik', 'Przyciemniane tylne szyby', '2× ISOFIX', 'Radio Bluetooth', 'Czujniki parkowania tył', 'Tempomat'],
    },
    {
      id: 'stalowy',
      name: 'Renault Trafic',
      finish: 'Stalowy',
      image: '/assets/renault-trafic-stalowy-portrait-extended.png',
      specs: ['9 miejsc', 'Manualna skrzynia', '1.6 dCi BiTurbo (125 KM)', 'Diesel · ok. 8 l/100 km', 'EURO 5'],
      equipment: ['Klimatyzacja dwustrefowa', 'Wersja LONG i duży bagażnik', 'Przyciemniane tylne szyby', '2× ISOFIX', 'Radio Bluetooth', 'Czujniki parkowania tył', 'Tempomat', 'Hak holowniczy'],
    },
  ],
  pricing: [
    { duration: '1 doba', price: 300, limit: '400 km / doba', recommended: false },
    { duration: '2–4 doby', price: 250, limit: '300 km / doba', recommended: true },
    { duration: '5–9 dób', price: 200, limit: '250 km / doba', recommended: false },
    { duration: '10+ dób', price: 180, limit: 'Kilometry do uzgodnienia', recommended: false },
  ],
  testimonials: [
    { name: 'Anna K.', trip: 'Wyjazd rodzinny', text: 'Dużo miejsca, prosty odbiór i bardzo dobry kontakt. Podróżowaliśmy wygodnie całą rodziną.', placeholder: true },
    { name: 'Marek P.', trip: 'Weekend w górach', text: 'Bus był przygotowany na czas, a duży bagażnik bez problemu pomieścił cały sprzęt.', placeholder: true },
    { name: 'Katarzyna W.', trip: 'Wyjazd ze znajomymi', text: 'Jasne warunki i wygodne auto. Dokładnie tego potrzebowaliśmy na wspólny wyjazd.', placeholder: true },
  ],
  faqs: [
    ['Jak wygląda rezerwacja?', 'Zadzwoń lub wyślij formularz. Potwierdzimy dostępność, termin, miejsce odbioru i warunki najmu.'],
    ['Jakie dokumenty są potrzebne?', 'Zakres wymaganych dokumentów potwierdzimy podczas rezerwacji, przed podpisaniem umowy.'],
    ['Czy obowiązuje kaucja?', 'Warunki kaucji ustalamy przy rezerwacji — skontaktuj się z nami po szczegóły.'],
    ['Czy mogę wyjechać za granicę?', 'Wyjazd zagraniczny wymaga wcześniejszego uzgodnienia przed podpisaniem umowy.'],
    ['Ile kilometrów jest w cenie?', 'Limit zależy od długości najmu: od 400 km przy jednej dobie do limitu ustalanego indywidualnie przy 10+ dobach.'],
    ['Czy mogę zwrócić auto później?', 'Niewielkie przekroczenie 1–2 godzin może zostać zaakceptowane po wcześniejszej informacji.'],
  ],
} as const
```

## 6. Exact Page Order and Section Requirements

### 6.1 Fixed navigation

- Fixed at top, z-index 50.
- Desktop height `82px`; mobile height `68px`.
- At page top: transparent/dark hero background showing through, white links and controls, transparent bottom border.
- After `window.scrollY > 24`: `rgba(255,255,255,.94)`, `1px #e9eef4` border, `0 8px 28px rgba(17,17,17,.05)` shadow, 16px blur, dark text.
- Desktop nav links centered: Oferta, Cennik, Galeria, FAQ, Kontakt, 32px gap, 14px/500.
- Right actions: phone with Phone icon, then blue `Zarezerwuj` button.
- Current implementation contains no visible top-left logo or brand text. Preserve this for exact clone.
- Below `1100px`: hide desktop links and phone; show Menu/X button; keep reservation button until `680px`.
- Below `680px`: hide reservation button; menu remains. Open mobile menu is white, stacked links, `20px 24px 28px`, 18px gaps, bottom border.

### 6.2 Full-viewport media hero

- Starts below fixed navigation using top padding equal to nav height.
- Desktop media height `calc(100svh - 82px)`, minimum `560px`.
- Mobile media height `calc(100svh - 68px)`, no minimum.
- Background `#101a22`.
- Static poster fills frame with `object-fit: cover`, centered.
- Video fills frame, centered, `object-fit: cover`, `transform: scale(1.015)` desktop / `1.02` mobile.
- Video attributes: `autoplay`, `muted`, `loop`, `playsinline`, `preload="metadata"`, poster `/assets/busemnaczas-hero-brand.webp`.
- Video accessible label: `Renault Trafic BusemNaCzas.pl w trasie`.
- Add decorative cloud layer above video: subtle screen-blended radial cloud gradients, opacity `.24`, masked out toward bottom, 30 s alternate drift; second pseudo-layer 42 s reverse drift.
- On mobile, centered cover intentionally crops left logo and right-side vehicle. Match screenshot; do not force complete artwork visibility.
- Under reduced motion: hide video and cloud layer; show poster.

### 6.3 Intro copy

- Separate white section after media hero, 1px bottom rule.
- Container padding desktop `clamp(88px, 9vw, 132px) 0 54px`; mobile `72px 0 42px`.
- Desktop two-column grid: `573px` heading column + flexible detail column, `48–92px` gap.
- H1 exact: `Wynajem 9-osobowych busów Renault Trafic`.
- H1: `clamp(48px,4vw,56px)`, `.98` line-height, `-.04em`, weight 650; mobile `45px`, `1.01`.
- Subtitle exact: `Wygodny, bezpieczny i gotowy na każdą podróż.`
- Body exact: `Wynajem krótko- i długoterminowy. Obsługujemy Wieruszów, Kępno, Ostrzeszów, Syców, Kluczbork, Wieluń i Złoczew.`
- CTA row: blue `Zarezerwuj` → `#kontakt`; outlined white Phone-icon `Zadzwoń` → `tel:+48514574594`.
- Trust row after 64px: Kategoria B, 9 osób, Klimatyzacja, Diesel, Manual, OC / AC. Each gets blue Check icon. Six columns desktop, three tablet, two mobile.

### 6.4 Quick feature rail

- Four columns desktop, two tablet/mobile, bottom rule, approximately 160px desktop height.
- Items:
  1. Users — `9 miejsc` — `Komfort dla całej ekipy`
  2. BadgeCheck — `Kategoria B` — `Bez dodatkowych uprawnień`
  3. Wrench — `Manualna skrzynia` — `Sprawdzona, 6-biegowa`
  4. Clock3 — `Dostępne od ręki` — `Szybki kontakt i rezerwacja`
- Hide supporting small text on mobile.

### 6.5 Vehicle offer — `#oferta`

- Eyebrow `Nasze busy`.
- H2 `Dwa busy. Pełna swoboda podróży.`
- Copy `Przestrzeń wersji LONG, wyposażenie na dłuższą trasę i proste warunki wynajmu.`
- White card, 18px radius, 1px line, subtle `0 20px 55px` shadow.
- Desktop grid `3fr 2fr`; stacked below `1100px`.
- Vehicle media aspect ratio `3 / 4`, full-bleed. Render chosen photo twice: decorative blurred/darkened background layer and sharp foreground. Current foreground uses `object-fit: cover` and center positioning; do not switch to `contain` unless reference comparison proves builder crop differs.
- Top-left segmented tabs `Brązowy`, `Stalowy`; selected black/white, unselected transparent gray.
- On swap: 350 ms opacity + vertical slide; outgoing and incoming content use wait mode.
- Copy column includes `01 / 02` or `02 / 02`, Renault Trafic, finish, lead paragraph, spec chips, equipment check list, blue `Zarezerwuj ten pojazd` link to contact.
- Lead exact: `Przestronny Trafic w wersji LONG — przygotowany na rodzinny wyjazd, podróż ze znajomymi lub firmowy przejazd.`
- Bottom-right previous/next arrow buttons wrap around both vehicles.
- Hover zoom sharp photo only to approximately `1.015` over 800 ms.

### 6.6 Benefits

- Soft `#f8fafc` section.
- Eyebrow `Dlaczego my`.
- H2 `Wszystko, czego potrzeba. Bez zbędnych komplikacji.`
- 3×2 desktop grid, 2 columns tablet, 1 mobile. Shared borders, no floating-card gaps.
- Six exact items:
  - ShieldCheck — `Pewne samochody` — `Przygotowane do trasy i objęte ubezpieczeniem OC oraz AC.`
  - CalendarRange — `Elastyczny wynajem` — `Od jednej doby po indywidualnie ustalany wynajem długoterminowy.`
  - Armchair — `Wygodna podróż` — `Dziewięć miejsc, dwustrefowa klimatyzacja i komfort na dłuższej trasie.`
  - Luggage — `Duży bagażnik` — `Wersja LONG daje przestrzeń na walizki, sprzęt i rodzinny ekwipunek.`
  - Banknote — `Przejrzyste ceny` — `Czytelne stawki, limity kilometrów i ubezpieczenie w cenie.`
  - MapPinned — `Lokalny odbiór` — `Dwa wygodne punkty odbioru blisko Wieruszowa i Kępna.`
- Hover: lift 4px and turn white; no stronger effect.

### 6.7 Pickup and service area

- Two-column desktop `.78fr 1.22fr`; one column tablet/mobile.
- Eyebrow `Odbiór i zasięg`.
- H2 `Blisko początku Twojej trasy.`
- Copy `Odbierz samochód w jednym z dwóch lokalnych punktów lub zapytaj o podstawienie pod wskazany adres.`
- Pickup rows: MapPin + `Galewice`; MapPin + `Łęka Mroczeńska`.
- Area chips: Wieruszów, Kępno, Ostrzeszów, Syców, Kluczbork, Wieluń, Złoczew.
- Embedded Google Map URL: `https://www.google.com/maps?q=Wierusz%C3%B3w%2C%20Polska&z=9&output=embed`.
- Map desktop height `570px`, mobile `410px`, 18px radius, grayscale-restrained treatment `saturate(.65) contrast(1.05)`.

### 6.8 Gallery — `#galeria`

- Eyebrow `Galeria`.
- H2 `Gotowy na drogę.`
- Copy `Renault Trafic w naturalnym środowisku — dużo miejsca, spokojne prowadzenie i komfort całej ekipy.`
- Current layout is not masonry: six equal square tiles, 3 columns, 14px gap, 16px radius; mobile 9px gap and 12px radius.
- Image order and alternatives:
  1. `gallery-01.jpeg` — `Szary Renault Trafic z tyłu`
  2. `gallery-02.png` — `Szary Renault Trafic z przodu`
  3. `gallery-03.png` — `Szary Renault Trafic z boku`
  4. `gallery-04.jpeg` — `Beżowy Renault Trafic w zimowej scenerii`
  5. `gallery-05.jpeg` — `Wnętrze Renault Trafic — tylne siedzenia`
  6. `gallery-06.jpeg` — `Wnętrze Renault Trafic — kabina kierowcy`
- Each tile is a button with zoom cursor, keyboard focus ring, and label `Powiększ zdjęcie: <alt>`.
- Click opens modal dialog over `rgba(8,11,14,.92)` with 12px blur. Image max `min(1200px,90vw)` and `84vh`.
- Close via top-right × button, Escape, or backdrop click. Do not close when image itself is clicked.

### 6.9 Pricing — `#cennik`

- Soft background.
- Eyebrow `Cennik`.
- H2 `Im dłuższa podróż, tym lepsza stawka.`
- Copy `Każda cena zawiera pełne ubezpieczenie OC i AC.`
- Four cards desktop, two tablet, one mobile. Min heights 360px / mobile 320px.
- Display exact pricing data from section 5. Currency line uses large blue number + `zł`; secondary label `za dobę`; Gauge icon + limit; link `Zapytaj o termin` → `#kontakt`.
- `2–4 doby` card: label `Najczęściej wybierane`, blue border, blue top inset line, restrained gradient `linear-gradient(135deg,#fff 0%,#f4f9ff 56%,#dfeeff 100%)`.
- Hover lift 5px + subtle shadow.
- Notes below:
  - `Nadprzebieg: 1 zł/km.`
  - `Doba liczona jest od godziny odbioru. Przekroczenie o 1–2 godziny może zostać zaakceptowane po wcześniejszej informacji.`
  - `Najem długoterminowy wyceniamy indywidualnie.`

### 6.10 Additional services

- Eyebrow `Usługi dodatkowe`.
- H2 `Jeszcze mniej logistyki po Twojej stronie.`
- Three full-width ruled rows:
  1. Truck — `Podstawienie i odbiór` — `Pod wskazany adres, licząc od miejsca postoju pojazdu.` — `5 zł/km`
  2. Bike — `Bagażnik rowerowy` — `Wersja 3-miejscowa, dostępna z pojazdem wyposażonym w hak.` — `80 zł`
  3. Route — `Kolejne akcesoria` — `Oferta wyposażenia dodatkowego będzie rozwijana.` — `Wkrótce`; entire row opacity `.6`.

### 6.11 Testimonials

- Soft background, two-column desktop.
- Eyebrow `Opinie`.
- H2 `Podróż zaczyna się od dobrego wyboru.`
- Copy `Miejsce przygotowane na przyszłe, zweryfikowane recenzje klientów.`
- White 18px card with five blue stars, 27px quote, letter avatar, name, trip, progress dots.
- Auto-advance every `5200ms`; dot buttons manually select.
- Transition 400ms opacity + 16px horizontal motion.
- Keep `placeholder: true` data. Existing visual note is CSS-hidden, but do not remove placeholder semantics from data or invent verification.

### 6.12 FAQ — `#faq`

- Two-column desktop `.75fr 1.25fr`; stacked tablet/mobile.
- Eyebrow `FAQ`.
- H2 `Najważniejsze odpowiedzi przed drogą.`
- Copy `Jeśli nie widzisz swojego pytania, zadzwoń — odpowiemy od razu.`
- Blue phone text link `+48 514 574 594`.
- Six ruled accordion items from section 5. Initial state: all closed. Only selected item opens; selecting it again closes it.
- Header button includes ChevronDown; expanded state blue with icon rotated 180°.
- Animate height and opacity; preserve `aria-expanded`.

### 6.13 Contact — `#kontakt`

- Dark `#111` section, desktop padding `110px 0`; mobile `82px 0 100px`.
- Two columns `.8fr 1.2fr`, 90px gap; stack below 1100px.
- H2 `Ustalmy termin Twojej podróży.`
- Copy `Zadzwoń lub zostaw krótki formularz. Potwierdzimy dostępność i odpowiemy na pytania przed rezerwacją.`
- Phone CTA: blue icon tile, eyebrow `Zadzwoń teraz`, number `+48 514 574 594`.
- Meta:
  - Clock3 — `Godziny odbioru ustalamy indywidualnie`
  - MapPin — `Galewice · Łęka Mroczeńska`
- Form fields:
  - `Imię`, name `name`, required, autocomplete `name`
  - `Telefon`, name `phone`, type `tel`, required, autocomplete `tel`
  - `Termin`, name `date`, required, placeholder `np. 12–14 lipca`
  - `Wiadomość`, name `message`, 4 rows, placeholder `Liczba osób, miejsce odbioru, dodatkowe pytania…`
- Button `Wyślij zapytanie` + ArrowRight.
- Current exact submit behavior: prevent default, set local sent state, show status:
  `Dziękujemy. To wersja demonstracyjna — w finalnej stronie formularz zostanie połączony z wybraną skrzynką.`
- Do not clear values or make a network request in pixel-clone phase.

### 6.14 Footer and mobile CTA

- White footer, `52px 0 30px`; mobile bottom padding `100px`.
- Desktop top grid `1fr auto 1fr`.
- Footer brand crop: wrapper `160×110`, hidden overflow; image width `180px`, transform `translate(-10px,-25px)`.
- Center links: Oferta, Cennik, Galeria, FAQ, Kontakt.
- Right blue phone link.
- Bottom rule, then `© 2026 BusemNaCzas.pl`, `Polityka prywatności` as current non-linked text, and external `Google Maps` link to `https://maps.google.com/?q=Wieruszów`.
- Mobile fixed CTA appears only ≤680px: left/right/bottom `12px`, height `58px`, white translucent 16px-radius shell, blur 14px, two columns `.8fr 1.2fr`. Left Phone + `Zadzwoń`; right blue `Zarezerwuj`.

## 7. Motion Specification

- Global smooth scroll: Lenis `{ lerp: 0.085, wheelMultiplier: 0.9 }`, RAF-driven.
- CSS native smooth anchor scroll and `scroll-padding-top: 92px` as fallback.
- All section reveals: initial `{ opacity: 0, y: 24 }`; while in view `{ opacity: 1, y: 0 }`; trigger once at 16% visibility; duration `.62s`; easing `[0.22,1,0.36,1]`.
- Primary/secondary button hover: translateY `-2px`, 250ms.
- Generic image hover: scale `1.03`, 800ms, easing `cubic-bezier(.22,1,.36,1)`.
- Benefits: translateY `-4px`, 300ms.
- Price cards: translateY `-5px`, 300ms.
- No scroll parallax, spring bounce, rotating decorative elements, or cursor-follow effects.
- Respect `prefers-reduced-motion`: native scroll auto; animations and transitions `.01ms`; hide hero video and cloud overlay; Framer Motion uses user preference.

## 8. Responsive Contract

### Above 1100px

- Full desktop nav.
- Intro 2 columns.
- Trust 6 columns.
- Quick facts 4 columns.
- Vehicle 2 columns.
- Benefits 3 columns.
- Location/testimonial/FAQ/contact 2 columns.
- Pricing 4 columns.

### 681–1100px

- Menu button replaces centered nav/phone.
- Intro becomes one column.
- Trust 3 columns.
- Quick facts 2 columns.
- Vehicle stacks.
- Benefits 2 columns.
- Location/testimonial/FAQ/contact stack.
- Pricing 2 columns.

### 320–680px

- 16px side gutters.
- 68px nav; header reservation action hidden; menu button retained.
- Hero consumes viewport below nav and intentionally crops source via center cover.
- H1 45px; section H2 39px; contact H2 46px.
- Intro CTAs share row equally.
- Trust 2 columns.
- Quick feature descriptions hidden.
- Section padding 84px.
- Vehicle copy `35px 24px 80px`; vehicle CTA full width.
- Benefits 1 column.
- Map 410px.
- Gallery remains 3 square columns unless width forces safe shrink; 9px gap.
- Pricing 1 column.
- Service price moves beneath text.
- Contact form 1 column, `24px 18px`.
- Footer one column.
- Sticky bottom mobile CTA visible; footer reserves enough bottom space.

## 9. Accessibility Contract

- One H1 only. Logical H2/H3 order.
- Landmarks: header/nav, main, footer.
- Every anchor target ID unique: `top`, `oferta`, `galeria`, `cennik`, `faq`, `kontakt`.
- Vehicle selector uses `role="tablist"`, `role="tab"`, and `aria-selected`.
- Gallery uses actual buttons; modal uses `role="dialog"`, `aria-modal="true"`, dialog label from selected alt. Escape closes.
- FAQ buttons use `aria-expanded`.
- Mobile menu button label toggles `Otwórz menu` / `Zamknij menu`.
- Inputs retain visible text labels and required semantics.
- Confirmation uses `role="status"`.
- Decorative layers use `aria-hidden="true"`; vehicle foreground and gallery imagery retain meaningful Polish alt text.
- Visible focus: gallery 3px blue outline with 3px offset; form 3px translucent focus halo; other controls need equivalent keyboard-visible focus even if browser default is used.
- Touch targets should be at least 44px in interactive dense areas.
- No content or action available only by hover.

## 10. SEO and Static Files

Use exact head content:

```html
<html lang="pl">
<title>Wynajem 9-osobowych busów Renault Trafic | BusemNaCzas.pl</title>
<meta name="description" content="Wynajem 9-osobowych Renault Trafic w okolicach Wieruszowa i Kępna. Krótko- i długoterminowo. Zadzwoń: +48 514 574 594." />
<meta name="theme-color" content="#ffffff" />
<meta property="og:title" content="BusemNaCzas.pl — wynajem 9-osobowych busów" />
<meta property="og:description" content="Wygodny, bezpieczny i gotowy na każdą podróż." />
<meta property="og:type" content="website" />
<meta property="og:image" content="/assets/busemnaczas-hero-brand.webp" />
<meta name="twitter:card" content="summary_large_image" />
```

JSON-LD:

```json
{
  "@context": "https://schema.org",
  "@type": "AutoRental",
  "name": "BusemNaCzas.pl",
  "telephone": "+48514574594",
  "areaServed": ["Wieruszów", "Kępno", "Ostrzeszów", "Syców", "Kluczbork", "Wieluń", "Złoczew"],
  "makesOffer": {
    "@type": "Offer",
    "itemOffered": {
      "@type": "Car",
      "name": "Renault Trafic LONG",
      "vehicleSeatingCapacity": 9
    }
  }
}
```

`robots.txt`:

```text
User-agent: *
Allow: /

Sitemap: https://busemnaczas.pl/sitemap.xml
```

`sitemap.xml` includes one URL: `https://busemnaczas.pl/`.

## 11. Functional Acceptance Tests

Builder must demonstrate all results:

- [ ] H1 `Wynajem 9-osobowych busów Renault Trafic` exists once.
- [ ] `300 zł` pricing heading renders.
- [ ] More than one visible `Zarezerwuj` link exists.
- [ ] Every visible phone action uses `tel:+48514574594`.
- [ ] Hero video has autoplay, muted, loop, playsinline, poster, and correct MP4 source.
- [ ] Reduced-motion mode displays poster and suppresses hero motion.
- [ ] Default vehicle is Brązowy with correct portrait asset.
- [ ] Selecting Stalowy reveals `Hak holowniczy` and steel extended portrait.
- [ ] Previous/next controls wrap around vehicle list.
- [ ] Six gallery images render in correct order.
- [ ] Gallery item 2 opens a dialog and closes via button, Escape, and backdrop.
- [ ] Mobile menu opens/closes; selecting a link closes it.
- [ ] FAQ item opens with `aria-expanded=true` and closes on second click.
- [ ] Contact form blocks empty required fields.
- [ ] Valid local form submission shows demo status and performs no network request.
- [ ] Testimonials advance every 5.2 seconds and dots switch manually.
- [ ] Anchor links land below fixed navigation.
- [ ] No horizontal overflow at 320, 390, 680, 768, 1100, and 1440px.
- [ ] No missing media request or console error.
- [ ] Page remains usable with JavaScript-delayed fonts and media.
- [ ] Build completes successfully.

## 12. Visual Acceptance Matrix

At each viewport compare current build against reference, using overlay/difference mode when builder provides visual testing:

| Viewport | Required checks |
|---|---|
| 1440×1000, top | 82px dark header; centered nav; phone + CTA right; full hero art fills to ~905px; no header brand left |
| 390×844, top | 68px dark header; menu control; full-height center-cropped hero; bottom mobile CTA with 12px side insets; no horizontal overflow |
| 1440, intro | 573px H1 column, right copy/CTAs, six-column trust row |
| 1440, offer | 3:2 vehicle card split, portrait crop, floating tabs, correct specs |
| 390, offer | stacked card, full-width CTA, arrows not overlapping content |
| 1440, pricing | four equal cards, only 2–4 card highlighted |
| 390, contact/footer | single-column form, readable dark contrast, sticky CTA clear of footer content |

Tolerance after fonts/media loaded:

- Major blocks: ≤8px position/size deviation.
- Typography: exact families/weights; ≤2px font-size deviation.
- Colors: exact supplied hex/RGBA values.
- Border radii: exact or ≤1px deviation.
- Copy: zero textual deviation.
- Assets: zero substitution.

## 13. Do-Not-Invent List

Builder must not infer or add:

- email address;
- street/legal address;
- NIP, REGON, company name, owner name;
- reservation calendar or live availability;
- online payment;
- deposit amount;
- foreign-travel permission beyond “requires prior arrangement”;
- privacy-policy content or linked route;
- analytics/consent tooling;
- real customer-review verification;
- WhatsApp or social profiles;
- automatic booking confirmation;
- extra fleet models or automatic transmissions.

## 14. Master Copy-Paste Prompt

Paste this after uploading assets and reference screenshots:

```text
Recreate the attached BusemNaCzas.pl website as a pixel-faithful, production-quality React + TypeScript single-page landing page. This is a reconstruction task, not a redesign. Treat attached screenshots, assets, and supplied copy as immutable source of truth.

Use React, TypeScript, local CSS, Lucide icons, Framer Motion for restrained state/reveal animation, and Lenis for smooth scrolling if supported. If platform uses an equivalent React stack, preserve behavior and visual output rather than changing architecture. Do not add features or business facts.

Brand: premium editorial automotive; true-white canvas; near-black typography; restrained blue #0057B8 only for CTAs, prices, focus, active controls, and select icons; Inter Tight headings; Inter body; generous whitespace; thin #E9EEF4 rules; #F8FAFC soft sections; 14–18px radii; low-opacity shadows. Avoid generic AI design, gradients except the specified recommended price card, decorative blobs, oversized icons, stock imagery, excessive cards, bounce, parallax, and visual clutter.

Page order: fixed transparent-to-white navigation; full-viewport autoplay muted looping hero video with poster and subtle cloud drift; separate two-column intro with H1 and CTAs; six trust signals; four-item quick-feature rail; two-vehicle switcher; six benefit cells; pickup/service-area section with embedded map; six-square gallery with accessible lightbox; four price cards; three service rows; timed testimonial card; six-item FAQ accordion; dark contact section with local demo form; footer; mobile-only fixed call/reserve CTA.

Use exact uploaded asset filenames and /assets paths. Never regenerate or replace images/video. Hero uses busemnaczas-hero-brand.webp and busemnaczas-hero.mp4. Vehicle photos use renault-trafic-brazowy-portrait.png and renault-trafic-stalowy-portrait-extended.png. Gallery uses gallery-01.jpeg, gallery-02.png, gallery-03.png, gallery-04.jpeg, gallery-05.jpeg, gallery-06.jpeg in that order. Footer uses busemnaczas-footer-logo.png.

Preserve current top navigation exactly: desktop center links Oferta/Cennik/Galeria/FAQ/Kontakt; phone and blue Zarezerwuj button right; no visible left header logo. At scrollY > 24 it becomes translucent white with blur, border, shadow, dark text. Height 82px desktop, 68px mobile. At <=1100px use Menu/X and hide desktop links/phone. At <=680px hide header reservation button and show fixed bottom CTA.

Hero: height calc(100svh - nav height), desktop min-height 560px; object-fit cover; centered; video scale 1.015 desktop/1.02 mobile; mobile center crop is intentional. Autoplay, muted, loop, playsinline, preload metadata, poster. Reduced motion hides video/cloud and shows poster.

Exact H1: “Wynajem 9-osobowych busów Renault Trafic”. Exact subtitle: “Wygodny, bezpieczny i gotowy na każdą podróż.” Exact body: “Wynajem krótko- i długoterminowy. Obsługujemy Wieruszów, Kępno, Ostrzeszów, Syców, Kluczbork, Wieluń i Złoczew.” CTAs: Zarezerwuj -> #kontakt; Zadzwoń -> tel:+48514574594. Phone display is +48 514 574 594.

Use the complete data, section copy, responsive contract, motion values, SEO metadata, JSON-LD, accessibility contract, and acceptance checklist from attached implementation plan file 2026-07-14-ai-builder-pixel-recreation.md. Current source/CSS is canonical when a historic screenshot differs. Do not abbreviate or rewrite Polish copy. Do not invent missing email, legal address, privacy content, deposit amount, customer reviews, or form delivery.

Form is intentionally demo-only: required Imię, Telefon, Termin; optional Wiadomość. On submit prevent default and show: “Dziękujemy. To wersja demonstracyjna — w finalnej stronie formularz zostanie połączony z wybraną skrzynką.” Do not claim delivery.

Responsive breakpoints: 1100px and 680px. Container max 1200px, 24px desktop gutters, 16px mobile gutters. Verify 1440×1000 against current desktop capture and verify 390×844 against explicit current mobile contract; use historic mobile capture only for visual language. Do not stop after first render: compare screenshots, correct spacing, crop, typography, section heights, colors, radii, and responsive states until within specified tolerance. Run build and interaction checks before declaring done.
```

## 15. Staged Builder Prompts

Use one prompt per stage. Do not paste later stage until prior gate passes.

### Task 1: Import foundation and immutable media

**Files:** Create/import file map from section 2 and all assets from section 3.

**Interfaces:** Produces asset URLs and React shell used by every later task.

- [ ] Prompt builder:

```text
Stage 1 only. Import all attached assets with exact filenames under public/assets. Create React + TypeScript shell, install Lucide React, Framer Motion, and Lenis or platform-equivalent packages. Add Inter/Inter Tight fonts, exact design tokens, body reset, 1200px container, breakpoints 1100/680. Add content.ts with the exact data from supplied plan. Do not build sections yet. Verify every required asset URL returns 200 and preserve Polish UTF-8 characters.
```

- [ ] Gate: inspect asset network responses, fonts, `lang="pl"`, and data values. Reject any renamed file or mojibake.

### Task 2: Header, hero, and intro

**Files:** `src/components/Nav.tsx`, `src/App.tsx`, `src/styles.css`.

**Interfaces:** Produces fixed navigation, top media, anchor offset, intro, trust, and feature rail.

- [ ] Prompt builder:

```text
Stage 2 only. Build exact fixed navigation, full-viewport poster/video hero, cloud overlay, intro copy, CTAs, trust row, and quick-feature rail from plan sections 6.1–6.4. Preserve intentional empty top-left header area and mobile center crop. Implement scroll state at >24px and reduced-motion poster fallback. Compare desktop at 1440×1000 to current capture; at 390×844 follow current CSS contract and use historic mobile capture only for visual language.
```

- [ ] Gate: desktop/mobile top screenshots meet matrix; video attributes and phone links correct.

### Task 3: Offer, benefits, and locations

**Files:** `src/components/VehicleShowcase.tsx`, `src/App.tsx`, `src/styles.css`.

**Interfaces:** Consumes content vehicle array; produces tabs/arrows and section anchors.

- [ ] Prompt builder:

```text
Stage 3 only. Build offer section, two-vehicle tab/arrow switcher, exact vehicle data/equipment, dual-layer vehicle media, benefits grid, and pickup/service-area map exactly from plan sections 6.5–6.7. Default Brązowy. Stalowy must reveal Hak holowniczy. Use current foreground object-fit cover. Implement desktop and stacked layouts plus restrained transitions.
```

- [ ] Gate: both vehicles, wrapping arrows, exact assets, map, and breakpoints pass.

### Task 4: Gallery and pricing

**Files:** `src/components/Gallery.tsx`, `src/App.tsx`, `src/styles.css`.

**Interfaces:** Produces accessible gallery dialog and pricing cards.

- [ ] Prompt builder:

```text
Stage 4 only. Add exact six-square 3-column gallery and accessible lightbox from plan section 6.8. Add pricing section from 6.9 with exact tiers, mileage, notes, and only 2–4 doby highlighted. Implement Escape/backdrop/button close and keyboard focus. Do not make gallery masonry.
```

- [ ] Gate: six correct asset sources/order/alts, dialog paths, and price values pass.

### Task 5: Services, testimonials, FAQ

**Files:** `src/components/Testimonials.tsx`, `src/components/Faq.tsx`, `src/App.tsx`, `src/styles.css`.

**Interfaces:** Consumes content testimonials/FAQs; produces timer, dots, accordion.

- [ ] Prompt builder:

```text
Stage 5 only. Add three service rows, timed testimonials, and six-item FAQ exactly from plan sections 6.10–6.12. Testimonials rotate every 5200ms and dots select manually. Preserve placeholder data. FAQ begins closed and toggles one item with aria-expanded and height/opacity animation.
```

- [ ] Gate: timer, manual dots, FAQ keyboard activation, exact copy, and muted third service row pass.

### Task 6: Contact, footer, mobile CTA

**Files:** `src/components/Contact.tsx`, `src/App.tsx`, `src/styles.css`.

**Interfaces:** Produces required-field local form and final conversion paths.

- [ ] Prompt builder:

```text
Stage 6 only. Build dark contact section, exact demo form behavior, footer crop/layout, external map link, and <=680px fixed mobile CTA from plan sections 6.13–6.14. No API, database, email integration, or success-delivery claim. Preserve Polityka prywatności as non-linked text.
```

- [ ] Gate: required validation, demo status, no network submission, tel links, footer, and sticky CTA pass.

### Task 7: Motion, accessibility, SEO, and static files

**Files:** `src/components/Reveal.tsx`, `src/App.tsx`, `src/styles.css`, `index.html`, `public/robots.txt`, `public/sitemap.xml`.

**Interfaces:** Final global behavior and discoverability.

- [ ] Prompt builder:

```text
Stage 7 only. Apply exact reveal/hover/smooth-scroll values from section 7, reduced-motion behavior, accessibility contract from section 9, and exact SEO/static-file content from section 10. Do not alter layout or copy while doing this. Verify tab order, focus visibility, semantics, image alternatives, and no motion under reduced-motion preference.
```

- [ ] Gate: semantic/accessibility checks and metadata inspection pass.

### Task 8: Visual convergence and release gate

**Files:** Existing generated files only; no new features.

**Interfaces:** Produces final deployable clone.

- [ ] Prompt builder:

```text
Stage 8 only. Do not redesign or add features. Capture 1440×1000 and 390×844 screenshots. Compare desktop to supplied live-desktop.png. Compare mobile to explicit current contract in sections 6.1, 6.2, 8, and 12; use historic mobile capture only for visual language, not hero height. Iteratively correct only measurable mismatches in spacing, typography, crop, header state, height, color, border, radius, shadow, and responsive layout. Then run every functional and visual acceptance item from sections 11–12. Report each check pass/fail and fix every fail before declaring complete.
```

- [ ] Gate: zero textual/asset deviations, no console errors, no overflow, all interactions pass, production build succeeds.

## 16. Production Decisions That Require Owner Input

These do not block exact recreation. They block converting demo into a truthful production funnel:

1. Contact destination: email service, form backend, CRM, or phone-only.
2. Privacy policy: actual legal text and whether it should become a linked page.
3. Testimonials: replace demonstrations with verified reviews or remove section.
4. Analytics/cookie consent: chosen provider and legal basis, if any.
5. Canonical deployment: confirm `https://busemnaczas.pl/` is final live domain.

Until answers exist, preserve current demo behavior and do not invent solutions.

## 17. Current Verification Baseline

Verified against repository on 2026-07-14:

- Production build: passes (`tsc -b` + Vite; 1,989 modules transformed).
- Test suite: passes, 2 files / 7 tests.
- Current desktop top viewport captured at `1440×1000`; mobile behavior verified from source/CSS and supported by historic accepted visual-language capture.
- Hero video: H.264 1920×1080, 24 fps, 5.041667 seconds.
- Existing graph confirms page composition around `App.tsx`, `content.ts`, Nav, VehicleShowcase, Gallery, Testimonials, FAQ, Contact, and Reveal.

Warnings printed by Vite about Framer Motion module-level `"use client"` directives are non-fatal; build exits 0.
