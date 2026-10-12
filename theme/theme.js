// THEME – brand and colours used from JavaScript (logo, footer, canvas
// drawings). The CSS side lives in theme.css. For another institution,
// replace the values here; the keys are what the app looks up.
window.THEME = {
  brand: {
    name: 'SCAPE°',
    // Wordmark: name with the subtitle spread over its full width.
    logoHtml:
      '<span class="logo-word">SCAPE°</span>' +
      '<span class="logo-sub" aria-hidden="true"><span>Wetter</span><span>Klima</span><span>Mensch</span></span>',
    logoLabel: 'SCAPE° – Wetter Klima Mensch',
    claim: 'Wetter, Klima, Wandel. Wir erklären es.',
    contactHtml: 'SCAPE°<br>Frankfurter Straße 39<br>63065 Offenbach am Main<br>Instagram: @scape_offenbach<br>scape@offenbach.de',
    titleSuffix: ' – SCAPE°',
    themeColor: '#F2E4BA',
    // Short mark S° for the browser tab.
    favicon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#FFF487"/><text x="16" y="23.5" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="19" fill="#000">S°</text></svg>'
  },

  // Typeface for canvas text (the same stack as --font in theme.css).
  font: '"Founders Grotesk","Helvetica Neue",Inter,Arial,sans-serif',

  // The SCAPE° palette by name. Drawings refer to these names.
  palette: {
    black: '#000000', white: '#FFFFFF',
    olive: '#726B1E', sand: '#D4BFA3',
    gold: '#E09F00', amber: '#F59E24', yellow: '#FFE547', yellowStrong: '#FFD500', yellowS: '#FDC618',
    yellowPastel: '#FFF487', yellowPale: '#FDF6B7',
    rust: '#D55117', orange: '#EE7518', salmon: '#EF887F', pink: '#F8E1E6', cream: '#F2E4BA',
    red: '#E41513', red2: '#E8472E',
    purple: '#442683', purple2: '#523E91', lavender: '#E0E5F5', lilac: '#C5B8DB',
    greenStrong: '#00983A', green: '#62BA91', greenPale: '#B0D8C0', mint: '#CFE6CE', paleGreen: '#D0E8DC',
    cyan: '#0097BE', cyan2: '#44ABCC', cyan3: '#80C0DA', petrol: '#1F6C8E', teal: '#007B73', grey: '#AEC4C2',
    navy: '#28348B', blue: '#0253A0', blue2: '#3274BA', bluePale: '#98B8DD', ice: '#D4EDF8'
  }
};

// ---- Messgrößen: Farbthemen je Gruppe und die Formen des Grafiksystems ----
/* Farbthemen nach CD: immer kräftige Töne mit Pastelltönen kombinieren */
THEME.groups = {
  temp:     { f1: '#FFF487', f2: '#EE7518', f3: '#28348B', l2: '#62BA91', l3: '#F8E1E6', accent: '#EE7518', pale: '#FFF487', tile: '#FFF487' },
  feuchte:  { f1: '#CFE6CE', f2: '#007B73', f3: '#442683', l2: '#E09F00', l3: '#C5B8DB', accent: '#E09F00', pale: '#CFE6CE', tile: '#CFE6CE' },
  tau:      { f1: '#D4EDF8', f2: '#E09F00', f3: '#44ABCC', l2: '#C5B8DB', l3: '#FFE547', accent: '#44ABCC', pale: '#D4EDF8', tile: '#D4EDF8' },
  druck:    { f1: '#E0E5F5', f2: '#FFE547', f3: '#D0E8DC', l2: '#0097BE', l3: '#0097BE', accent: '#0097BE', pale: '#FFE547', tile: '#E0E5F5' },
  wind:     { f1: '#FDF6B7', f2: '#C5B8DB', f3: '#EE7518', l2: '#D4EDF8', l3: '#EE7518', accent: '#EE7518', pale: '#FDF6B7', tile: '#FDF6B7' },
  koerper:  { f1: '#F8E1E6', f2: '#EF887F', f3: '#D55117', l2: '#FFE547', l3: '#FFFFFF', accent: '#EF887F', pale: '#F8E1E6', tile: '#F8E1E6' },
  himmel:   { f1: '#D0E8DC', f2: '#0097BE', f3: '#FFF487', l2: '#EE7518', l3: '#FFFFFF', accent: '#44ABCC', pale: '#FFF487', tile: '#D0E8DC' }
};

/* Ebene 2: gefüllte Formen (klein, ganz sichtbar) – viewBox 0 0 100 100 */
THEME.shapes = {
  halbkreise: c => `<path d="M0 50 A50 50 0 0 1 100 50 Z" fill="${c}"/><path d="M0 100 A50 50 0 0 1 100 100 Z" fill="${c}"/>`,
  halbkreis:  c => `<path d="M0 90 A50 50 0 0 1 100 90 Z" fill="${c}"/>`,
  kreis:      c => `<circle cx="50" cy="50" r="46" fill="${c}"/>`,
  bogen:      c => `<path d="M5 95 A45 45 0 0 1 95 95 L75 95 A25 25 0 0 0 25 95 Z" fill="${c}"/>`,
  zickzack:   c => `<path d="M0 70 L20 40 L40 70 L60 40 L80 70 L100 40 L100 60 L80 90 L60 60 L40 90 L20 60 L0 90 Z" fill="${c}"/>`,
  welle:      c => `<path d="M0 80 C15 20 35 20 50 60 C65 20 85 20 100 80 L100 100 L80 100 C70 60 60 60 50 95 C40 60 30 60 20 100 L0 100 Z" fill="${c}"/>`,
  blume:      c => `<g fill="${c}"><circle cx="50" cy="26" r="24"/><circle cx="74" cy="50" r="24"/><circle cx="50" cy="74" r="24"/><circle cx="26" cy="50" r="24"/></g>`,
  tropfen:    c => `<path d="M50 4 C50 4 18 46 18 64 a32 32 0 0 0 64 0 C82 46 50 4 50 4 Z" fill="${c}"/>`,
  scheiben:   c => `<path d="M50 0 A50 50 0 0 1 50 100 Z" fill="${c}"/><path d="M44 0 A50 50 0 0 0 44 100 Z" fill="${c}"/>`
};

