// Every visible text of the app. Edit or translate this file to adapt the
// exhibit; index.html only holds data-t="path.to.key" placeholders that
// js/texts.js fills from here, and the scripts look texts up with
// t('path.to.key'). Entries written as functions build a sentence around
// runtime values. Lines marked LOCAL refer to SCAPE°, its weather station or
// its region – search for "LOCAL" when adapting the app for another place.
// Source of the content: "Vertiefungsebene Wetterstation" (SCAPE°, working
// version for the CMS); device facts from the manual of the BRESSER 7-in-1
// LORA Profi-Wetterstation Terral (Art. 15013).
window.TEXTS = {
  lang: 'de',
  locale: 'de-DE',
  pageTitle: 'Messgrößen der Wetterstation',
  // LOCAL: the station stands outside the museum
  description: 'Vertiefung zur Wetterstation: Was misst die Station vor dem Museum? Alle Messgrößen mit kleinen interaktiven Simulationen.',

  // Texts of the shared kit (js/view.js, js/kit.js).
  kit: {
    viewToDesktop: 'Desktop-Ansicht',
    viewToMobile: 'Handy-Ansicht',
    viewToDesktopAria: 'Zur Desktop-Ansicht wechseln',
    viewToMobileAria: 'Zur Handy-Ansicht wechseln',
    fullscreenEnter: 'Vollbild',
    fullscreenExit: 'Vollbild beenden',
    infoAria: 'Erklärung anzeigen',
    merke: 'Merke',
    tasks: 'Aufgaben',
    merkeLocked: 'Löse die Aufgaben – dann erscheint hier, was du herausgefunden hast.',
    devLink: '(dev)'
  },

  nav: {
    aria: 'Hauptnavigation',
    display: 'Display',
    why: 'Warum messen?'
  },
  titles: {
    start: 'Messgrößen der Wetterstation',
    why: 'Warum messen wir Wetter? – Messgrößen',
    detail: name => name + ' – Messgrößen'
  },

  // ---- Start page: the display of the station ----
  start: {
    // LOCAL: the station stands outside the museum
    kicker: 'Vertiefung – Die Wetterstation vor dem Museum',
    headline: 'Was misst die Wetter–<br>station?',
    // LOCAL
    lead: 'Draußen vor dem Museum steht eine Wetterstation. Sie misst rund um die Uhr. Tippe auf einen Wert und finde heraus, was dahintersteckt.',
    displayTitle: 'Das Display der Wetterstation',
    displayNote: 'Die Zahlen sind Beispielwerte. Tippe auf ein Feld.',
    displayAria: 'Display der Wetterstation mit allen Messgrößen',
    tileAria: (name, value, topic) => name + (value ? ': ' + value : '') + ' – mehr zum Thema ' + topic
  },

  // ---- "Warum messen?" ----
  why: {
    kicker: 'Vertiefung – Die Wetterstation',
    headline: 'Warum messen wir Wetter?',
    lead: 'Wetter lässt sich nur verstehen, vergleichen und vorhersagen, wenn man die Atmosphäre regelmäßig beobachtet. Temperatur, Feuchte, Luftdruck, Wind, Niederschlag und Strahlung werden an vielen Orten gemessen – daraus entsteht ein Bild des Wetters in Raum und Zeit.',
    t1: '1 · Momentaufnahme',
    // LOCAL: DWD diorama in the SCAPE° exhibition
    p1: 'Jede Messung ist eine Momentaufnahme an einem Ort und in einer Höhe. Bodenstation, Flugzeug oder Radiosonde zeigen jeweils einen anderen Teil der Atmosphäre – das siehst du auch im DWD-Diorama hier im SCAPE°.',
    t2: '2 · Der Ort zählt',
    p2: 'Ein Sensor misst immer nur die Luft direkt um sich herum. Darum steht er im Schatten, gut belüftet und mit Abstand zu Wänden, Boden und Dächern – sonst misst er eher die Hauswand als das Wetter.',
    t3: '3 · Gemessen oder berechnet?',
    p3: 'Manche Werte misst die Station direkt (Temperatur, Feuchte, Druck, Wind, Regen, UV, Licht). Andere rechnet sie aus: Taupunkt, Windkühle, gefühlte und scheinbare Temperatur – und aus dem Datum die Mondphase sowie Sonnenauf- und -untergang.',
    toDisplay: 'Weiter zum Display →'
  },

  // ---- Page of one quantity ----
  detail: {
    kicker: (nr, total, unit) => 'Thema ' + nr + ' von ' + total + (unit ? ' · Einheit: ' + unit : ''),
    stripAria: 'Alle Themen',
    stageAria: 'Simulation',
    home: 'Display',
    prevAria: name => 'Zurück zu ' + name,
    nextAria: name => 'Weiter zu ' + name,
    topics: {
      messung: 'So misst die Station',
      einordnung: 'Zum Einordnen',
      hinweis: 'Gut zu wissen',
      model: 'Modell und Wirklichkeit'
    }
  },

  // ---- The 10 topics (one page and one simulation each) ----
  // name, unit, headline (on the desktop the parts marked "hy" are dropped so
  // the headline fits one line), lead, first hint (badge), Merke box, optional
  // tasks and the four collapsible topics.
  topics: {
    temperatur: {
      name: 'Temperatur', unit: '°C',
      head: 'Tempe<span class="hy">–</span><br class="hy">ratur',
      lead: 'Temperatur ist Bewegung: Je schneller sich die Luftteilchen im Mittel bewegen, desto wärmer ist die Luft.',
      badge: 'Schieb den Temperatur-Regler',
      merke: 'Ein Thermometer misst, wie schnell sich die Luftteilchen im Mittel bewegen. Es misst nur die Luft an seinem Platz – darum steht es im Schatten.',
      messung: 'Draußen misst ein Thermo-Hygrometer im 7-in-1-Außensensor unter einer Abschirmung – vor direkter Sonne geschützt, gut belüftet und mindestens 1,5 m von Gebäuden, Boden und Dächern entfernt. Drinnen misst die Basisstation an ihrem Aufstellort (0 bis 60 °C, ±1 °C).',
      // LOCAL: DWD study in Offenbach
      einordnung: 'Eine DWD-Untersuchung in Offenbach: April bis September 2012/13 im Mittel 15,9 °C im Wetterpark, 17,3 °C in der Innenstadt. Drinnen gelten etwa 18 bis 22 °C als behaglich.',
      hinweis: 'Temperatur ist eine lokale Größe. Sonne, Hauswände, Dächer, Heizung oder Fenster verändern die Luft schon auf wenigen Metern. Der Messort ist Teil der Messung – nach einem Standortwechsel braucht der Sensor etwa 30 Minuten, bis er stabil misst.',
      model: 'In Wirklichkeit sind Luftteilchen winzig und viel schneller – hier sind sie riesig und stark verlangsamt. Die Farbe zeigt, wie schnell ein Teilchen gerade ist: blau langsam, grau mittel, rot schnell.'
    },
    luftfeuchte: {
      name: 'Luftfeuchte', unit: '% · g/m³ · °C',
      head: 'Luft<span class="hy">–</span><br class="hy">feuchte',
      lead: 'Wasserdampf ist Wasser als unsichtbares Gas. Die relative Feuchte sagt, wie nahe die Luft an der Sättigung ist, die absolute Feuchte, wie viel Wasserdampf wirklich in einem Kubikmeter steckt – und der Taupunkt, bei welcher Temperatur die Luft gesättigt wäre.',
      badge: 'Ändere die Temperatur',
      merke: 'Warme Luft kann mehr Wasserdampf halten als kalte. Darum ändert sich die relative Feuchte schon, wenn sich nur die Temperatur ändert – die absolute bleibt gleich. Am Taupunkt ist die Luft gesättigt, darunter entstehen Tröpfchen.',
      tasks: {
        warm: 'Mach die Luft bei 10 °C gesättigt (100 %) und erwärme sie dann auf 20 °C. Wie viel Prozent sind es jetzt?',
        drops: 'Kühle die Luft unter den Taupunkt, so dass Tröpfchen (Nebel) entstehen.'
      },
      messung: 'Außensensor und Basisstation messen die relative Feuchte zusammen mit der Temperatur: 10 bis 99 %, ±5 % (garantiert zwischen 20 und 90 %). Der Taupunkt hat keinen eigenen Sensor – die Station berechnet ihn aus Temperatur und relativer Feuchte.',
      einordnung: 'DWD-Beispiel: Luft mit 10 °C und 100 % wird auf 20 °C erwärmt – die relative Feuchte sinkt auf etwa die Hälfte. Drinnen gelten 40 bis 60 % als behaglich. Bei 20 °C und 50 % liegt der Taupunkt bei etwa 9 °C; ab etwa 16 °C Taupunkt wirkt Luft deutlich feucht, bei 18 bis 21 °C schwül.',
      hinweis: 'Ist eine Fensterscheibe kälter als der Taupunkt der Raumluft, beschlägt sie. Liegen Lufttemperatur und Taupunkt draußen nah beieinander, entstehen leicht Nebel oder Tau.',
      model: 'Ein Punkt steht für eine kleine Menge Wasserdampf, nicht für ein einzelnes Teilchen. Höchstmenge und Taupunkt berechnet die Simulation mit der Magnus-Formel.'
    },
    luftdruck: {
      name: 'Luftdruck', unit: 'hPa',
      head: 'Luft<span class="hy">–</span><br class="hy">druck',
      lead: 'Luftdruck entsteht durch unzählige Stöße von Luftteilchen. Je mehr Teilchen pro Sekunde auf eine Fläche prallen und je heftiger, desto höher ist der Druck.',
      badge: 'Schieb den Regler „Teilchen“',
      merke: 'Luftdruck entsteht durch Stöße von Luftteilchen. Je höher du steigst, desto weniger Luft liegt über dir – der Druck sinkt.',
      tasks: {
        high: 'Mach den Druck in der Teilchen-Ansicht höher als 1100 hPa.',
        half: 'Lass den Ballon so hoch steigen, dass nur noch die Hälfte der Luft über ihm liegt.'
      },
      messung: 'Die Station misst den absoluten Luftdruck am Standort und rechnet daraus den relativen Luftdruck auf Meereshöhe. Messbereich 300 bis 1100 hPa, Genauigkeit ±3 hPa.',
      einordnung: '1013,2 hPa gelten als Standard-Luftdruck auf Meereshöhe. Beispiel aus der Anleitung: In 305 m Höhe zeigt die Station absolut 969 hPa, auf Meereshöhe umgerechnet 1016 hPa.',
      hinweis: '„Hoch“ und „Tief“ beziehen sich auf den relativen, auf Meereshöhe umgerechneten Druck: Über 1013,2 hPa spricht die Anleitung von Hochdruck, darunter von Tiefdruck. Erst die Umrechnung macht Orte in verschiedenen Höhen vergleichbar.',
      model: 'Die Unterschiede in der Teilchen-Ansicht sind stark übertrieben: Beim echten Wetter schwankt der Luftdruck nur um wenige Prozent. Die Höhen-Ansicht rechnet mit einer Normatmosphäre.'
    },
    niederschlag: {
      name: 'Niederschlag', unit: 'mm',
      head: 'Nieder<span class="hy">–</span><br class="hy">schlag',
      lead: 'Niederschlag ist Wasser, das aus der Luft auf den Boden fällt. 1 Millimeter heißt: Auf jedem Quadratmeter liegt 1 Liter Wasser.',
      badge: 'Schieb den Regler „Regenstärke“',
      merke: '1 mm Niederschlag heißt: 1 Liter Wasser auf jedem Quadratmeter. Die Station zählt, wie oft ihre kleine Wippe kippt.',
      tasks: {
        mm: 'Sammle mindestens 1 mm Regen. Wie oft hat die Wippe gekippt?'
      },
      messung: 'Ein Trichter sammelt den Niederschlag und leitet ihn in eine kleine Wippe. Bei jeweils 0,254 mm kippt sie, die Elektronik zählt das Kippen. Regen, Schnee oder Hagel erkennt das Gerät nicht automatisch.',
      einordnung: 'Einmal Kippen = 0,254 mm = 254 Milliliter pro Quadratmeter. Die Station zeigt Mengen für eine Stunde, 24 Stunden, eine Woche, einen Monat und insgesamt.',
      hinweis: 'Ein Kipp-Regenmesser zählt Kippvorgänge, keine einzelnen Tropfen. Was bei Schnee und Eis im Trichter passiert, beschreibt die Anleitung nicht – eine automatische Schneemessung gibt es also nicht.',
      model: 'Rechts siehst du, was die Menge bedeutet: Jeder Millimeter ist ein Liter Wasser auf einem Quadratmeter. Die Zeit läuft im Zeitraffer – eine Sekunde entspricht zwei Minuten.'
    },
    wind: {
      name: 'Wind', unit: '° · m/s',
      head: 'Wind',
      lead: 'Wind ist bewegte Luft. Die Station misst, woher er kommt, wie schnell er im Mittel weht und wie stark die kurzen Böen sind.',
      badge: 'Zieh am Kompass',
      merke: 'Die Windrichtung sagt, woher der Wind kommt: Ein Westwind kommt aus Westen. Wind schwankt ständig – der Mittelwert sagt, wie stark er im Schnitt weht, die Böen zeigen die kurzen Spitzen.',
      tasks: {
        west: 'Mach einen Westwind.',
        gust: 'Erzeuge eine Böe von mehr als 15 m/s (54 km/h).'
      },
      messung: 'Eine Windfahne dreht sich in die Strömung; der Sensor muss beim Aufbau genau nach Norden zeigen, sonst ist jede Richtung um denselben Winkel falsch. Drei Windschalen drehen sich umso schneller, je stärker der Wind ist. Die Station zeigt Mittelwerte über 2 oder 10 Minuten und die Böen als kurze Spitzen.',
      einordnung: '5 m/s = 18 km/h, 10 m/s = 36 km/h, 20 m/s = 72 km/h. Messbereich 0 bis 50 m/s. Die Richtung ist auf ±10° genau; auf dem 16-teiligen Kompass liegen die Himmelsrichtungen 22,5° auseinander.',
      hinweis: 'Windrichtungen werden nach ihrer Herkunft benannt: Ein Westwind kommt aus Westen und weht nach Osten. Bäume, Zelte und lose Gegenstände reagieren auf die kurzen Böen – nicht nur auf den Mittelwert.',
      model: 'Der Verlauf läuft im Zeitraffer: 10 Minuten passen in 30 Sekunden. Die Schwankungen des Windes sind Zufallszahlen, keine echten Messwerte. Echter Wind dreht auch in der Richtung ständig ein wenig hin und her.'
    },
    gefuehlt: {
      name: 'Wie fühlt es sich an?', unit: '°C',
      head: 'Wie fühlt es <br class="hy">sich an?',
      lead: 'Wie warm oder kalt uns das Wetter vorkommt, hängt nicht nur vom Thermometer ab: Wind trägt Wärme von der Haut weg, feuchte Luft bremst das Verdunsten von Schweiß.',
      badge: 'Schieb den Regler „Wind“',
      merke: 'Wind und feuchte Luft verändern, wie warm sich die Luft anfühlt. Windkühle, scheinbare und gefühlte Temperatur sind Rechenmodelle dafür – das Thermometer zeigt weiter dieselbe Temperatur.',
      tasks: {
        cold: 'Bring die gefühlte Temperatur in den Bereich „Windkühle“.',
        heat: 'Bring sie in den Bereich „Hitzeindex“.'
      },
      messung: 'Alle drei Werte sind berechnet: die Windkühle aus Temperatur und Wind, die scheinbare Temperatur (AT) aus Temperatur, Feuchte und Wind – in der Variante für Orte im Schatten, die dem Wind ausgesetzt sind. Die gefühlte Temperatur nutzt unter 4,4 °C die Windkühle, über 26,7 °C den Hitzeindex, dazwischen die Lufttemperatur.',
      einordnung: 'Auch der DWD verwendet eine gefühlte Temperatur; sie berücksichtigt zusätzlich die Strahlung. Windkühle, AT und gefühlte Temperatur sind verschiedene Modelle – darum können sie sich unterscheiden.',
      hinweis: 'Diese Zahlen beschreiben, wie Wetter auf Menschen wirkt – nicht, wie warm die Luft ist. Ein Thermometer zeigt bei Wind dieselbe Temperatur wie ohne.',
      model: 'Windkühle nach dem kanadischen und US-Wetterdienst, scheinbare Temperatur nach Steadman, Hitzeindex nach dem US-Wetterdienst. Sonne und Kleidung fehlen in diesen Rechnungen. Warme Luftschicht und Schweißtropfen sind stark vergrößert gezeichnet.'
    },
    'uv-index': {
      name: 'UV-Index', unit: '',
      head: 'UV-<br class="hy">Index',
      lead: 'Der UV-Index misst, wie stark die ultraviolette Strahlung ist, die Sonnenbrand macht. Er ist keine Temperatur und auch keine Helligkeit.',
      badge: 'Schieb den Regler „Sonnenhöhe“',
      merke: 'Der UV-Index hängt vom Sonnenstand ab, nicht von der Temperatur. Ab UV-Index 3 brauchst du Sonnenschutz.',
      tasks: {
        spring: 'Tippe auf den kühlen, klaren Frühlingstag.',
        summer: 'Tippe auf den heißen, bewölkten Sommertag. Wo ist der UV-Index höher?'
      },
      messung: 'Der Außensensor hat einen eigenen UV-Sensor. Angezeigt wird ein Wert ohne Einheit von 1 bis 15+, Genauigkeit ±1.',
      einordnung: 'Ab UV-Index 3 empfiehlt die WHO Sonnenschutz. In Süddeutschland liegen die sommerlichen Tageshöchstwerte laut DWD im Mittel um 7 bis 8 – tropische Werte sind deutlich höher.',
      hinweis: 'Die UV-Strahlung hängt von Sonnenstand, Ozon, Wolken und Staub in der Luft ab. An einem kühlen, klaren Tag kann der UV-Index höher sein als an einem heißen, bewölkten.',
      // LOCAL: sun heights in Offenbach
      model: 'Die Sonne steht im Sommer mittags in Offenbach etwa 63° hoch, im Winter nur etwa 17°. Die Atmosphäre ist im Bild viel dicker gezeichnet, als sie ist. Der UV-Index wird mit einer einfachen Näherung aus Sonnenhöhe, Ozon und Wolken berechnet.'
    },
    lichtintensitaet: {
      name: 'Lichtintensität', unit: 'kLux',
      head: 'Licht<span class="hy">–</span><br class="hy">intensität',
      lead: 'Lux misst, wie viel für unser Auge sichtbares Licht auf eine Fläche fällt. W/m² misst dagegen die gesamte Strahlungsleistung – auch die, die wir nicht sehen.',
      badge: 'Wähle eine Lichtquelle',
      merke: 'Lux zählt nur das Licht, das unser Auge sieht. Ein Wärmestrahler gibt viel Strahlung ab, aber kaum sichtbares Licht.',
      messung: 'Der Außensensor hat einen eigenen Lichtsensor. Die Einheit lässt sich zwischen W/m², foot-candle und Lux umschalten. Messbereich: 0 bis 200 kLux.',
      einordnung: '1 kLux = 1000 Lux. Der Messbereich reicht bis 200 kLux, also 200.000 Lux – so hell wird es draußen höchstens in praller Sonne.',
      hinweis: 'Steht auf dem Display kLux, heißt das „tausend Lux“ – also sichtbare Helligkeit. Steht dort W/m², geht es um Strahlungsleistung. Lux und W/m² lassen sich nicht einfach ineinander umrechnen.',
      model: 'Vergleich mal Sonne, LED und Wärmestrahler: Der Wärmestrahler liefert viel Leistung, aber kaum Lux. Die Spektren sind vereinfacht – Sonne und Wärmestrahler als ideale Wärmestrahler, die LED als zwei Glockenkurven.'
    },
    mondphase: {
      name: 'Mondphase', unit: '',
      head: 'Mond<span class="hy">–</span><br class="hy">phase',
      lead: 'Der Mond leuchtet nicht selbst, er wirft Sonnenlicht zurück. Je nachdem, wie Sonne, Erde und Mond stehen, sehen wir mehr oder weniger von seiner beleuchteten Seite.',
      badge: 'Zieh den Mond auf seiner Bahn',
      merke: 'Der Mond leuchtet nicht selbst. Je nachdem, wo er auf seiner Bahn steht, sehen wir mehr oder weniger von seiner beleuchteten Hälfte.',
      tasks: {
        full: 'Stell den Vollmond ein.',
        new: 'Stell den Neumond ein. Wo steht der Mond jetzt?'
      },
      messung: 'Gar nicht gemessen: Die Station berechnet die Mondphase aus dem Kalenderdatum – von Neumond über die Viertel bis zum Vollmond.',
      einordnung: 'Von einem Neumond zum nächsten vergehen im Mittel etwa 29,5 Tage – der synodische Monat. Die Mondphase ist ein regelmäßiger, vorhersagbarer Zyklus.',
      hinweis: 'Die Mondphase sagt nicht, wie viel Mondlicht wirklich am Messort ankommt. Dafür zählen auch die Höhe des Mondes, Wolken, Gebäude und andere Hindernisse.',
      model: 'Die Station rechnet die Phase einfach aus dem Datum aus. Abstände und Größen sind nicht maßstäblich: In Wirklichkeit ist der Mond etwa 30 Erddurchmesser von der Erde entfernt.'
    },
    sonnenaufgang: {
      name: 'Sonnenaufgang & -untergang', unit: 'Uhr',
      head: 'Sonnen<span class="hy">–</span><br class="hy">aufgang',
      lead: 'Die Erde dreht sich einmal am Tag um sich selbst – darum geht die Sonne auf und unter. Weil die Erdachse um 23,4° geneigt ist, steht die Sonne im Sommer höher und länger am Himmel als im Winter.',
      badge: 'Schieb das Datum durchs Jahr',
      merke: 'Im Sommer geht die Sonne früh im Nordosten auf, steht mittags hoch und geht spät im Nordwesten unter. Im Winter bleibt sie tief im Süden – der Tag ist kurz. Der Grund ist die schräge Erdachse.',
      tasks: {
        longest: 'Stell den längsten Tag des Jahres ein. Wie lang ist er?',
        early: 'Finde einen Tag, an dem die Sonne schon vor 17 Uhr untergeht.'
      },
      messung: 'Nicht gemessen, sondern berechnet: Aus Datum, Uhrzeit und dem Standort (geografische Breite und Länge) lässt sich genau ausrechnen, wann die Sonne über den Horizont steigt und wann sie wieder verschwindet.',
      // LOCAL: day lengths in Offenbach
      einordnung: 'In Offenbach (rund 50° Nord) dauert der längste Tag um den 21. Juni gut 16 Stunden, der kürzeste um den 21. Dezember nur rund 8 Stunden. Um den 21. März und den 23. September sind Tag und Nacht etwa gleich lang.',
      hinweis: 'Als Sonnenaufgang gilt der Moment, in dem der obere Rand der Sonne am Horizont auftaucht. Weil die Luft das Licht etwas bricht, sehen wir die Sonne schon, wenn sie eigentlich noch knapp unter dem Horizont steht. Berge und Häuser verschieben den Moment, in dem man sie wirklich sieht.',
      // LOCAL: computed for Offenbach
      model: 'Die Simulation rechnet für Offenbach (50,1° N, 8,8° O) mit Mitteleuropäischer Zeit und Sommerzeit. Die Himmelsrichtungen sind auseinandergezogen, damit die ganze Sonnenbahn ins Bild passt.'
    }
  },

  // ---- The fields of the station display (examples, not live data; moon
  // phase and sunrise/sunset are computed for today). Every field opens its
  // topic. name (tileName: with soft hyphens for the narrow tiles), unit, sample.
  tiles: {
    aussentemperatur: { name: 'Außentemperatur', tileName: 'Außen­temperatur', unit: '°C', sample: '14,2' },
    innentemperatur: { name: 'Innentemperatur', tileName: 'Innen­temperatur', unit: '°C', sample: '21,4' },
    'luftfeuchte-aussen': { name: 'Luftfeuchtigkeit außen', tileName: 'Luft­feuchtigkeit außen', unit: '%', sample: '72' },
    'luftfeuchte-innen': { name: 'Luftfeuchtigkeit innen', tileName: 'Luft­feuchtigkeit innen', unit: '%', sample: '48' },
    'taupunkt-aussen': { name: 'Taupunkt außen', unit: '°C', sample: '9,2' },
    'taupunkt-innen': { name: 'Taupunkt innen', unit: '°C', sample: '10,0' },
    luftdruck: { name: 'Luftdruck', unit: 'hPa', sample: '1016' },
    niederschlag: { name: 'Niederschlagsmenge', tileName: 'Niederschlags­menge', unit: 'mm', sample: '2,3' },
    windrichtung: { name: 'Windrichtung', tileName: 'Wind­richtung', unit: '°', sample: '248', sampleNote: 'WSW' },
    windgeschwindigkeit: { name: 'Windgeschwindigkeit (Mittel)', tileName: 'Wind­geschwindigkeit (Mittel)', unit: 'm/s', sample: '3,4' },
    windboeen: { name: 'Windböen', unit: 'm/s', sample: '7,9' },
    windkuehle: { name: 'Windkühle', unit: '°C', sample: '13,6' },
    'scheinbare-temperatur': { name: 'Scheinbare Temperatur (AT)', tileName: 'Scheinbare Temp. (AT)', unit: '°C', sample: '11,7' },
    'gefuehlte-temperatur': { name: 'Gefühlte Temperatur', unit: '°C', sample: '14,2' },
    'uv-index': { name: 'UV-Index', unit: '', sample: '3' },
    lichtintensitaet: { name: 'Lichtintensität', tileName: 'Licht­intensität', unit: 'kLux', sample: '18,5' },
    mondphase: { name: 'Mondphase', unit: '' },
    sonnenaufgang: { name: 'Sonnenaufgang', tileName: 'Sonnen­aufgang', unit: 'Uhr' },
    sonnenuntergang: { name: 'Sonnenuntergang', tileName: 'Sonnen­untergang', unit: 'Uhr' }
  },

  moon: {
    names: ['Neumond', 'Zunehmende Sichel', 'Erstes Viertel', 'Zunehmender Mond', 'Vollmond', 'Abnehmender Mond', 'Letztes Viertel', 'Abnehmende Sichel']
  },

  // ---- Texts inside and next to the simulations ----
  sims: {
    common: {
      slow: 'LANGSAM',
      fast: 'SCHNELL',
      thermometer: 'THERMO–\nMETER',
      degC: v => v + ' °C'
    },
    temperatur: {
      aria: 'Luftteilchen in einem Kasten, daneben ein Thermometer',
      slider: 'Temperatur',
      info: 'Temperatur ist ein Maß dafür, wie schnell sich die Teilchen im Mittel bewegen. Wird die Luft wärmer, bewegen sie sich schneller und stoßen heftiger zusammen; wird sie kälter, werden sie langsamer. Am absoluten Nullpunkt (−273,15 °C) stünden sie still. Ein Thermometer nimmt diese Bewegung auf: Die Teilchen stoßen an den Fühler und übertragen ihre Energie.',
      read: (tt, ms, kmh) => tt + ' °C · Echte Luftteilchen sind dabei im Mittel rund ' + ms + ' m/s schnell – etwa ' + kmh + ' km/h',
      hint: 'Schieb den Regler: Bei Wärme flitzen die Teilchen, bei Kälte werden sie träge. Ein Thermometer misst diese mittlere Bewegung.'
    },
    feuchte: {
      aria: 'Ein Kubikmeter Luft mit Wasserdampf und ein Gefäß, das die Höchstmenge zeigt; dazu relative und absolute Luftfeuchtigkeit und der Taupunkt',
      sliderT: 'Temperatur', sliderW: 'Wasserdampf',
      info: {
        t: 'Warme Luft kann mehr Wasserdampf aufnehmen als kalte: Wird die Luft wärmer, wächst das Gefäß (die Höchstmenge) – die relative Luftfeuchtigkeit sinkt, obwohl genauso viel Wasserdampf da ist wie vorher. Kühlt die Luft ab, schrumpft das Gefäß. Am Taupunkt ist es genau voll (100 %); wird es noch kälter, kondensiert der Überschuss zu Tröpfchen.',
        w: 'Hier änderst du, wie viel Wasserdampf in einem Kubikmeter Luft steckt – etwa durch Verdunstung, Kochen oder Duschen. Mehr Wasserdampf heißt: Die absolute und die relative Luftfeuchtigkeit steigen, und der Taupunkt liegt höher. Passt mehr hinein, als bei dieser Temperatur höchstens möglich ist, kondensiert der Überschuss zu Tröpfchen.'
      },
      air: '1 m³ LUFT',
      at: tt => 'BEI ' + tt + ' °C',
      vapour: 'WASSERDAMPF',
      rh: ['RELATIVE', 'LUFTFEUCHTIGKEIT'],
      abs: ['ABSOLUTE', 'LUFTFEUCHTIGKEIT'],
      dew: 'TAUPUNKT',
      droplets: 'TRÖPFCHEN (NEBEL)',
      condensing: ['JETZT KONDENSIERT', 'WASSERDAMPF!'],
      atMost: g => 'HÖCHSTENS ' + g + ' g',
      surplus: g => 'ÜBERSCHUSS + ' + g + ' g',
      fullAt: tt => 'VOLL BEI ' + tt + ' °C',
      read: (rh, abs, td, liq) => 'Relative Luftfeuchtigkeit ' + rh + ' % · absolute Luftfeuchtigkeit ' + abs + ' g/m³ · Taupunkt ' + td + ' °C' + (liq ? ' · ' + liq + ' g/m³ kondensiert' : ''),
      hint: 'Ändere nur die Temperatur: Die relative Luftfeuchtigkeit springt, die absolute bleibt gleich. Am Taupunkt ist das Gefäß genau voll – noch kälter, und es bilden sich Tröpfchen.'
    },
    druck: {
      aria: 'Luftdruck: Teilchen stoßen gegen eine Messfläche, oder: eine Landschaft mit Bergen, in der ein Ballon aufsteigt',
      modeParticles: 'Teilchen-Stöße', modeHeight: 'Druck und Höhe', modeAria: 'Ansicht',
      sliderN: 'Teilchenanzahl', unitN: v => v + ' Stück', sliderT: 'Temperatur', sliderH: 'Höhe',
      info: {
        n: 'Mehr Teilchen im gleichen Kasten heißt: höhere Dichte. Jedes Teilchen prallt immer wieder gegen die Wände. Doppelt so viele Teilchen ergeben doppelt so viele Stöße auf die Messfläche – und damit doppelten Druck.',
        t: 'Wärmere Teilchen sind schneller. Sie treffen öfter auf die Messfläche und prallen heftiger auf. Darum steigt der Druck, wenn die Luft im gleichen Kasten wärmer wird – obwohl kein Teilchen dazukommt.',
        h: 'Der Luftdruck am Boden entsteht durch das Gewicht der ganzen Luft darüber. Je höher der Ballon steigt, desto weniger Luft liegt über ihm – der Druck sinkt. Weil die Luft unten zusammengedrückt wird, ist sie dort am dichtesten: Schon in gut 5 km Höhe liegt nur noch die Hälfte der Luft über dir.'
      },
      mem1: 'MESS–', mem2: 'FLÄCHE',
      low: 'TIEF', high: 'HOCH',
      hits: ['STÖSSE PRO', 'SEKUNDE AUF', 'DIE FLÄCHE'],
      approx: p => '≈ ' + p + ' hPa',
      km: k => k + ' km',
      // LOCAL: Offenbach and the Großer Feldberg are the local reference heights
      peaks: {
        town: 'OFFENBACH, 100 m',
        feldberg: ['GR. FELDBERG', '880 m'],
        zugspitze: ['ZUGSPITZE', '2962 m'],
        everest: ['EVEREST', '8849 m'],
        plane: ['FLUGZEUG', 'ca. 11 km']
      },
      baro: 'AM BALLON',
      hpa: p => p + ' hPa',
      above: ['LUFT ÜBER', 'DEM BALLON'],
      ofAir: 'DER LUFT',
      seaLevel: ['AUF MEERES–', 'HÖHE UMGE–', 'RECHNET:', '1013 hPa'],
      readParticles: (n, tt, p) => n + ' Teilchen bei ' + tt + ' °C · Druck im Modell ≈ ' + p + ' hPa',
      readHeight: (h, p, pct) => 'In ' + h + ' m Höhe: ' + p + ' hPa · ' + pct + ' % der Luft liegt noch darüber',
      hintParticles: 'Mehr Teilchen oder schnellere (wärmere) Teilchen bedeuten mehr und heftigere Stöße auf die Messfläche – der Druck steigt.',
      hintHeight: 'Zieh den Ballon nach oben: Je höher er steigt, desto weniger Luft liegt über ihm – der Druck sinkt.'
    },
    regen: {
      aria: 'Kipp-Regenmesser mit Trichter und Wippe, daneben eine Fläche von einem Quadratmeter',
      slider: 'Regenstärke',
      btnDrizzle: 'Niesel 0,5', btnRain: 'Regen 4', btnHeavy: 'Starkregen 25', btnReset: 'Zähler auf null',
      funnel: 'TRICHTER', seesaw: 'WIPPE', tipped: 'GEKIPPT',
      times: n => n + ' ×',
      mm: 'mm', litre: 'Liter', floor: 'BODEN 1 m × 1 m',
      total: v => v + ' mm', perM2: v => '= ' + v + ' l / m²',
      read: (h, m, n, v) => 'Zeitraffer ' + h + ' h ' + m + ' min · ' + n + ' × gekippt × 0,254 mm = ' + v + ' mm = ' + v + ' Liter pro m²',
      hint: 'Der Trichter sammelt den Regen. Ist eine Seite der Wippe voll (0,254 mm), kippt sie und leert sich – die Station zählt mit.'
    },
    wind: {
      aria: 'Windfahne im Kompass und Schalenkreuz von oben, darunter der Verlauf der Windgeschwindigkeit – zieh am Kompass, um die Windrichtung zu ändern',
      slider: 'Mittlerer Wind',
      steady: 'Gleichmäßig', restless: 'Unruhig', gusty: 'Böig', gustAria: 'Böigkeit',
      btnGust: 'Böe!',
      presets: ['Nordwind', 'Ostwind', 'Südwind', 'Westwind'],
      dir16: ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'],
      dir16Long: ['Nord', 'Nordnordost', 'Nordost', 'Ostnordost', 'Ost', 'Ostsüdost', 'Südost', 'Südsüdost', 'Süd', 'Südsüdwest', 'Südwest', 'Westsüdwest', 'West', 'Westnordwest', 'Nordwest', 'Nordnordwest'],
      vane: 'WINDFAHNE', cups: 'WINDSCHALEN',
      direction: 'RICHTUNG', now: 'JETZT',
      ms: v => v + ' m/s', unit: 'm/s',
      ago: '−10 MIN',
      mean: 'MITTEL 2 MIN',
      gust: v => 'BÖE ' + v,
      read: (dirName, deg, avg, avgKmh, bft, mx, mxKmh) => dirName + 'wind aus ' + deg + '° · Mittel ' + avg + ' m/s = ' + avgKmh + ' km/h (' + bft + ' Bft) · stärkste Böe ' + mx + ' m/s = ' + mxKmh + ' km/h',
      hint: 'Zieh am Kompass: Dort, wo du hinziehst, kommt der Wind her – die Windfahne dreht ihre Spitze in den Wind. Unten siehst du, wie der Wind schwankt: Mittelwert (orange) und stärkste Böe (rot).'
    },
    koerper: {
      aria: 'Ein Mensch im Wind mit warmer Luftschicht um die Haut, daneben das Thermometer und drei berechnete Werte',
      sliderT: 'Lufttemperatur', sliderV: 'Wind', sliderRh: 'Luftfeuchte',
      presets: ['Eisiger Wind', 'Windiger Herbsttag', 'Milder Tag', 'Schwüle Hitze'],
      names: { air: 'LUFT', windChill: 'WIND–\nKÜHLE', apparent: 'AT', felt: 'GE–\nFÜHLT' },
      computed: 'BERECHNET',
      modes: { windChill: 'Windkühle', heatIndex: 'Hitzeindex', air: 'Lufttemperatur' },
      sweat: ['SCHWEISS VERDUN–', 'STET SCHLECHT'],
      layer: ['WARME', 'LUFTSCHICHT'],
      range: 'GEFÜHLT RECHNET MIT:',
      read: (tt, wc, at, fe, mode) => 'Luft ' + tt + ' °C · Windkühle ' + wc + ' °C · scheinbar (AT) ' + at + ' °C · gefühlt ' + fe + ' °C (' + mode + ')',
      hint: 'Wind bläst die warme Luftschicht (orange) von der Haut, feuchte Luft lässt Schweiß schlechter verdunsten. Das Thermometer ganz links bleibt dabei stehen.'
    },
    uv: {
      aria: 'Sonne, Ozonschicht, Wolken und UV-Strahlung, die am Boden ankommt',
      sliderSun: 'Sonnenhöhe', sliderCloud: 'Bewölkung',
      ozThin: 'Ozon dünn', ozNormal: 'normal', ozThick: 'dick', ozAria: 'Ozonschicht',
      presetSpring: 'Kühler, klarer Frühlingstag (15 °C)',
      presetSummer: 'Heißer, bewölkter Sommertag (31 °C)',
      ozone: 'OZONSCHICHT', atmosphere: 'ATMOSPHÄRE',
      index: 'UV-INDEX', atGround: 'UV AM BODEN', protect: 'SONNENSCHUTZ!',
      bands: ['NIEDRIG', 'MÄSSIG', 'HOCH', 'SEHR HOCH', 'EXTREM'],
      bandsLower: ['niedrig', 'mäßig', 'hoch', 'sehr hoch', 'extrem'],
      read: (v, band, protect) => 'UV-Index ' + v + ' – ' + band + (protect ? ' · ab 3 empfiehlt die WHO Sonnenschutz' : ''),
      hint: 'Je tiefer die Sonne steht, desto länger ist der Weg der Strahlung durch die Atmosphäre – mehr UV wird unterwegs geschluckt. Die Temperatur spielt dabei keine Rolle.'
    },
    licht: {
      aria: 'Lichtquelle, Fläche von einem Quadratmeter, Lux-Skala und Spektrum mit Empfindlichkeit des Auges',
      sources: { sonne: 'Sonne', led: 'LED-Lampe', heizer: 'Wärmestrahler' },
      sourceAria: 'Lichtquelle',
      slider: 'Strahlung',
      wm2: v => v + ' W/m²',
      presets: ['Vollmondnacht', 'Wohnzimmer', 'Bedeckter Tag', 'Pralle Sonne', 'Wärmestrahler'],
      m2: '1 m²',
      lux: 'LUX', over: 'ÜBER MAX.',
      klx: v => v + ' klx', lx: v => v + ' lx',
      scale: ['Mond 0,2 lx', 'Zimmer 300 lx', 'bedeckt 10 klx', 'Sonne 100 klx', 'max. 200 klx'],
      uv: 'UV', visible: 'SICHTBAR', ir: 'INFRAROT (WÄRME)',
      eye: 'AUGE', counts: 'ZÄHLT (LUX)',
      read: (name, w, lux, eff) => name + ': ' + w + ' W/m² Strahlung → ' + lux + ' Lux sichtbares Licht (≈ ' + eff + ' Lux pro W/m²)',
      hint: 'Lux zählt nur das Licht, das unser Auge sieht – gewichtet mit seiner Empfindlichkeit (gelbe Kurve). W/m² zählt die ganze Strahlungsleistung.'
    },
    mond: {
      aria: 'Mondbahn von oben und der Mond, wie wir ihn von der Erde sehen',
      slider: 'Tage seit Neumond',
      btnToday: 'Heute',
      btnPlay: ['Pause', 'Monat abspielen'],
      sunlight: 'SONNENLICHT', earth: 'ERDE', moon: 'MOND', topView: 'BLICK VON OBEN',
      asSeen: 'SO SEHEN WIR IHN',
      lit: p => p + ' % beleuchtet',
      newMoon: 'NEUMOND', fullMoon: 'VOLLMOND',
      read: (name, age, pct, left) => name + ' · ' + age + ' Tage nach Neumond · ' + pct + ' % der sichtbaren Seite beleuchtet · ' + left + ' Tage bis zum nächsten Neumond',
      hint: 'Zieh den Mond auf seiner Bahn um die Erde. Die Sonne scheint von links – rechts siehst du, wie viel von der beleuchteten Hälfte wir von der Erde aus sehen.'
    },
    sonne: {
      aria: 'Sonnenbahn über dem Horizont von Offenbach für ein wählbares Datum, darunter Sonnenaufgang, Sonnenuntergang und Tageslänge',
      sliderDate: 'Datum', sliderTime: 'Uhrzeit',
      btnPlay: ['Pause', 'Tag abspielen'],
      btnToday: 'Heute', btnMarch: '21. März', btnJune: '21. Juni', btnDec: '21. Dezember',
      clock: (hhmm, date) => hhmm + ' UHR · ' + date,
      time: hhmm => hhmm + ' Uhr',
      june: '21. JUNI', dec: '21. DEZ.',
      dirs: { 45: 'NO', 90: 'OST', 135: 'SO', 180: 'SÜD', 225: 'SW', 270: 'WEST', 315: 'NW' },
      rise: 'AUFGANG', set: 'UNTERGANG', length: 'TAGESLÄNGE',
      hm: (h, m) => h + ' h ' + m,
      read: (date, rise, set, summer, noon, now) => date + ': Aufgang ' + rise + ' Uhr, Untergang ' + set + ' Uhr (' + (summer ? 'Sommerzeit' : 'Winterzeit') + ') · mittags ' + noon + '° hoch · jetzt ' + now + '°',
      hint: 'Schieb das Datum durchs Jahr: Im Sommer steht die Sonne mittags hoch und der Tag ist lang, im Winter bleibt sie tief im Süden. Gestrichelt: die Bahn am längsten und am kürzesten Tag.'
    }
  },

  foot: {
    // LOCAL: the station of SCAPE° and the source of the texts
    sources: 'Gerätedaten: Bedienungsanleitung der BRESSER 7-in-1 LORA Profi-Wetterstation Terral (Art. 15013). Vergleichswerte: Deutscher Wetterdienst (DWD), Weltgesundheitsorganisation (WHO, UV-Index). Die Werte auf dem Display sind Beispielwerte, keine Live-Daten.'
  }
};
