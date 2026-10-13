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
    tileAria: (name, value) => name + (value ? ': ' + value : '') + ' – mehr erfahren'
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
    p3: 'Manche Werte misst die Station direkt (Temperatur, Feuchte, Druck, Wind, Regen, UV, Licht). Andere rechnet sie aus: Taupunkt, Windkühle, gefühlte und scheinbare Temperatur – und die Mondphase aus dem Datum.',
    toDisplay: 'Weiter zum Display →'
  },

  // ---- Page of one quantity ----
  detail: {
    kicker: (nr, total, unit) => 'Messgröße ' + nr + ' von ' + total + (unit ? ' · Einheit: ' + unit : ''),
    stripAria: 'Alle Messgrößen',
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

  groups: {
    temp: 'Temperatur',
    feuchte: 'Feuchte',
    druck: 'Druck & Regen',
    wind: 'Wind',
    koerper: 'Wie fühlt es sich an?',
    himmel: 'Sonne & Mond'
  },

  // ---- The 17 quantities ----
  // name (tileName: with soft hyphens for the narrow display tiles), unit, sample value on the display (examples, not live data),
  // headline (on the desktop the parts marked "hy" are dropped so the
  // headline fits one line), lead, first hint (badge), Merke box, optional
  // tasks and the four collapsible topics.
  quantities: {
    aussentemperatur: {
      name: 'Außentemperatur', unit: '°C', sample: '14,2',
      head: 'Außen<span class="hy">–</span><br class="hy">temperatur',
      lead: 'Temperatur ist Bewegung: Je schneller sich die Luftteilchen im Mittel bewegen, desto wärmer ist die Luft.',
      badge: 'Schieb den Temperatur-Regler',
      merke: 'Ein Thermometer misst, wie schnell sich die Luftteilchen im Mittel bewegen. Es misst nur die Luft an seinem Platz – darum steht es im Schatten.',
      messung: 'Ein Thermo-Hygrometer im 7-in-1-Außensensor misst unter einer Abschirmung. Der Sensor soll vor direkter Sonne geschützt, gut belüftet und mindestens 1,5 m von Gebäuden, Boden und Dächern entfernt sein.',
      // LOCAL: DWD study in Offenbach
      einordnung: 'Der Sensor misst nur die Luft an seinem Standort, nicht die ganze Stadt. Eine DWD-Untersuchung in Offenbach: April bis September 2012/13 im Mittel 15,9 °C im Wetterpark, 17,3 °C in der Innenstadt.',
      hinweis: 'Temperatur ist eine lokale Größe. In der Sonne, an einer Hauswand oder über einem heißen Dach ist die Luft anders als an einem schattigen, gut belüfteten Platz. Der Messort ist Teil der Messung.',
      model: 'In Wirklichkeit sind Luftteilchen winzig und viel schneller – hier sind sie riesig und stark verlangsamt. Die Farbe zeigt, wie schnell ein Teilchen gerade ist: blau langsam, grau mittel, rot schnell.'
    },
    innentemperatur: {
      name: 'Innentemperatur', unit: '°C', sample: '21,4',
      head: 'Innen<span class="hy">–</span><br class="hy">temperatur',
      lead: 'Auch im Raum gilt: Temperatur ist Teilchenbewegung. Aber nicht überall im Raum bewegen sich die Teilchen gleich schnell.',
      badge: 'Zieh den Sensor durch den Raum',
      merke: 'Im Raum ist es nicht überall gleich warm: an der Heizung wärmer, am Fenster kälter. Ein Sensor misst nur die Luft an seinem Platz.',
      messung: 'Die Basisstation misst am Ort, an dem sie steht. Sie sollte nicht direkt an Fenster, Heizung, Tür oder neben Menschen stehen. Nach einem Standortwechsel braucht die Messung etwa 30 Minuten, bis sie stabil ist.',
      einordnung: 'Als behaglich gelten etwa 18 bis 22 °C. Das Gerät misst von 0 bis 60 °C, laut Hersteller auf ±1 °C genau.',
      hinweis: 'Warme Luft steigt auf, kalte sinkt ab. Wände, Fenster, Heizkörper, Sonne und Geräte verändern die Luft in ihrer Nähe. Ein einzelner Sensor kann nie alle Stellen eines Raumes gleichzeitig beschreiben.',
      model: 'Dass warme Teilchen aufsteigen und kalte absinken, ist hier stark vereinfacht. Echte Luftteilchen sind winzig und viel schneller; die Farbe zeigt ihre Geschwindigkeit: blau langsam, rot schnell.'
    },
    'luftfeuchte-aussen': {
      name: 'Luftfeuchtigkeit außen', unit: '%', sample: '72',
      head: 'Luft<span class="hy">–</span><br class="hy">feuchte außen',
      lead: 'Wasserdampf ist Wasser als unsichtbares Gas. Die relative Luftfeuchtigkeit vergleicht, wie viel Wasserdampf in der Luft ist, mit dem, was bei dieser Temperatur höchstens möglich wäre.',
      badge: 'Ändere die Temperatur',
      merke: 'Warme Luft kann mehr Wasserdampf halten als kalte. Darum ändert sich die Prozentzahl schon, wenn sich nur die Temperatur ändert. Bei 100 % entstehen Tröpfchen.',
      tasks: {
        warm: 'Tippe auf das DWD-Beispiel und erwärme die Luft dann auf 20 °C. Wie viel Prozent sind es jetzt?',
        drops: 'Kühle die Luft so weit ab, dass Tröpfchen (Nebel) entstehen.'
      },
      messung: 'Der Außensensor misst die Luftfeuchtigkeit zusammen mit der Temperatur. Angezeigt wird die relative Feuchte von 10 bis 99 %, mit ±5 % Genauigkeit – garantiert zwischen 20 und 90 %.',
      einordnung: 'Beispiel des DWD: Luft mit 10 °C kann 100 % relative Feuchte haben. Wird sie auf 20 °C erwärmt, sinkt die relative Feuchte auf etwa die Hälfte – obwohl kein Wasserdampf verschwunden ist.',
      hinweis: 'Relativ ist nicht absolut: Die absolute Luftfeuchtigkeit sagt, wie viel Wasserdampf wirklich in einem Kubikmeter Luft steckt (in g/m³). Die relative Feuchte sagt, wie nahe die Luft an der Sättigung ist.',
      model: 'Ein Punkt steht für eine kleine Menge Wasserdampf, nicht für ein einzelnes Teilchen. Die Höchstmenge je Temperatur berechnet die Simulation mit der Magnus-Formel.'
    },
    'luftfeuchte-innen': {
      name: 'Luftfeuchtigkeit innen', unit: '%', sample: '48',
      head: 'Luft<span class="hy">–</span><br class="hy">feuchte innen',
      lead: 'Warme Luft kann mehr Wasserdampf enthalten als kalte. Darum ändert sich die Prozentzahl schon, wenn man nur heizt oder lüftet.',
      badge: 'Probier Kochen, Heizen und Lüften',
      merke: 'Heizen senkt die Prozentzahl, obwohl kein Wasser verschwindet. Kochen und Duschen bringen Wasserdampf in die Luft, Lüften im Winter bringt ihn hinaus.',
      messung: 'Die Basisstation misst Feuchte und Temperatur am Aufstellort. Bad, Küche, Fenster, Heizung oder viele Menschen in der Nähe verfälschen den Wert. Nach einem Standortwechsel braucht die Messung etwa 30 Minuten.',
      einordnung: 'Als behaglich gelten etwa 40 bis 60 % relative Luftfeuchtigkeit. Das Gerät misst 10 bis 99 % mit ±5 % Genauigkeit (garantiert zwischen 20 und 90 %).',
      hinweis: 'Über einem Luftbefeuchter, im Bad oder direkt am Fenster ist die Luft nicht typisch für den ganzen Raum. Auch bei der Feuchte entscheidet der Messort.',
      model: 'Ein Punkt steht für eine kleine Menge Wasserdampf. Kochen, Heizen und Lüften ändern die Werte hier in festen Schritten – in einem echten Raum geht das nach und nach.'
    },
    'taupunkt-innen': {
      name: 'Taupunkt innen', unit: '°C', sample: '10,0',
      head: 'Taupunkt <br class="hy">innen',
      lead: 'Der Taupunkt ist die Temperatur, auf die man Luft abkühlen müsste, bis sie gesättigt ist – also 100 % relative Feuchte hat. Wird es noch kälter, wird aus Wasserdampf flüssiges Wasser.',
      badge: 'Mach es draußen kälter',
      merke: 'Ist die Scheibe kälter als der Taupunkt der Raumluft, beschlägt sie. Feuchte Luft hat einen höheren Taupunkt – dann beschlägt die Scheibe schneller.',
      tasks: {
        fog: 'Bring die Scheibe zum Beschlagen.',
        dry: 'Mach sie wieder klar – ohne es draußen wärmer zu machen.'
      },
      messung: 'Kein eigener Sensor: Die Station berechnet den Taupunkt aus Temperatur und relativer Luftfeuchtigkeit, die sie ohnehin misst.',
      einordnung: 'Bei 20 °C und 50 % relativer Feuchte liegt der Taupunkt bei ungefähr 9 °C. Bei 20 °C und 80 % schon bei ungefähr 16,5 °C – die Luft enthält dann deutlich mehr Wasserdampf.',
      hinweis: 'Ist eine Fensterscheibe kälter als der Taupunkt der Raumluft, bildet sich dort Kondenswasser. Weil der Taupunkt an der echten Wasserdampfmenge hängt, eignet er sich auch gut, um Schwüle einzuschätzen.',
      model: 'Die Temperatur der Scheibe ist hier grob geschätzt: Sie liegt zwischen Raum- und Außentemperatur, bei Doppelglas näher an der Raumluft. Der Taupunkt wird mit der Magnus-Formel berechnet.'
    },
    'taupunkt-aussen': {
      name: 'Taupunkt außen', unit: '°C', sample: '9,2',
      head: 'Taupunkt <br class="hy">außen',
      lead: 'Kühlt Luft ab, bleibt der Wasserdampf gleich – aber die relative Feuchte steigt. Am Taupunkt ist die Luft gesättigt: Es bilden sich Tau und Nebel.',
      badge: 'Tippe auf „Nacht starten“',
      merke: 'Nachts kühlt die Luft ab, der Taupunkt bleibt fast gleich. Wird das Gras so kalt wie der Taupunkt, bildet sich Tau. Wird die Luft so kalt, entsteht Nebel.',
      tasks: {
        dew: 'Starte die Nacht und warte, bis Tau auf dem Gras liegt.',
        fog: 'Finde Werte, bei denen in der Nacht Nebel entsteht.'
      },
      messung: 'Berechnet aus Außentemperatur und Außenluftfeuchtigkeit. Die Station kann in diesem Feld zwischen Taupunkt und scheinbarer Temperatur (AT) umschalten.',
      einordnung: 'Grobe Orientierung: Ab etwa 16 °C Taupunkt empfinden viele die Luft als deutlich feucht, bei 18 bis 21 °C als schwül bis sehr schwül. Wind, Sonne und Bewegung spielen beim Empfinden mit.',
      hinweis: 'Liegen Lufttemperatur und Taupunkt nah beieinander, ist die Luft fast gesättigt. Dann entstehen leicht Nebel oder Tau.',
      model: 'Erreicht auch die Luft den Taupunkt, entsteht Nebel. Das Abkühlen ist vereinfacht: Die Luft kühlt in der Nacht um höchstens 9 °C ab, das Gras 2,5 °C mehr. Wolken und Wind, die das Abkühlen bremsen, fehlen.'
    },
    luftdruck: {
      name: 'Luftdruck', unit: 'hPa', sample: '1016',
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
      model: 'Die Unterschiede in der Teilchen-Ansicht sind stark übertrieben: Beim echten Wetter schwankt der Luftdruck nur um wenige Prozent. Die Höhen-Ansicht rechnet mit einer Normatmosphäre. Die Station rechnet ihren Messwert auf Meereshöhe um – so lassen sich Orte in verschiedenen Höhen vergleichen.'
    },
    niederschlag: {
      name: 'Niederschlagsmenge', tileName: 'Niederschlags\u00ADmenge', unit: 'mm', sample: '2,3',
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
    windrichtung: {
      name: 'Windrichtung', unit: '°', sample: '248', sampleNote: 'WSW',
      head: 'Wind<span class="hy">–</span><br class="hy">richtung',
      lead: 'Die Windrichtung ist immer die Richtung, aus der der Wind kommt. 0° ist Norden, 90° Osten, 180° Süden, 270° Westen.',
      badge: 'Zieh um den Kompass',
      merke: 'Die Windrichtung sagt, woher der Wind kommt. Ein Westwind kommt aus Westen und weht nach Osten.',
      tasks: {
        west: 'Mach einen Westwind.',
        offset: 'Verdreh den Sensor. Was zeigt die Anzeige jetzt?'
      },
      messung: 'Eine Windfahne dreht sich in die Strömung, bis sie dem Wind möglichst wenig Widerstand bietet. Der Sensor muss beim Aufbau genau nach Norden ausgerichtet werden – sonst ist jede Messung um denselben Winkel falsch.',
      einordnung: 'Genauigkeit laut Anleitung: ±10°. Auf dem 16-teiligen Kompass liegen die Himmelsrichtungen jeweils 22,5° auseinander.',
      hinweis: 'Ein Nordwind kommt aus Norden und weht nach Süden. Ein Ostwind kommt aus Osten und weht nach Westen. Windrichtungen werden immer nach ihrer Herkunft benannt.',
      model: 'Probier auch aus, was passiert, wenn der Sensor beim Aufbau verdreht wurde: Dann zeigt die Station jede Richtung um denselben Winkel falsch an. Echter Wind dreht ständig ein wenig hin und her – hier weht er gleichmäßig aus einer Richtung.'
    },
    windgeschwindigkeit: {
      name: 'Windgeschwindigkeit (Mittel)', tileName: 'Wind\u00ADgeschwindigkeit (Mittel)', unit: 'm/s', sample: '3,4',
      head: 'Wind<span class="hy">–</span><br class="hy">geschwindigkeit',
      lead: 'Wind ist bewegte Luft. 1 m/s heißt: Die Luft legt in einer Sekunde etwa 1 Meter zurück.',
      badge: 'Schieb den Regler „Mittlerer Wind“',
      merke: 'Wind schwankt ständig. Darum zeigt die Station einen Mittelwert über einige Minuten – der sagt mehr als ein einzelner Augenblick.',
      messung: 'Drei Windschalen drehen sich im Wind – je schneller, desto stärker der Wind. Neben dem aktuellen Wert zeigt die Station Mittelwerte über 2 oder 10 Minuten.',
      einordnung: '5 m/s = 18 km/h, 10 m/s = 36 km/h. Messbereich 0 bis 50 m/s, Auflösung 0,1 m/s.',
      hinweis: 'Wind schwankt ständig. Ein Mittelwert sagt darum oft mehr als ein einzelner Augenblick – wie bei einer unruhigen Autofahrt, bei der man auch nicht nur auf einen Sekundenbruchteil schaut.',
      model: 'Der Verlauf läuft im Zeitraffer: 10 Minuten passen in 30 Sekunden. Die Schwankungen des Windes sind Zufallszahlen, keine echten Messwerte.'
    },
    windboeen: {
      name: 'Windböen', unit: 'm/s', sample: '7,9',
      head: 'Wind<span class="hy">–</span><br class="hy">böen',
      lead: 'Wind weht nie ganz gleichmäßig. Eine Böe ist ein kurzer Abschnitt, in dem die Luft deutlich schneller ist als kurz davor und danach.',
      badge: 'Tippe auf „Böe!“',
      merke: 'Eine Böe ist ein kurzer, starker Windstoß. Bäume, Zelte und Fahnen spüren die Böen – nicht nur den Mittelwert.',
      messung: 'Böen sind die kurzen Spitzen in der Messung der Windschalen. Sie werden getrennt von den Mittelwerten betrachtet. Einen festen Zeitraum für eine Böe nennt die Anleitung nicht.',
      einordnung: '20 m/s = 72 km/h, 30 m/s = 108 km/h. Bei Gewittern und Stürmen liegen die Spitzen oft weit über dem Mittelwert.',
      hinweis: 'Bäume, Fahnen, Zelte und lose Gegenstände reagieren auf die kurze Spitzenbelastung – nicht nur auf den Mittelwert. Darum sind Böen für viele praktische Fragen besonders wichtig.',
      model: 'Im Verlauf unten markiert der rote Punkt die stärkste Böe der letzten 10 Minuten. Der Verlauf läuft im Zeitraffer, die Schwankungen sind Zufallszahlen.'
    },
    windkuehle: {
      name: 'Windkühle', unit: '°C', sample: '13,6',
      head: 'Wind<span class="hy">–</span><br class="hy">kühle',
      lead: 'Um die Haut liegt eine dünne, warme Luftschicht. Wind pustet sie weg – der Körper verliert schneller Wärme, und es fühlt sich kälter an.',
      badge: 'Schieb den Regler „Wind“',
      merke: 'Wind bläst die warme Luftschicht von der Haut. Darum fühlt es sich kälter an – das Thermometer zeigt aber dieselbe Temperatur.',
      messung: 'Kein eigener Sensor: Die Windkühle wird aus Außentemperatur und Windgeschwindigkeit berechnet. Die Station nutzt sie vor allem bei Kälte.',
      einordnung: 'Unter 4,4 °C geht die Windkühle in die gefühlte Temperatur der Station ein. Zum Vergleich: 10 m/s Wind sind 36 km/h.',
      hinweis: 'Windkühle beschreibt, was Wind mit Menschen macht – nicht mit der Luft. Ein Thermometer zeigt bei Wind dieselbe Temperatur wie ohne.',
      model: 'Die Windkühle wird mit der Formel des kanadischen und des US-amerikanischen Wetterdienstes berechnet. Die warme Luftschicht um die Haut ist stark vergrößert gezeichnet.'
    },
    'scheinbare-temperatur': {
      name: 'Scheinbare Temperatur (AT)', unit: '°C', sample: '11,7',
      head: 'Scheinbare <br class="hy">Temperatur',
      lead: 'Wie warm wir Luft empfinden, hängt nicht nur vom Thermometer ab: Wind trägt Wärme von der Haut weg, feuchte Luft bremst das Verdunsten von Schweiß.',
      badge: 'Spiel mit Wind und Feuchte',
      merke: 'Wind und feuchte Luft verändern, wie warm sich die Luft anfühlt. Die scheinbare Temperatur fasst das in einer Zahl zusammen – die Luft selbst bleibt gleich warm.',
      messung: 'Die Station berechnet die scheinbare Temperatur (Apparent Temperature, AT) mit einer Formel aus Temperatur, Feuchte und Wind. Gewählt wurde die Variante für Orte im Schatten, die dem Wind ausgesetzt sind.',
      einordnung: 'Die AT ist nicht dasselbe wie die Windkühle. Die Anleitung unterscheidet auch ausdrücklich zwischen AT und der „gefühlten Temperatur“ der Station.',
      hinweis: 'Die AT ist ein Modell für das menschliche Empfinden, keine neue physikalische Temperatur. Die Luft hat nicht wirklich diese Temperatur.',
      model: 'Die Simulation rechnet mit der Formel von Steadman für Orte im Schatten, die dem Wind ausgesetzt sind. Die warme Luftschicht und die Schweißtropfen sind stark vergrößert gezeichnet.'
    },
    'gefuehlte-temperatur': {
      name: 'Gefühlte Temperatur', unit: '°C', sample: '14,2',
      head: 'Gefühlte <br class="hy">Temperatur',
      lead: 'Die gefühlte Temperatur beschreibt, wie stark das Wetter den Körper belastet – nicht, wie warm die Luft ist. Wind, Feuchte und Sonne spielen mit.',
      badge: 'Schieb den Regler „Lufttemperatur“',
      merke: 'Die gefühlte Temperatur sagt, wie stark das Wetter den Körper belastet. Bei Kälte zählt vor allem der Wind, bei Hitze die Feuchte.',
      tasks: {
        cold: 'Bring die Rechnung in den Bereich „Windkühle“.',
        heat: 'Bring sie in den Bereich „Hitzeindex“.'
      },
      messung: 'Die Station kombiniert zwei Formeln: Unter 4,4 °C nutzt sie die Windkühle, über 26,7 °C den Hitzeindex. Dazwischen liegt der Wert nahe an der Lufttemperatur.',
      einordnung: 'Auch der DWD verwendet eine gefühlte Temperatur. Sie berücksichtigt neben der Lufttemperatur unter anderem Luftfeuchte, Wind und Strahlung.',
      hinweis: 'Zwei Orte mit gleicher Temperatur können sich ganz unterschiedlich warm oder kalt anfühlen. Die gefühlte Temperatur ist eine berechnete Vergleichsgröße – keine zweite Thermometermessung.',
      model: 'Der Hitzeindex wird mit der Formel des US-Wetterdienstes berechnet. Sonne und Kleidung spielen in dieser Rechnung keine Rolle – die gefühlte Temperatur des DWD berücksichtigt auch die Strahlung.'
    },
    'uv-index': {
      name: 'UV-Index', unit: '', sample: '3',
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
      name: 'Lichtintensität', unit: 'kLux', sample: '18,5',
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
      name: 'Mondphase', unit: '', sample: '',
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
    }
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
      ariaAussen: 'Luftteilchen in einem Kasten, daneben ein Thermometer',
      ariaInnen: 'Raum mit Heizung, Fenster und verschiebbarem Sensor',
      heaterOn: 'HEIZUNG AN', heaterOff: 'HEIZUNG AUS',
      windowOpen: 'FENSTER OFFEN', windowCold: 'KALTES FENSTER',
      dragMe: '↔ ZIEH MICH',
      btnHeater: ['Heizung an', 'Heizung aus'],
      btnWindow: ['Fenster offen', 'Fenster zu'],
      btnCenter: 'Sensor in die Mitte',
      slider: 'Temperatur',
      presetFrost: 'Frostig: −15 °C', presetMild: 'Mild: 14 °C', presetHot: 'Hitze: 35 °C',
      readInnen: (s, r) => 'Sensor: ' + s + ' °C · Mittel im ganzen Raum: ' + r + ' °C',
      readAussen: (tt, ms, kmh) => tt + ' °C · Echte Luftteilchen sind dabei im Mittel rund ' + ms + ' m/s schnell – etwa ' + kmh + ' km/h',
      hint: {
        aussen: 'Schieb den Regler: Bei Wärme flitzen die Teilchen, bei Kälte werden sie träge. Ein Thermometer misst diese mittlere Bewegung.',
        innen: 'Zieh den Sensor durch den Raum: An der Heizung werden die Teilchen schneller (rot), am kalten Fenster langsamer (blau). Wo würdest du die „Raumtemperatur“ messen?'
      }
    },
    feuchte: {
      aria: 'Ein Kubikmeter Luft mit Wasserdampf und ein Gefäß, das die Höchstmenge zeigt',
      sliderT: 'Temperatur', sliderW: 'Wasserdampf',
      btnCook: 'Kochen / Duschen', btnHeat: 'Heizen', btnAir: 'Stoßlüften im Winter',
      btnDwd: 'DWD-Beispiel: 10 °C, 100 %', btnWarm: 'Auf 20 °C erwärmen', btnCool: 'Nachts auf 2 °C abkühlen',
      air: '1 m³ LUFT',
      at: tt => 'BEI ' + tt + ' °C',
      vapour: 'WASSERDAMPF',
      rh: 'RELATIVE FEUCHTE',
      droplets: 'TRÖPFCHEN (NEBEL)',
      comfy: 'BEHAGLICH', comfyRange: '40–60 %',
      atMost: g => 'HÖCHSTENS ' + g + ' g',
      plus: g => '+ ' + g + ' g',
      read: (rh, abs, tt, max, liq) => 'Relative Feuchte ' + rh + ' % · absolute Feuchte ' + abs + ' g/m³ · bei ' + tt + ' °C höchstens ' + max + ' g/m³' + (liq ? ' · ' + liq + ' g/m³ kondensiert' : ''),
      hint: {
        aussen: 'Ändere nur die Temperatur, ohne Wasser dazuzugeben: Die Prozentzahl springt, obwohl die Wassermenge gleich bleibt. Kühlt die Luft unter die Sättigung, wird Wasserdampf zu Tröpfchen.',
        innen: 'Probier Kochen, Heizen und Lüften aus. Beim Heizen bleibt das Wasser in der Luft gleich – trotzdem sinkt die Prozentzahl.'
      }
    },
    taupunkt: {
      ariaInnen: 'Raum, Fensterscheibe und Außenluft – die Scheibe beschlägt, wenn sie kälter als der Taupunkt ist',
      ariaAussen: 'Landschaft in der Nacht: Die Luft kühlt ab, bis Tau und Nebel entstehen',
      sliderRoom: 'Raumluft', sliderRh: 'Luftfeuchte', sliderOut: 'Draußen', sliderEvening: 'Abends',
      single: 'Einfachglas', double: 'Doppelglas', glassAria: 'Fensterart',
      room: tt => 'RAUM ' + tt + ' °C',
      rh: v => 'LUFTFEUCHTE ' + v + ' %',
      pane: 'SCHEIBE', outside: 'DRAUSSEN',
      fogging: 'BESCHLÄGT',
      markRoom: 'Raumluft', markDew: 'Taupunkt', markPane: 'Scheibe', markAir: 'Luft', markGrass: 'Gras',
      readInnen: (td, pane, cond, diff) => 'Taupunkt ' + td + ' °C · Scheibe ' + pane + ' °C → ' + (cond ? 'kälter als der Taupunkt: Kondenswasser!' : 'noch ' + diff + ' °C über dem Taupunkt'),
      btnNight: ['Pause', 'Nacht starten'],
      btnReset: 'Zurück auf 20 Uhr',
      clock: (hh, mm) => hh + ':' + mm + ' UHR',
      fog: 'NEBEL', dew: 'TAU AUF DEM GRAS',
      readAussen: (air, td, diff, state) => 'Luft ' + air + ' °C · Taupunkt ' + td + ' °C · Abstand ' + diff + ' °C' + (state === 'fog' ? ' → gesättigt: Nebel' : state === 'near' ? ' → fast gesättigt' : ''),
      hint: {
        innen: 'Mach es draußen kälter, bis die Scheibe beschlägt. Dann dreh die Luftfeuchte hoch oder runter: Der Taupunkt wandert mit.',
        aussen: 'Starte die Nacht: Die Luft kühlt ab, der Wasserdampf bleibt gleich. Das Gras wird zuerst so kalt wie der Taupunkt – dort bildet sich Tau.'
      }
    },
    druck: {
      aria: 'Luftdruck: Teilchen stoßen gegen eine Messfläche, oder: Luftsäule über der Erde',
      modeParticles: 'Teilchen-Stöße', modeHeight: 'Druck und Höhe', modeAria: 'Ansicht',
      sliderN: 'Teilchen', unitN: v => v + ' Stück', sliderT: 'Temperatur', sliderH: 'Höhe',
      btnLow: 'Tief: weniger Luft', btnNormal: 'Normal', btnHigh: 'Hoch: mehr Luft',
      wxLow: 'Tief 995 hPa', wxNormal: 'Normal 1013 hPa', wxHigh: 'Hoch 1030 hPa', wxAria: 'Wetterlage',
      mem1: 'MESS–', mem2: 'FLÄCHE',
      low: 'TIEF', high: 'HOCH',
      hits: ['STÖSSE PRO', 'SEKUNDE AUF', 'DIE FLÄCHE'],
      approx: p => '≈ ' + p + ' hPa',
      km: k => k + ' km',
      // LOCAL: Offenbach (100 m) and Großer Feldberg (880 m) are the local reference heights
      marks: ['Offenbach, 100 m', 'Gr. Feldberg, 880 m', 'Zugspitze, 2962 m', 'Mont Blanc, 4806 m', 'Everest, 8849 m', 'Flugzeug, ca. 11 km'],
      absIn: 'ABSOLUT IN',
      height: h => h + ' m HÖHE',
      hpa: p => p + ' hPa',
      above: ['LUFT ÜBER', 'DEM BALLON'],
      seaLevel: ['AUF MEERES–', 'HÖHE UMGE–', 'RECHNET'],
      highP: 'HOCHDRUCK', lowP: 'TIEFDRUCK', std: 'STANDARD',
      readParticles: (n, tt, p) => n + ' Teilchen bei ' + tt + ' °C · Druck im Modell ≈ ' + p + ' hPa',
      readHeight: (h, p, pct) => 'In ' + h + ' m Höhe: ' + p + ' hPa absolut · ' + pct + ' % der Luft liegt noch darüber',
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
    windrichtung: {
      aria: 'Kompass mit Windfahne – zieh, um die Windrichtung zu ändern',
      presets: ['Nordwind', 'Ostwind', 'Südwind', 'Westwind'],
      btnOffset: ['Sensor 30° verdreht', 'Sensor richtig ausgerichtet'],
      dir16: ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'],
      dir16Long: ['Nord', 'Nordnordost', 'Nordost', 'Ostnordost', 'Ost', 'Ostsüdost', 'Südost', 'Südsüdost', 'Süd', 'Südsüdwest', 'Südwest', 'Westsüdwest', 'West', 'Westnordwest', 'Nordwest', 'Nordnordwest'],
      display: 'ANZEIGE',
      wrong: '30° FALSCH!',
      from: 'WIND KOMMT AUS', to: 'WEHT NACH',
      read: (name, deg, short, toName, shown) => name + 'wind: Er kommt aus ' + deg + '° (' + short + ') und weht nach ' + toName + (shown != null ? ' · Anzeige zeigt ' + shown + '° – das ist falsch' : ''),
      hint: 'Zieh mit dem Finger um den Kompass: Dort, wo du hinziehst, kommt der Wind her. Die Windfahne dreht sich, bis ihre Spitze in den Wind zeigt.'
    },
    wind: {
      aria: 'Schalenkreuz-Windmesser, Baum und Verlauf der Windgeschwindigkeit',
      slider: 'Mittlerer Wind',
      steady: 'Gleichmäßig', restless: 'Unruhig', gusty: 'Böig', gustAria: 'Böigkeit',
      btnGust: 'Böe!',
      cups: 'WINDSCHALEN', now: 'JETZT',
      ms: v => v + ' m/s', unit: 'm/s',
      ago: '−10 MIN',
      mean: 'MITTEL 2 MIN',
      gust: v => 'BÖE ' + v,
      readGusts: (mx, mxKmh, bft, avg, avgKmh) => 'Stärkste Böe ' + mx + ' m/s (' + mxKmh + ' km/h, ' + bft + ' Bft) · Mittel ' + avg + ' m/s (' + avgKmh + ' km/h)',
      readMean: (avg, kmh, bft, cur) => 'Mittel (2 min) ' + avg + ' m/s = ' + kmh + ' km/h = Windstärke ' + bft + ' Bft · jetzt ' + cur + ' m/s',
      hint: {
        mittel: 'Die Windschalen drehen sich umso schneller, je stärker der Wind ist. Der Momentanwert (schwarz) zappelt ständig – der Mittelwert über 2 Minuten (dicke Linie) ist viel ruhiger.',
        boeen: 'Tippe auf „Böe!“ oder stell den Wind auf „Böig“. Achte auf den Baum: Er reagiert auf jede Spitze, nicht auf den Mittelwert.'
      }
    },
    koerper: {
      aria: 'Ein Mensch im Wind mit warmer Luftschicht um die Haut, daneben Thermometer und berechneter Wert',
      sliderT: 'Lufttemperatur', sliderV: 'Wind', sliderRh: 'Luftfeuchte',
      presets: {
        windkuehle: ['Windstill', 'Frische Brise', 'Wintersturm'],
        at: ['Windiger Herbsttag', 'Schwüler Sommertag', 'Trockene Hitze'],
        gefuehlt: ['Eisiger Wind', 'Milder Tag', 'Schwüle Hitze']
      },
      names: { windkuehle: 'WIND–\nKÜHLE', at: 'SCHEIN–\nBAR', gefuehlt: 'GE–\nFÜHLT' },
      modes: {
        windChill: 'Windkühle', noWind: 'kaum Wind: keine Windkühle', apparent: 'scheinbare Temperatur',
        heatIndex: 'Hitzeindex', air: 'Lufttemperatur'
      },
      sweat: ['SCHWEISS VERDUN–', 'STET SCHLECHT'],
      layer: 'WARME LUFTSCHICHT',
      range: 'BEREICH:',
      read: (tt, mode, res, diff, colder) => 'Luft ' + tt + ' °C · ' + mode + ' ' + res + ' °C' + (diff ? ' · fühlt sich ' + diff + ' °C ' + (colder ? 'kälter' : 'wärmer') + ' an' : ''),
      hint: {
        windkuehle: 'Erhöhe den Wind: Die warme Luftschicht um die Haut (orange) wird weggeblasen. Das linke Thermometer bleibt trotzdem stehen – die Luft wird nicht kälter.',
        at: 'Spiel mit Wind und Feuchte: Wind bläst die warme Hautschicht weg, feuchte Luft lässt Schweiß schlechter verdunsten.',
        gefuehlt: 'Unter 4,4 °C rechnet die Station mit der Windkühle, über 26,7 °C mit dem Hitzeindex, dazwischen mit der Lufttemperatur. Probier die drei Bereiche aus.'
      }
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
    }
  },

  foot: {
    // LOCAL: the station of SCAPE° and the source of the texts
    sources: 'Gerätedaten: Bedienungsanleitung der BRESSER 7-in-1 LORA Profi-Wetterstation Terral (Art. 15013). Vergleichswerte: Deutscher Wetterdienst (DWD), Weltgesundheitsorganisation (WHO, UV-Index). Die Werte auf dem Display sind Beispielwerte, keine Live-Daten.'
  }
};
