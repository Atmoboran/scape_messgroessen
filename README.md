# SCAPE° — Messgrößen der Wetterstation

The in-depth layer for the weather station outside the SCAPE° museum in
Offenbach (BRESSER 7-in-1 LORA Profi-Wetterstation Terral, Art. 15013). The
start page shows the station's display with all its values; every field opens
the page of its topic. 10 topics, one interactive simulation each, plus a
"Warum messen?" page.

Every topic page has: a first-hint badge on the simulation, a 1–2 sentence
hint, one Merke box with the key insight, and four collapsible topics ("So
misst die Station", "Zum Einordnen", "Gut zu wissen", "Modell und
Wirklichkeit"). Topics with tasks ask 2 questions in a closed dropdown (type a number or
pick an answer, then right/wrong); all answered right unlock the Merke box;
on the others it is always open. Questions and answers live in
`content/texts.de.js` (`topics.<id>.tasks`).

| Topic | Display fields | Simulation | Tasks |
|---|---|---|---|
| Temperatur | außen, innen | particle box: temperature = mean particle speed | – |
| Luftfeuchte | relative humidity außen/innen, dew point außen/innen | 1 m³ of air with water vapour: relative and absolute humidity, dew point, condensation | saturate then warm to 20 °C; cool below the dew point |
| Luftdruck | Luftdruck | particle hits on a surface / pressure and height | > 1100 hPa; balloon where half the air is above |
| Niederschlag | Niederschlagsmenge | tipping bucket (0.254 mm per tip) and 1 mm = 1 l/m² | collect 1 mm |
| Wind | direction, mean, gusts | wind vane and cup anemometer from above, 10-minute course with mean and gusts | west wind; gust > 15 m/s |
| Wie fühlt es sich an? | Windkühle, scheinbare Temperatur (AT), gefühlte Temperatur | person with warm boundary layer, wind, sweat; thermometer next to the three computed values | reach the wind-chill and the heat-index range |
| UV-Index | UV-Index | sun height, ozone, clouds; WHO scale | tap both day presets |
| Lichtintensität | Lichtintensität | lux vs W/m²: spectra of sun, LED and heater, eye sensitivity | – |
| Mondphase | Mondphase (today) | sun–earth–moon from above and the view from earth | set full moon; set new moon |
| Sonnenaufgang & -untergang | sunrise, sunset (today, Offenbach) | the sun's path for any latitude, date and local solar time (MEZ/MESZ shown at 50° N) | length of the longest day; latitude of the polar circle |

The values on the display are examples, not live station data – except moon
phase, sunrise and sunset, which are computed for today.

## Run

Open `index.html` (double-click works, no build, no server, works offline),
or serve the folder with any static file server / GitHub Pages. Every
topic can be opened directly, e.g. `index.html#luftdruck`, `index.html#wind`;
`#start` is the display, `#warum` the "Warum messen?" page. Old links to single
quantities (e.g. `#taupunkt-innen`) open their topic.

URL switches for staff:

- `?kiosk` – exhibit mode: back to the display after 3 minutes without touch.

The app has no staff panel, so `?dev` has no effect.

## Files

```
index.html            structure only (data-t placeholders for every text)
css/kit.css           shared SCAPE° components (same in every app)
css/app.css           layout of this app (display, tiles, "Warum messen?", stage)
js/view.js            phone/desktop layout switch (loaded in <head>)
js/texts.js           fills the texts from content/
js/brand.js           fills logo and footer line from the theme
js/kit.js             fullscreen button, hint badge, tasks/Merke, kiosk mode
js/data.js            the 10 topics, the display fields, the station's location
js/sim-kit.js         shared simulation tools: square canvas, controls, physics formulas
js/sims/*.js          one file per topic (temperatur, feuchte, druck, regen, wind,
                      koerper, uv, licht, mond, sonne)
js/app.js             display, topic pages, routing, animation loop
content/texts.de.js   every visible text, including canvas labels (edit or translate here)
theme/                the design: font, palette, logo, group colours (see theme/README.md)
```

## Layout

All simulations draw into a square field of 600 × 600 units. Canvas text is
never smaller than 12 px on screen (it grows on narrow phones).

- **Phone:** poster, the strip of all 10 topics, the simulation at full
  width, controls, readout, hint, tasks, Merke box, topics, prev/next pager.
- **Desktop** (automatic from 1000 px, or via the "Desktop-/Handy-Ansicht"
  toggle, remembered for this app only): the simulation on the left, sized to
  be fully visible without scrolling; controls, readout, hint, tasks and Merke
  on the right; topics and pager below. The poster becomes a slim band with
  the name on one line.

Fullscreen: the button next to (desktop) or below (phone) the simulation.

## Adapting

Design: `theme/` only (group colours in `THEME.messgroessen`). Texts:
`content/texts.de.js` only – lines marked `LOCAL` refer to SCAPE°, the museum
or Offenbach (station location, DWD study, local reference heights, sun
heights, day lengths); the coordinates for sunrise and sunset are in
`js/data.js` (`geo`). Sources (device manual, DWD, WHO) are named in the footer. Founders
Grotesk is used when installed, otherwise the system fallback.
