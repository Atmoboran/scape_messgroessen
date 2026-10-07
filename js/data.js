"use strict";
/* =========================================================
   Inhalte: Messgrößen der Wetterstation vor dem SCAPE°
   Quelle: „Vertiefungsebene Wetterstation“ (Arbeitsfassung CMS),
   Gerät: BRESSER 7-in-1 LORA Profi-Wetterstation Terral, Art. 15013.
   Texte gekürzt; die Physik/Chemie-Spalte steckt vor allem in den Simulationen.
   ========================================================= */

/* Farbthemen nach CD: immer kräftige Töne mit Pastelltönen kombinieren */
const THEMES = {
  temp:     { f1: '#FFF487', f2: '#EE7518', f3: '#28348B', l2: '#62BA91', l3: '#F8E1E6', accent: '#EE7518', pale: '#FFF487', tile: '#FFF487' },
  feuchte:  { f1: '#CFE6CE', f2: '#007B73', f3: '#442683', l2: '#E09F00', l3: '#C5B8DB', accent: '#E09F00', pale: '#CFE6CE', tile: '#CFE6CE' },
  tau:      { f1: '#D4EDF8', f2: '#E09F00', f3: '#44ABCC', l2: '#C5B8DB', l3: '#FFE547', accent: '#44ABCC', pale: '#D4EDF8', tile: '#D4EDF8' },
  druck:    { f1: '#E0E5F5', f2: '#FFE547', f3: '#D0E8DC', l2: '#0097BE', l3: '#0097BE', accent: '#0097BE', pale: '#FFE547', tile: '#E0E5F5' },
  wind:     { f1: '#FDF6B7', f2: '#C5B8DB', f3: '#EE7518', l2: '#D4EDF8', l3: '#EE7518', accent: '#EE7518', pale: '#FDF6B7', tile: '#FDF6B7' },
  koerper:  { f1: '#F8E1E6', f2: '#EF887F', f3: '#D55117', l2: '#FFE547', l3: '#FFFFFF', accent: '#EF887F', pale: '#F8E1E6', tile: '#F8E1E6' },
  himmel:   { f1: '#D0E8DC', f2: '#0097BE', f3: '#FFF487', l2: '#EE7518', l3: '#FFFFFF', accent: '#44ABCC', pale: '#FFF487', tile: '#D0E8DC' }
};