/* Ebene 3: Linienillustrationen (groß, angeschnitten) – viewBox 0 0 400 400 */
THEME.outlines = {
  tropfen:  `<path d="M200 30 C200 30 90 170 90 240 a110 110 0 0 0 220 0 C310 170 200 30 200 30 Z"/><circle cx="200" cy="245" r="60"/>`,
  tropfen2: `<path d="M140 60 C140 60 60 170 60 220 a80 80 0 0 0 160 0 C220 170 140 60 140 60 Z"/><path d="M270 140 C270 140 190 250 190 300 a80 80 0 0 0 160 0 C350 250 270 140 270 140 Z"/>`,
  wolke:    `<path d="M110 280 a70 70 0 0 1 10 -138 a90 90 0 0 1 170 20 a60 60 0 0 1 -10 118 Z"/><circle cx="150" cy="330" r="6"/><circle cx="210" cy="345" r="6"/><circle cx="270" cy="330" r="6"/>`,
  kreise:   `<circle cx="160" cy="200" r="120"/><circle cx="250" cy="200" r="120"/>`,
  stern4:   `<path d="M200 20 L222 178 L380 200 L222 222 L200 380 L178 222 L20 200 L178 178 Z"/>`,
  sonne:    `<circle cx="200" cy="200" r="80"/><path d="M200 40 V90 M200 310 V360 M40 200 H90 M310 200 H360 M87 87 L122 122 M278 278 L313 313 M87 313 L122 278 M278 122 L313 87"/>`,
  pillen:   `<rect x="60" y="80" width="280" height="80" rx="40"/><rect x="100" y="200" width="260" height="80" rx="40"/>`,
  blume:    `<circle cx="200" cy="120" r="80"/><circle cx="280" cy="200" r="80"/><circle cx="200" cy="280" r="80"/><circle cx="120" cy="200" r="80"/>`,
  sonnewolke: `<circle cx="250" cy="150" r="80"/><path d="M90 300 a60 60 0 0 1 10 -118 a80 80 0 0 1 150 20 a50 50 0 0 1 -10 98 Z"/>`,
  mond:     `<path d="M260 60 a150 150 0 1 0 0 280 a120 120 0 1 1 0 -280 Z"/>`,
  kiesel:   `<path d="M80 200 C80 110 170 70 240 90 C330 115 350 200 310 260 C270 320 160 330 110 290 C90 272 80 240 80 200 Z"/>`
};

/* Linien-Icons für die Display-Felder (Ebene 3, angeschnitten) */
THEME.icons = {
  sonne:   '<circle cx="50" cy="50" r="22"/><path d="M50 8V20M50 80V92M8 50H20M80 50H92M20 20L29 29M71 71L80 80M20 80L29 71M71 29L80 20"/>',
  haus:    '<path d="M12 48L50 14L88 48V90H12Z"/><rect x="40" y="58" width="20" height="32"/>',
  tropfen: '<path d="M50 8C50 8 20 48 20 64a30 30 0 0 0 60 0C80 48 50 8 50 8Z"/>',
  fenster: '<rect x="14" y="10" width="72" height="80"/><path d="M50 10V90M14 50H86"/><circle cx="30" cy="70" r="3"/><circle cx="66" cy="30" r="3"/><circle cx="70" cy="66" r="3"/>',
  nebel:   '<path d="M8 36H70M24 52H92M8 68H76M30 84H90"/>',
  druck:   '<circle cx="50" cy="50" r="40"/><path d="M50 50L76 30"/><circle cx="50" cy="50" r="4"/>',
  regen:   '<path d="M22 60a16 16 0 0 1 4 -32a22 22 0 0 1 42 4a14 14 0 0 1 -2 28Z"/><path d="M34 70L30 82M52 70L48 82M70 70L66 82"/>',
  kompass: '<circle cx="50" cy="50" r="40"/><path d="M50 14L58 50L50 86L42 50Z"/>',
  wind:    '<path d="M8 40H64a12 12 0 1 0 -12 -12M8 60H80a12 12 0 1 1 -12 12"/>',
  boee:    '<path d="M6 70L22 60L34 66L48 30L60 62L74 54L94 58"/>',
  person:  '<circle cx="50" cy="22" r="12"/><path d="M28 92V58a22 22 0 0 1 44 0V92"/>',
  licht:   '<circle cx="50" cy="44" r="22"/><path d="M40 72H60M42 82H58"/>',
  mond:    '<path d="M62 12a40 40 0 1 0 0 76a32 32 0 1 1 0 -76Z"/>'
};

/* Plakatköpfe der Startseite und von „Warum messen?“ */
THEME.posters = {
  start: { f1: '#D4EDF8', f2: '#E09F00', f3: '#44ABCC', l2: 'bogen', l2c: '#C5B8DB', l3: 'sonne', l3c: '#FFE547' },
  warum: { f1: '#E0E5F5', f2: '#FFE547', f3: '#D0E8DC', l2: 'zickzack', l2c: '#0097BE', l3: 'wolke', l3c: '#0097BE' }
};
