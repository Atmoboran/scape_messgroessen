# Theme – changing the design

Everything that makes this app look like **SCAPE°** lives in this folder. The
rest of the code (`index.html`, `css/`, `js/`) holds structure, layout and
behaviour and contains no colour values, fonts, logos or brand lines. The
texts live in `../content/`. To make a version for another institution, edit
this folder (look) and `content/` (words):

| File | Contents |
|---|---|
| `theme.css` | Font stack and weights, the palette (`--c-…`), colour roles (`--ink`, `--paper`, `--primary`, `--active`, `--accent`, `--merke`, `--stage-bg` …), the poster header colours (`--f1`–`--f3`, `--shape`, `--outline`), footer colours, corner radius, wordmark styling (`.logo`). The app-specific block at the end sets this app's signature colour combination. |
| `theme.js` | `brand`: name, wordmark HTML, footer line, title suffix, favicon, browser colour. `font`: font for canvas text. `palette`, `data` (temperature scale, T/H, two-object colours) and an object per app with every colour it draws with. |

Rules:

* `css/app.css` and `css/kit.css` use only variables from `theme.css`. Add new
  colours there as variables, never as hex values in the app.
* The keys in `theme.js` (e.g. `palette.orange`) are names the code looks
  colours up by. For another design, replace the **values** and keep the keys.
  Colours with a meaning keep it: cold = blue, warm = red, T (Tief) red,
  H (Hoch) blue.
* Founders Grotesk is not shipped; it is used when installed on the device,
  otherwise the system fallback (Helvetica Neue / Inter / Arial) applies.
* Logo and footer line are inserted through `data-brand="…"` placeholders by
  `js/brand.js`.

This app ("Messgrößen"): `theme.css` ends with the signature combination of
the start page; `theme.js` ends with `THEME.messgroessen` – the colour
combination of every group of quantities (poster fields, shape, outline,
hover tint, display tile), the poster headers of the start page and
"Warum messen?", and the shapes, outlines and tile icons of the graphic
system. The simulations draw with `THEME.palette` by name; particle speeds and
thermometers use the CD temperature scale `THEME.tempColor`, pressure labels
use `THEME.data.low` (T, red) and `THEME.data.high` (H, blue).
