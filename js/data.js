// Structure of the app: the groups of the station display and the 17
// quantities in their order. Texts (names, units, sample values, leads …)
// live in content/texts.de.js under quantities.<id>; colours in
// THEME.messgroessen (theme/theme.js).
//   group    group on the display (texts: groups.<group>)
//   theme    colour combination (THEME.messgroessen.groups.<theme>)
//   sim      simulation (js/sims/<sim>.js), variant passed to it
//   l2, l3   shape and outline of the poster header, icon on the tile
window.MG = window.MG || {};
window.MG.data = {
  groups: ['temp', 'feuchte', 'druck', 'wind', 'koerper', 'himmel'],
  vars: [
    { id: 'aussentemperatur', group: 'temp', theme: 'temp', sim: 'temperatur', variant: 'aussen', l2: 'halbkreise', l3: 'sonne', icon: 'sonne' },
    { id: 'innentemperatur', group: 'temp', theme: 'temp', sim: 'temperatur', variant: 'innen', l2: 'scheiben', l3: 'kiesel', icon: 'haus' },
    { id: 'luftfeuchte-aussen', group: 'feuchte', theme: 'feuchte', sim: 'feuchte', variant: 'aussen', l2: 'tropfen', l3: 'wolke', icon: 'tropfen' },
    { id: 'luftfeuchte-innen', group: 'feuchte', theme: 'feuchte', sim: 'feuchte', variant: 'innen', l2: 'blume', l3: 'tropfen2', icon: 'tropfen' },
    { id: 'taupunkt-innen', group: 'feuchte', theme: 'tau', sim: 'taupunkt', variant: 'innen', l2: 'kreis', l3: 'tropfen2', icon: 'fenster' },
    { id: 'taupunkt-aussen', group: 'feuchte', theme: 'tau', sim: 'taupunkt', variant: 'aussen', l2: 'bogen', l3: 'wolke', icon: 'nebel' },
    { id: 'luftdruck', group: 'druck', theme: 'druck', sim: 'druck', l2: 'zickzack', l3: 'kreise', icon: 'druck' },
    { id: 'niederschlag', group: 'druck', theme: 'druck', sim: 'regen', l2: 'welle', l3: 'tropfen', icon: 'regen' },
    { id: 'windrichtung', group: 'wind', theme: 'wind', sim: 'windrichtung', l2: 'halbkreis', l3: 'stern4', icon: 'kompass' },
    { id: 'windgeschwindigkeit', group: 'wind', theme: 'wind', sim: 'wind', variant: 'mittel', l2: 'bogen', l3: 'pillen', icon: 'wind' },
    { id: 'windboeen', group: 'wind', theme: 'wind', sim: 'wind', variant: 'boeen', l2: 'zickzack', l3: 'stern4', icon: 'boee' },
    { id: 'windkuehle', group: 'koerper', theme: 'koerper', sim: 'koerper', variant: 'windkuehle', l2: 'halbkreise', l3: 'pillen', icon: 'person' },
    { id: 'scheinbare-temperatur', group: 'koerper', theme: 'koerper', sim: 'koerper', variant: 'at', l2: 'kreis', l3: 'blume', icon: 'person' },
    { id: 'gefuehlte-temperatur', group: 'koerper', theme: 'koerper', sim: 'koerper', variant: 'gefuehlt', l2: 'blume', l3: 'sonne', icon: 'person' },
    { id: 'uv-index', group: 'himmel', theme: 'himmel', sim: 'uv', l2: 'kreis', l3: 'sonne', icon: 'sonne' },
    { id: 'lichtintensitaet', group: 'himmel', theme: 'himmel', sim: 'licht', l2: 'halbkreise', l3: 'sonnewolke', icon: 'licht' },
    { id: 'mondphase', group: 'himmel', theme: 'himmel', sim: 'mond', l2: 'scheiben', l3: 'mond', icon: 'mond' }
  ]
};
