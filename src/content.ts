export const siteContent = {
  phone: { display: '+48 514 574 594', href: 'tel:+48514574594' },
  nav: [
    ['Oferta', 'oferta'], ['Cennik', 'cennik'], ['Galeria', 'galeria'],
    ['FAQ', 'faq'], ['Kontakt', 'kontakt'],
  ],
  serviceAreas: ['Wieruszów', 'Kępno', 'Ostrzeszów', 'Syców', 'Kluczbork', 'Wieluń', 'Złoczew'],
  pickupLocations: ['Galewice', 'Łęka Mroczeńska'],
  vehicles: [
    {
      id: 'brazowy', name: 'Renault Trafic', finish: 'Brązowy',
      image: '/assets/renault-trafic-brazowy.webp',
      imageWidth: 1448,
      imageHeight: 1086,
      specs: ['9 miejsc', 'Manualna skrzynia', '1.6 dCi BiTurbo (125 KM)', 'Diesel · ok. 8 l/100 km', 'EURO 5'],
      equipment: ['Klimatyzacja dwustrefowa', 'Wersja LONG i duży bagażnik', 'Przyciemniane tylne szyby', '2× ISOFIX', 'Radio Bluetooth', 'Czujniki parkowania tył', 'Tempomat'],
    },
    {
      id: 'stalowy', name: 'Renault Trafic', finish: 'Stalowy',
      image: '/assets/renault-trafic-stalowy.webp',
      imageWidth: 1448,
      imageHeight: 1086,
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

export type Vehicle = (typeof siteContent.vehicles)[number]
