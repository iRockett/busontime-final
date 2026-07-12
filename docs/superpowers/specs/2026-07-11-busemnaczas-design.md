# BusemNaCzas.pl — design specification

## Direction

Premium editorial automotive landing page. True-white canvas, black typography, restrained True Blue actions, generous vertical rhythm, crisp alignment, and the supplied Renault Trafic photograph as the hero signature.

## Experience

Sticky transparent-to-white navigation; split hero with two CTAs and six trust signals; quick facts; two-vehicle presentation; benefits; service-area map; masonry gallery; four clear price cards; additional services; explicitly marked placeholder testimonials; accessible FAQ; conversion-led contact; compact footer; sticky mobile reservation action.

## Design system

- Headings: Inter Tight, body/UI: Inter.
- Colors: `#0057B8`, `#00489A`, `#2E7DE1`, `#111111`, `#2C2C2C`, `#E9EEF4`, `#F8FAFC`, `#FFFFFF`.
- Radius: 14-18px. Shadows are low-opacity and short. Blue is limited to actions, prices, active/focus states, and select icons.
- Motion: 500-700ms soft entrance, small hover lift, 1.03 image zoom, no bounce/parallax/spin; reduced-motion support.

## Content facts

Use the supplied PDF as source of truth: phone `+48 514 574 594`; pickup in Galewice and Łęka Mroczeńska; service area Wieruszów, Kępno, Ostrzeszów, Syców, Kluczbork, Wieluń, Złoczew; two manual Renault Trafic LONG vans; listed specifications, prices, mileage limits, insurance and services. Unknown email, legal address, deposit terms and foreign-travel policy must not be stated as facts.

## Behavior and accessibility

Navigation scrolls to anchored sections. Vehicle controls switch content. Gallery opens an accessible dialog. FAQ uses native disclosure behavior. Contact form validates required fields and confirms locally without pretending to send. All interactive targets have keyboard focus, labels, adequate size and WCAG AA contrast.

## SEO and performance

Semantic landmarks, one H1, metadata, OpenGraph/Twitter tags, LocalBusiness/AutoRental schema, explicit media dimensions, lazy-loaded below-fold images and no layout-shifting embeds. Hero image is copied into the project and delivered in optimized WebP with a PNG fallback only if needed.

## Acceptance

Responsive at 1440px desktop and 390px mobile; no horizontal overflow; core controls work by keyboard and pointer; production build and tests pass; browser screenshot is visually compared with the accepted concept.
