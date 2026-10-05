# Erklärvideo AI Literacy

Video nach dem Gesamtbriefing, Fassung 3. Komplett per Code erzeugt: SVG und JavaScript im Browser, eigene deterministische Zeitsteuerung, Render mit Playwright und ffmpeg. Kein Remotion, keine generativen Bild- oder Videowerkzeuge, keine externen Bilder.

## Stand

D6 Schritt 0 bis 2: Gerüst, `script.json`, fünf Standbilder zur Freigabe in `out/stills/`. Die übrigen Szenen sind schon als einfache Fassung angelegt (`out/stills/szenen/`). Sie werden ab Schritt 4 ausgearbeitet.

## Voraussetzungen

Node.js ab 20, ffmpeg, Chromium für Playwright. Playwright steht als Projektabhängigkeit in `package.json`.

```
npm install
```

Wenn Playwright seinen Chromium nicht findet: `CHROMIUM_PATH=/pfad/zu/chromium node render/render.js …`

## Befehle

| Zweck | Befehl |
|---|---|
| Vorschau mit Zeitleiste und Szenenauswahl | `npm run preview`, dann http://127.0.0.1:5173/ öffnen |
| Fünf Freigabebilder | `npm run stills` |
| Ein Bild pro Szene | `node render/render.js --szenen` |
| Alle Bilder und MP4 | `npm run render` |
| Animatic in halber Auflösung | `node render/render.js --skala 0.5 && bash render/encode.sh` |

Jeder Render schreibt `out/szenendauern.md`: die berechneten Szenendauern im Vergleich zu C2.

## Schriften

D4 sieht Georgia und Calibri vor. Sind sie installiert (`fc-list`), werden sie verwendet. Sonst kommen die metrisch kompatiblen freien Schriften aus `src/fonts/` zum Einsatz, beide unter SIL Open Font License:

- Gelasio statt Georgia (`Gelasio-VF.ttf`, `OFL-Gelasio.txt`)
- Carlito statt Calibri (`Carlito-Regular.ttf`, `Carlito-Bold.ttf`, `OFL-Carlito.txt`)

**Bisher verwendet: Gelasio und Carlito.** Vor jedem Render wird mit `document.fonts.check` geprüft, ob die Schriften wirklich geladen sind. Zusätzlich wird geprüft, ob die Schriftdateien den Status „geladen“ haben, weil `check` auch dann wahr meldet, wenn eine Schrift gar nicht deklariert ist. Schlägt die Prüfung fehl, bricht der Render ab.

## Aufbau

```
content/script.json   einzige Quelle für alle Texte und Animationszeiten
src/lib/              Zeitsteuerung, Leseregel, Textumbruch, Farben, Fabrik, Zeitachsen, Endbild
src/scenes/           eine Datei pro Szene, jeweils render(t) → SVG
src/preview.html      Vorschau
render/serve.js       lokaler Server, wählt die Schriften
render/render.js      Playwright, Bild für Bild
render/encode.sh      ffmpeg
```

Szenendauern werden aus der Leseregel (D4) und den Animationszeiten berechnet, nie von Hand gesetzt. Wer einen Block in `script.json` kürzt, kürzt die Szene.

Erweiterungen am Format von `script.json` gegenüber D3:

- `animation_nachlauf_s`: Pause am Szenenende
- `animation_zwischen_s` darf eine Liste sein, ein Wert je Lücke (S06 braucht vor dem Umbau mehr Zeit als danach)
- `anzeige`: `titel` (S00) oder `abspann` (S17), `abspann` mit Hinweis, Quellen, Vermerk; `dauer_fest_s` für S17