/* Ebene 2: gefüllte Formen (klein, ganz sichtbar) – viewBox 0 0 100 100 */
const L2 = {
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
const L3 = {
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

const GROUPS = [
  { id: 'temp',    title: 'Temperatur' },
  { id: 'feuchte', title: 'Feuchte' },
  { id: 'druck',   title: 'Druck & Regen' },
  { id: 'wind',    title: 'Wind' },
  { id: 'koerper', title: 'Wie fühlt es sich an?' },
  { id: 'himmel',  title: 'Sonne & Mond' }
];

/* Beispielwerte fürs „Display“ – keine Live-Daten */
const VARS = [
  {
    id: 'aussentemperatur', group: 'temp', theme: 'temp', sim: 'temperatur', variant: 'aussen',
    name: 'Außentemperatur', unit: '°C', sample: '14,2', head: ['Außen–', 'temperatur'],
    l2: 'halbkreise', l3: 'sonne', icon: 'sonne',
    lead: 'Temperatur ist Bewegung: Je schneller sich die Luftteilchen im Mittel bewegen, desto wärmer ist die Luft.',
    messung: 'Ein Thermo-Hygrometer im 7-in-1-Außensensor misst unter einer Abschirmung. Der Sensor soll vor direkter Sonne geschützt, gut belüftet und mindestens 1,5 m von Gebäuden, Boden und Dächern entfernt sein.',
    einordnung: 'Der Sensor misst nur die Luft an seinem Standort, nicht die ganze Stadt. Eine DWD-Untersuchung in Offenbach: April bis September 2012/13 im Mittel 15,9 °C im Wetterpark, 17,3 °C in der Innenstadt.',
    hinweis: 'Temperatur ist eine lokale Größe. In der Sonne, an einer Hauswand oder über einem heißen Dach ist die Luft anders als an einem schattigen, gut belüfteten Platz. Der Messort ist Teil der Messung.'
  },
  {
    id: 'innentemperatur', group: 'temp', theme: 'temp', sim: 'temperatur', variant: 'innen',
    name: 'Innentemperatur', unit: '°C', sample: '21,4', head: ['Innen–', 'temperatur'],
    l2: 'scheiben', l3: 'kiesel', icon: 'haus',
    lead: 'Auch im Raum gilt: Temperatur ist Teilchenbewegung. Aber nicht überall im Raum bewegen sich die Teilchen gleich schnell.',
    messung: 'Die Basisstation misst am Ort, an dem sie steht. Sie sollte nicht direkt an Fenster, Heizung, Tür oder neben Menschen stehen. Nach einem Standortwechsel braucht die Messung etwa 30 Minuten, bis sie stabil ist.',
    einordnung: 'Als behaglich gelten etwa 18 bis 22 °C. Das Gerät misst von 0 bis 60 °C, laut Hersteller auf ±1 °C genau.',
    hinweis: 'Warme Luft steigt auf, kalte sinkt ab. Wände, Fenster, Heizkörper, Sonne und Geräte verändern die Luft in ihrer Nähe. Ein einzelner Sensor kann nie alle Stellen eines Raumes gleichzeitig beschreiben.'
  },
  {
    id: 'luftfeuchte-aussen', group: 'feuchte', theme: 'feuchte', sim: 'feuchte', variant: 'aussen',
    name: 'Luftfeuchtigkeit außen', unit: '%', sample: '72', head: ['Luft–', 'feuchte außen'],
    l2: 'tropfen', l3: 'wolke', icon: 'tropfen',
    lead: 'Wasserdampf ist Wasser als unsichtbares Gas. Die relative Luftfeuchtigkeit vergleicht, wie viel Wasserdampf in der Luft ist, mit dem, was bei dieser Temperatur höchstens möglich wäre.',
    messung: 'Der Außensensor misst die Luftfeuchtigkeit zusammen mit der Temperatur. Angezeigt wird die relative Feuchte von 10 bis 99 %, mit ±5 % Genauigkeit – garantiert zwischen 20 und 90 %.',
    einordnung: 'Beispiel des DWD: Luft mit 10 °C kann 100 % relative Feuchte haben. Wird sie auf 20 °C erwärmt, sinkt die relative Feuchte auf etwa die Hälfte – obwohl kein Wasserdampf verschwunden ist.',
    hinweis: 'Relativ ist nicht absolut: Die absolute Luftfeuchtigkeit sagt, wie viel Wasserdampf wirklich in einem Kubikmeter Luft steckt (in g/m³). Die relative Feuchte sagt, wie nahe die Luft an der Sättigung ist.'
  },
  {
    id: 'luftfeuchte-innen', group: 'feuchte', theme: 'feuchte', sim: 'feuchte', variant: 'innen',
    name: 'Luftfeuchtigkeit innen', unit: '%', sample: '48', head: ['Luft–', 'feuchte innen'],
    l2: 'blume', l3: 'tropfen2', icon: 'tropfen',
    lead: 'Warme Luft kann mehr Wasserdampf enthalten als kalte. Darum ändert sich die Prozentzahl schon, wenn man nur heizt oder lüftet.',
    messung: 'Die Basisstation misst Feuchte und Temperatur am Aufstellort. Bad, Küche, Fenster, Heizung oder viele Menschen in der Nähe verfälschen den Wert. Nach einem Standortwechsel braucht die Messung etwa 30 Minuten.',
    einordnung: 'Als behaglich gelten etwa 40 bis 60 % relative Luftfeuchtigkeit. Das Gerät misst 10 bis 99 % mit ±5 % Genauigkeit (garantiert zwischen 20 und 90 %).',
    hinweis: 'Über einem Luftbefeuchter, im Bad oder direkt am Fenster ist die Luft nicht typisch für den ganzen Raum. Auch bei der Feuchte entscheidet der Messort.'
  },
  {
    id: 'taupunkt-innen', group: 'feuchte', theme: 'tau', sim: 'taupunkt', variant: 'innen',
    name: 'Taupunkt innen', unit: '°C', sample: '10,0', head: ['Taupunkt', 'innen'],
    l2: 'kreis', l3: 'tropfen2', icon: 'fenster',
    lead: 'Der Taupunkt ist die Temperatur, auf die man Luft abkühlen müsste, bis sie gesättigt ist – also 100 % relative Feuchte hat. Wird es noch kälter, wird aus Wasserdampf flüssiges Wasser.',
    messung: 'Kein eigener Sensor: Die Station berechnet den Taupunkt aus Temperatur und relativer Luftfeuchtigkeit, die sie ohnehin misst.',
    einordnung: 'Bei 20 °C und 50 % relativer Feuchte liegt der Taupunkt bei ungefähr 9 °C. Bei 20 °C und 80 % schon bei ungefähr 16,5 °C – die Luft enthält dann deutlich mehr Wasserdampf.',
    hinweis: 'Ist eine Fensterscheibe kälter als der Taupunkt der Raumluft, bildet sich dort Kondenswasser. Weil der Taupunkt an der echten Wasserdampfmenge hängt, eignet er sich auch gut, um Schwüle einzuschätzen.'
  },
  {
    id: 'taupunkt-aussen', group: 'feuchte', theme: 'tau', sim: 'taupunkt', variant: 'aussen',
    name: 'Taupunkt außen', unit: '°C', sample: '9,2', head: ['Taupunkt', 'außen'],
    l2: 'bogen', l3: 'wolke', icon: 'nebel',
    lead: 'Kühlt Luft ab, bleibt der Wasserdampf gleich – aber die relative Feuchte steigt. Am Taupunkt ist die Luft gesättigt: Es bilden sich Tau und Nebel.',
    messung: 'Berechnet aus Außentemperatur und Außenluftfeuchtigkeit. Die Station kann in diesem Feld zwischen Taupunkt und scheinbarer Temperatur (AT) umschalten.',
    einordnung: 'Grobe Orientierung: Ab etwa 16 °C Taupunkt empfinden viele die Luft als deutlich feucht, bei 18 bis 21 °C als schwül bis sehr schwül. Wind, Sonne und Bewegung spielen beim Empfinden mit.',
    hinweis: 'Liegen Lufttemperatur und Taupunkt nah beieinander, ist die Luft fast gesättigt. Dann entstehen leicht Nebel oder Tau.'
  },
  {
    id: 'luftdruck', group: 'druck', theme: 'druck', sim: 'druck',
    name: 'Luftdruck', unit: 'hPa', sample: '1016', head: ['Luft–', 'druck'],
    l2: 'zickzack', l3: 'kreise', icon: 'druck',
    lead: 'Luftdruck entsteht durch unzählige Stöße von Luftteilchen. Je mehr Teilchen pro Sekunde auf eine Fläche prallen und je heftiger, desto höher ist der Druck.',
    messung: 'Die Station misst den absoluten Luftdruck am Standort und rechnet daraus den relativen Luftdruck auf Meereshöhe. Messbereich 300 bis 1.100 hPa, Genauigkeit ±3 hPa.',
    einordnung: '1013,2 hPa gelten als Standard-Luftdruck auf Meereshöhe. Beispiel aus der Anleitung: In 305 m Höhe zeigt die Station absolut 969 hPa, auf Meereshöhe umgerechnet 1016 hPa.',
    hinweis: '„Hoch“ und „Tief“ beziehen sich auf den relativen, auf Meereshöhe umgerechneten Druck: Über 1013,2 hPa spricht die Anleitung von Hochdruck, darunter von Tiefdruck. Erst die Umrechnung macht Orte in verschiedenen Höhen vergleichbar.'
  },
  {
    id: 'niederschlag', group: 'druck', theme: 'druck', sim: 'regen',
    name: 'Niederschlagsmenge', unit: 'mm', sample: '2,3', head: ['Nieder–', 'schlag'],
    l2: 'welle', l3: 'tropfen', icon: 'regen',
    lead: 'Niederschlag ist Wasser, das aus der Luft auf den Boden fällt. 1 Millimeter heißt: Auf jedem Quadratmeter liegt 1 Liter Wasser.',
    messung: 'Ein Trichter sammelt den Niederschlag und leitet ihn in eine kleine Wippe. Bei jeweils 0,254 mm kippt sie, die Elektronik zählt das Kippen. Regen, Schnee oder Hagel erkennt das Gerät nicht automatisch.',
    einordnung: 'Einmal Kippen = 0,254 mm = 254 Milliliter pro Quadratmeter. Die Station zeigt Mengen für eine Stunde, 24 Stunden, eine Woche, einen Monat und insgesamt.',
    hinweis: 'Ein Kipp-Regenmesser zählt Kippvorgänge, keine einzelnen Tropfen. Was bei Schnee und Eis im Trichter passiert, beschreibt die Anleitung nicht – eine automatische Schneemessung gibt es also nicht.'
  },
  {
    id: 'windrichtung', group: 'wind', theme: 'wind', sim: 'windrichtung',
    name: 'Windrichtung', unit: '°', sample: '248', sampleNote: 'WSW', head: ['Wind–', 'richtung'],
    l2: 'halbkreis', l3: 'stern4', icon: 'kompass',
    lead: 'Die Windrichtung ist immer die Richtung, aus der der Wind kommt. 0° ist Norden, 90° Osten, 180° Süden, 270° Westen.',
    messung: 'Eine Windfahne dreht sich in die Strömung, bis sie dem Wind möglichst wenig Widerstand bietet. Der Sensor muss beim Aufbau genau nach Norden ausgerichtet werden – sonst ist jede Messung um denselben Winkel falsch.',
    einordnung: 'Genauigkeit laut Anleitung: ±10°. Auf dem 16-teiligen Kompass liegen die Himmelsrichtungen jeweils 22,5° auseinander.',
    hinweis: 'Ein Nordwind kommt aus Norden und weht nach Süden. Ein Ostwind kommt aus Osten und weht nach Westen. Windrichtungen werden immer nach ihrer Herkunft benannt.'
  },
  {
    id: 'windgeschwindigkeit', group: 'wind', theme: 'wind', sim: 'wind', variant: 'mittel',
    name: 'Windgeschwindigkeit (Mittel)', unit: 'm/s', sample: '3,4', head: ['Wind–', 'geschwindigkeit'],
    l2: 'bogen', l3: 'pillen', icon: 'wind',
    lead: 'Wind ist bewegte Luft. 1 m/s heißt: Die Luft legt in einer Sekunde etwa 1 Meter zurück.',
    messung: 'Drei Windschalen drehen sich im Wind – je schneller, desto stärker der Wind. Neben dem aktuellen Wert zeigt die Station Mittelwerte über 2 oder 10 Minuten.',
    einordnung: '5 m/s = 18 km/h, 10 m/s = 36 km/h. Messbereich 0 bis 50 m/s, Auflösung 0,1 m/s.',
    hinweis: 'Wind schwankt ständig. Ein Mittelwert sagt darum oft mehr als ein einzelner Augenblick – wie bei einer unruhigen Autofahrt, bei der man auch nicht nur auf einen Sekundenbruchteil schaut.'
  },
  {
    id: 'windboeen', group: 'wind', theme: 'wind', sim: 'wind', variant: 'boeen',
    name: 'Windböen', unit: 'm/s', sample: '7,9', head: ['Wind–', 'böen'],
    l2: 'zickzack', l3: 'stern4', icon: 'boee',
    lead: 'Wind weht nie ganz gleichmäßig. Eine Böe ist ein kurzer Abschnitt, in dem die Luft deutlich schneller ist als kurz davor und danach.',
    messung: 'Böen sind die kurzen Spitzen in der Messung der Windschalen. Sie werden getrennt von den Mittelwerten betrachtet. Einen festen Zeitraum für eine Böe nennt die Anleitung nicht.',
    einordnung: '20 m/s = 72 km/h, 30 m/s = 108 km/h. Bei Gewittern und Stürmen liegen die Spitzen oft weit über dem Mittelwert.',
    hinweis: 'Bäume, Fahnen, Zelte und lose Gegenstände reagieren auf die kurze Spitzenbelastung – nicht nur auf den Mittelwert. Darum sind Böen für viele praktische Fragen besonders wichtig.'
  },
  {
    id: 'windkuehle', group: 'koerper', theme: 'koerper', sim: 'koerper', variant: 'windkuehle',
    name: 'Windkühle', unit: '°C', sample: '13,6', head: ['Wind–', 'kühle'],
    l2: 'halbkreise', l3: 'pillen', icon: 'person',
    lead: 'Um die Haut liegt eine dünne, warme Luftschicht. Wind pustet sie weg – der Körper verliert schneller Wärme, und es fühlt sich kälter an.',
    messung: 'Kein eigener Sensor: Die Windkühle wird aus Außentemperatur und Windgeschwindigkeit berechnet. Die Station nutzt sie vor allem bei Kälte.',
    einordnung: 'Unter 4,4 °C geht die Windkühle in die gefühlte Temperatur der Station ein. Zum Vergleich: 10 m/s Wind sind 36 km/h.',
    hinweis: 'Windkühle beschreibt, was Wind mit Menschen macht – nicht mit der Luft. Ein Thermometer zeigt bei Wind dieselbe Temperatur wie ohne.'
  },
  {
    id: 'scheinbare-temperatur', group: 'koerper', theme: 'koerper', sim: 'koerper', variant: 'at',
    name: 'Scheinbare Temperatur (AT)', unit: '°C', sample: '11,7', head: ['Scheinbare', 'Temperatur'],
    l2: 'kreis', l3: 'blume', icon: 'person',
    lead: 'Wie warm wir Luft empfinden, hängt nicht nur vom Thermometer ab: Wind trägt Wärme von der Haut weg, feuchte Luft bremst das Verdunsten von Schweiß.',
    messung: 'Die Station berechnet die scheinbare Temperatur (Apparent Temperature, AT) mit einer Formel aus Temperatur, Feuchte und Wind. Gewählt wurde die Variante für Orte im Schatten, die dem Wind ausgesetzt sind.',
    einordnung: 'Die AT ist nicht dasselbe wie die Windkühle. Die Anleitung unterscheidet auch ausdrücklich zwischen AT und der „gefühlten Temperatur“ der Station.',
    hinweis: 'Die AT ist ein Modell für das menschliche Empfinden, keine neue physikalische Temperatur. Die Luft hat nicht wirklich diese Temperatur.'
  },
  {
    id: 'gefuehlte-temperatur', group: 'koerper', theme: 'koerper', sim: 'koerper', variant: 'gefuehlt',
    name: 'Gefühlte Temperatur', unit: '°C', sample: '14,2', head: ['Gefühlte', 'Temperatur'],
    l2: 'blume', l3: 'sonne', icon: 'person',
    lead: 'Die gefühlte Temperatur beschreibt, wie stark das Wetter den Körper belastet – nicht, wie warm die Luft ist. Wind, Feuchte und Sonne spielen mit.',
    messung: 'Die Station kombiniert zwei Formeln: Unter 4,4 °C nutzt sie die Windkühle, über 26,7 °C den Hitzeindex. Dazwischen liegt der Wert nahe an der Lufttemperatur.',
    einordnung: 'Auch der DWD verwendet eine gefühlte Temperatur. Sie berücksichtigt neben der Lufttemperatur unter anderem Luftfeuchte, Wind und Strahlung.',
    hinweis: 'Zwei Orte mit gleicher Temperatur können sich ganz unterschiedlich warm oder kalt anfühlen. Die gefühlte Temperatur ist eine berechnete Vergleichsgröße – keine zweite Thermometermessung.'
  },
  {
    id: 'uv-index', group: 'himmel', theme: 'himmel', sim: 'uv',
    name: 'UV-Index', unit: '', sample: '3', head: ['UV–', 'Index'],
    l2: 'kreis', l3: 'sonne', icon: 'sonne',
    lead: 'Der UV-Index misst, wie stark die ultraviolette Strahlung ist, die Sonnenbrand macht. Er ist keine Temperatur und auch keine Helligkeit.',
    messung: 'Der Außensensor hat einen eigenen UV-Sensor. Angezeigt wird ein Wert ohne Einheit von 1 bis 15+, Genauigkeit ±1.',
    einordnung: 'Ab UV-Index 3 empfiehlt die WHO Sonnenschutz. In Süddeutschland liegen die sommerlichen Tageshöchstwerte laut DWD im Mittel um 7 bis 8 – tropische Werte sind deutlich höher.',
    hinweis: 'Die UV-Strahlung hängt von Sonnenstand, Ozon, Wolken und Staub in der Luft ab. An einem kühlen, klaren Tag kann der UV-Index höher sein als an einem heißen, bewölkten.'
  },
  {
    id: 'lichtintensitaet', group: 'himmel', theme: 'himmel', sim: 'licht',
    name: 'Lichtintensität', unit: 'kLux', sample: '18,5', head: ['Licht–', 'intensität'],
    l2: 'halbkreise', l3: 'sonnewolke', icon: 'licht',
    lead: 'Lux misst, wie viel für unser Auge sichtbares Licht auf eine Fläche fällt. W/m² misst dagegen die gesamte Strahlungsleistung – auch die, die wir nicht sehen.',
    messung: 'Der Außensensor hat einen eigenen Lichtsensor. Die Einheit lässt sich zwischen W/m², foot-candle und Lux umschalten. Messbereich: 0 bis 200 kLux.',
    einordnung: '1 kLux = 1.000 Lux. Der Messbereich reicht bis 200 kLux, also 200.000 Lux – so hell wird es draußen höchstens in praller Sonne.',
    hinweis: 'Steht auf dem Display kLux, heißt das „tausend Lux“ – also sichtbare Helligkeit. Steht dort W/m², geht es um Strahlungsleistung. Lux und W/m² lassen sich nicht einfach ineinander umrechnen.'
  },
  {
    id: 'mondphase', group: 'himmel', theme: 'himmel', sim: 'mond',
    name: 'Mondphase', unit: '', sample: '', head: ['Mond–', 'phase'],
    l2: 'scheiben', l3: 'mond', icon: 'mond',
    lead: 'Der Mond leuchtet nicht selbst, er wirft Sonnenlicht zurück. Je nachdem, wie Sonne, Erde und Mond stehen, sehen wir mehr oder weniger von seiner beleuchteten Seite.',
    messung: 'Gar nicht gemessen: Die Station berechnet die Mondphase aus dem Kalenderdatum – von Neumond über die Viertel bis zum Vollmond.',
    einordnung: 'Von einem Neumond zum nächsten vergehen im Mittel etwa 29,5 Tage – der synodische Monat. Die Mondphase ist ein regelmäßiger, vorhersagbarer Zyklus.',
    hinweis: 'Die Mondphase sagt nicht, wie viel Mondlicht wirklich am Messort ankommt. Dafür zählen auch die Höhe des Mondes, Wolken, Gebäude und andere Hindernisse.'
  }
];

const INTRO = {
  title: 'Warum messen wir Wetter?',
  text: [
    'Wetter lässt sich nur verstehen, vergleichen und vorhersagen, wenn man die Atmosphäre regelmäßig beobachtet. Temperatur, Feuchte, Luftdruck, Wind, Niederschlag und Strahlung werden an vielen Orten gemessen – daraus entsteht ein Bild des Wetters in Raum und Zeit.',
    'Jede Messung ist eine Momentaufnahme an einem Ort und in einer Höhe. Bodenstation, Flugzeug oder Radiosonde zeigen jeweils einen anderen Teil der Atmosphäre – das siehst du auch im DWD-Diorama hier im SCAPE°.'
  ]
};
