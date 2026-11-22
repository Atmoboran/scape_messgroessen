// Structure of the app: the 10 topics (one page and one simulation each).
// Texts live in content/texts.de.js under topics.<id>; colours in
// THEME.messgroessen (theme/theme.js).
//   topics   theme   colour combination (THEME.messgroessen.groups.<theme>)
//            sim     simulation (js/sims/<sim>.js)
//            l2, l3  shape and outline of the poster header
//   icon     line icon on the start tile
window.MG = window.MG || {};
window.MG.data = {
  topics: [
    { id: 'temperatur', icon: 'sonne', theme: 'temp', sim: 'temperatur', l2: 'halbkreise', l3: 'sonne' },
    { id: 'luftfeuchte', icon: 'tropfen', theme: 'feuchte', sim: 'feuchte', l2: 'tropfen', l3: 'wolke' },
    { id: 'luftdruck', icon: 'druck', theme: 'druck', sim: 'druck', l2: 'zickzack', l3: 'kreise' },
    { id: 'niederschlag', icon: 'regen', theme: 'tau', sim: 'regen', l2: 'welle', l3: 'tropfen' },
    { id: 'wind', icon: 'wind', theme: 'wind', sim: 'wind', l2: 'bogen', l3: 'stern4' },
    { id: 'gefuehlt', icon: 'person', theme: 'koerper', sim: 'koerper', l2: 'blume', l3: 'pillen' },
    { id: 'uv-index', icon: 'sonne', theme: 'himmel', sim: 'uv', l2: 'kreis', l3: 'sonne' },
    { id: 'lichtintensitaet', icon: 'licht', theme: 'licht', sim: 'licht', l2: 'halbkreise', l3: 'sonnewolke' },
    { id: 'mondphase', icon: 'mond', theme: 'nacht', sim: 'mond', l2: 'scheiben', l3: 'mond' },
    { id: 'sonnenaufgang', icon: 'aufgang', theme: 'sonne', sim: 'sonne', l2: 'halbkreis', l3: 'sonne' }
  ],
  // LOCAL: where the station stands (sunrise and sunset are computed for it)
  geo: { lat: 50.1, lon: 8.77 },
  // old direct links to single quantities open their topic
  alias: {
    aussentemperatur: 'temperatur', innentemperatur: 'temperatur',
    'luftfeuchte-aussen': 'luftfeuchte', 'luftfeuchte-innen': 'luftfeuchte', 'taupunkt-innen': 'luftfeuchte', 'taupunkt-aussen': 'luftfeuchte',
    windrichtung: 'wind', windgeschwindigkeit: 'wind', windboeen: 'wind',
    windkuehle: 'gefuehlt', 'scheinbare-temperatur': 'gefuehlt', 'gefuehlte-temperatur': 'gefuehlt'
  }
};
