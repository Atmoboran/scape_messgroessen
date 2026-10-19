// Structure of the app: the 10 topics (one page and one simulation each) and
// the fields of the station display. Texts live in content/texts.de.js under
// topics.<id> and tiles.<id>; colours in THEME.messgroessen (theme/theme.js).
//   topics   theme   colour combination (THEME.messgroessen.groups.<theme>)
//            sim     simulation (js/sims/<sim>.js)
//            l2, l3  shape and outline of the poster header
//   tiles    topic   the topic the field opens (the display groups fields by topic)
//            icon    line icon on the field
//            live    computed for today instead of a sample value: moon | rise | set
window.MG = window.MG || {};
window.MG.data = {
  topics: [
    { id: 'temperatur', theme: 'temp', sim: 'temperatur', l2: 'halbkreise', l3: 'sonne' },
    { id: 'luftfeuchte', theme: 'feuchte', sim: 'feuchte', l2: 'tropfen', l3: 'wolke' },
    { id: 'luftdruck', theme: 'druck', sim: 'druck', l2: 'zickzack', l3: 'kreise' },
    { id: 'niederschlag', theme: 'tau', sim: 'regen', l2: 'welle', l3: 'tropfen' },
    { id: 'wind', theme: 'wind', sim: 'wind', l2: 'bogen', l3: 'stern4' },
    { id: 'gefuehlt', theme: 'koerper', sim: 'koerper', l2: 'blume', l3: 'pillen' },
    { id: 'uv-index', theme: 'himmel', sim: 'uv', l2: 'kreis', l3: 'sonne' },
    { id: 'lichtintensitaet', theme: 'licht', sim: 'licht', l2: 'halbkreise', l3: 'sonnewolke' },
    { id: 'mondphase', theme: 'nacht', sim: 'mond', l2: 'scheiben', l3: 'mond' },
    { id: 'sonnenaufgang', theme: 'sonne', sim: 'sonne', l2: 'halbkreis', l3: 'sonne' }
  ],
  tiles: [
    { id: 'aussentemperatur', topic: 'temperatur', icon: 'sonne' },
    { id: 'innentemperatur', topic: 'temperatur', icon: 'haus' },
    { id: 'luftfeuchte-aussen', topic: 'luftfeuchte', icon: 'tropfen' },
    { id: 'luftfeuchte-innen', topic: 'luftfeuchte', icon: 'tropfen' },
    { id: 'taupunkt-aussen', topic: 'luftfeuchte', icon: 'nebel' },
    { id: 'taupunkt-innen', topic: 'luftfeuchte', icon: 'fenster' },
    { id: 'luftdruck', topic: 'luftdruck', icon: 'druck' },
    { id: 'niederschlag', topic: 'niederschlag', icon: 'regen' },
    { id: 'windrichtung', topic: 'wind', icon: 'kompass' },
    { id: 'windgeschwindigkeit', topic: 'wind', icon: 'wind' },
    { id: 'windboeen', topic: 'wind', icon: 'boee' },
    { id: 'windkuehle', topic: 'gefuehlt', icon: 'person' },
    { id: 'scheinbare-temperatur', topic: 'gefuehlt', icon: 'person' },
    { id: 'gefuehlte-temperatur', topic: 'gefuehlt', icon: 'person' },
    { id: 'uv-index', topic: 'uv-index', icon: 'sonne' },
    { id: 'lichtintensitaet', topic: 'lichtintensitaet', icon: 'licht' },
    { id: 'mondphase', topic: 'mondphase', icon: 'mond', live: 'moon' },
    { id: 'sonnenaufgang', topic: 'sonnenaufgang', icon: 'aufgang', live: 'rise' },
    { id: 'sonnenuntergang', topic: 'sonnenaufgang', icon: 'untergang', live: 'set' }
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
