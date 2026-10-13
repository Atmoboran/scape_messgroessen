# SCAPE° — Messgrößen der Wetterstation

The in-depth layer for the weather station outside the SCAPE° museum in
Offenbach (BRESSER 7-in-1 LORA Profi-Wetterstation Terral, Art. 15013). The
start page shows the station's display; a tap on a value opens the page of
that quantity with a small interactive simulation of the physics behind it.
17 quantities in six groups, 13 simulations, plus a "Warum messen?" page.

Every quantity page has: a first-hint badge on the simulation, a 1–2 sentence
hint, one Merke box with the key insight, and four collapsible topics ("So
misst die Station", "Zum Einordnen", "Gut zu wissen", "Modell und
Wirklichkeit"). Ten quantities have 1–2 optional tasks with a clear success
condition that unlock the Merke box; on the others the Merke box is always
open.

| Quantity | Simulation | Tasks |
|---|---|---|
| Außentemperatur | particle box: temperature = mean particle speed | – |
| Innentemperatur | room with heater and window, draggable sensor | – |
| Luftfeuchtigkeit außen / innen | 1 m³ of air with water vapour and the maximum per temperature | außen: saturate then warm to 20 °C; cool until droplets form |
| Taupunkt innen | window pane fogs up below the dew point | fog the pane; clear it without warming outside |
| Taupunkt außen | night run: dew on the grass, fog at the dew point | dew; fog |
| Luftdruck | particle hits on a surface / pressure and height | > 1100 hPa; balloon where half the air is above |
| Niederschlagsmenge | tipping bucket (0.254 mm per tip) and 1 mm = 1 l/m² | collect 1 mm |
| Windrichtung | wind vane on a compass, mis-aligned sensor | west wind; twist the sensor |
| Windgeschwindigkeit / Windböen | cup anemometer, tree, 10-minute course with mean and gusts | – |
| Windkühle / Scheinbare / Gefühlte Temperatur | person with warm boundary layer, wind, sweat; thermometer vs computed value | gefühlt: reach the wind-chill and the heat-index range |
| UV-Index | sun height, ozone, clouds; WHO scale | tap both day presets |
| Lichtintensität | lux vs W/m²: spectra of sun, LED and heater, eye sensitivity | – |
| Mondphase | sun–earth–moon from above and the view from earth | set full moon; set new moon |

The values on the display are examples, not live station data.

## Run

Open `index.html` (double-click works, no build, no server, works offline),
or serve the folder with any static file server / GitHub Pages. Every
quantity can be opened directly, e.g. `index.html#luftdruck`,
`index.html#taupunkt-innen`; `#start` is the display, `#warum` the
"Warum messen?" page.

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
js/data.js            the groups and the 17 quantities (order, simulation, shapes)
js/sim-kit.js         shared simulation tools: square canvas, controls, physics formulas
js/sims/*.js          one file per simulation (temperatur, feuchte, taupunkt, druck,
                      regen, windrichtung, wind, koerper, uv, licht, mond)
js/app.js             display, quantity pages, routing, animation loop
content/texts.de.js   every visible text, including canvas labels (edit or translate here)
theme/                the design: font, palette, logo, group colours (see theme/README.md)
```

## Layout

All simulations draw into a square field of 600 × 600 units. Canvas text is
never smaller than 12 px on screen (it grows on narrow phones).

- **Phone:** poster, the strip of all 17 quantities, the simulation at full
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
heights). Sources (device manual, DWD, WHO) are named in the footer. Founders
Grotesk is used when installed, otherwise the system fallback.
