# Messgrößen der Wetterstation – SCAPE°

Vertiefungsebene zum Exponat „Wetterstation“ für SCAPE° (Wetter Klima Mensch, Offenbach am Main).
Vor dem Museum steht eine Wetterstation (BRESSER 7-in-1 LORA Profi-Wetterstation Terral, Art. 15013).
Die App zeigt ihr Display als Startseite: Ein Tipp auf einen Wert öffnet die Erklärung mit einer kleinen interaktiven Simulation.

## Inhalt
17 Messgrößen in sechs Gruppen, jeweils mit Simulation zur Physik/Chemie dahinter und kurzen Texten
(„So misst die Station“, „Zum Einordnen“, „Gut zu wissen“):

| Messgröße | Simulation |
|---|---|
| Außentemperatur | Teilchenkasten: Temperatur = mittlere Teilchenbewegung |
| Innentemperatur | Raum mit Heizung und Fenster, verschiebbarer Sensor |
| Luftfeuchtigkeit außen / innen | 1 m³ Luft mit Wasserdampf und „Höchstmenge“ je Temperatur (Kondensation) |
| Taupunkt innen | Fensterscheibe beschlägt, wenn sie kälter als der Taupunkt ist |
| Taupunkt außen | Nacht läuft ab: Tau auf dem Gras, Nebel am Taupunkt |
| Luftdruck | Teilchenstöße auf eine Messfläche / Druck und Höhe (absolut vs. relativ) |
| Niederschlagsmenge | Kipp-Regenmesser (0,254 mm pro Kippen) und 1 mm = 1 l/m² |
| Windrichtung | Windfahne im Kompass, 16 Himmelsrichtungen, falsch ausgerichteter Sensor |
| Windgeschwindigkeit / Windböen | Schalenkreuz, Baum, Verlauf mit 2-Minuten-Mittel und Böen |
| Windkühle / Scheinbare / Gefühlte Temperatur | Mensch mit warmer Luftschicht, Wind, Schweiß; Thermometer vs. berechneter Wert |
| UV-Index | Sonnenhöhe, Ozonschicht, Wolken; Skala nach WHO |
| Lichtintensität | Lux vs. W/m²: Spektrum von Sonne, LED und Wärmestrahler, Empfindlichkeit des Auges |
| Mondphase | Sonne–Erde–Mond von oben und Ansicht von der Erde, Datum |

Die Werte auf dem Start-Display sind Beispielwerte, keine Live-Daten.
Texte: gekürzte Fassung der „Vertiefungsebene Wetterstation“ (Arbeitsfassung CMS).

## Benutzung
`index.html` im Browser öffnen – keine Abhängigkeiten, kein Build, funktioniert offline und auf dem Handy.
Jede Messgröße ist direkt aufrufbar, z. B. `index.html#luftdruck`, `index.html#taupunkt-innen`.
Nach 3 Minuten ohne Bedienung springt die App zurück zum Display (Ausstellungsbetrieb).

## Dateien
- `index.html` – Seitenaufbau und Gestaltung
- `js/data.js` – alle Texte, Farbthemen und Formen (hier lassen sich Texte ändern)
- `js/sims.js` – die Simulationen
- `js/app.js` – Display, Navigation, Hauptschleife

## Gestaltung
Nach dem SCAPE°-Corporate-Design (Bureau Mitte): Farbfelder, Flächenformen, Linienillustrationen, Versalien für Überschriften, kräftige Töne immer mit Pastelltönen.
Hausschrift ist Founders Grotesk (lizenzpflichtig); ist sie nicht installiert, wird ersatzweise Helvetica Neue / Inter / Arial verwendet.
