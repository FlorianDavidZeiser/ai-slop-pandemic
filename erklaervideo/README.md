# Erklärvideo AI Literacy

Video nach Drehbuch Fassung 4 (`content/drehbuch_v4.md`), mit Sprecherstimme. Bild komplett per Code: SVG und JavaScript im Browser, eigene deterministische Zeitsteuerung, Render mit Playwright und ffmpeg. Stimme und Hintergrundmusik synthetisch über HeyGen, einmal erzeugt und im Projekt abgelegt (`content/sprecher/`). Kein Remotion, keine generativen Bild- oder Videowerkzeuge, keine externen Bilder.

## Stand

Fassung 4 mit Stimme, Gesamtrender in 1080p (`out/erklaervideo.mp4`, nicht im Repository, Befehl unten). Fassung 3 ohne Stimme liegt als `content/script_v3.json` bei.

Standbilder: `out/stills/` (Freigabebilder) und `out/stills/szenen/` (ein Bild pro Szene).

## Ablauf mit Stimme

1. `script.json` enthält je Szene den Sprechtext (`sprecher`, mit `<break time="0.4s"/>` für Pausen), einen Bildtext (`bildtext`) und das Wort, bei dem der Bildtext erscheint (`bildtext_ab`).
2. `npm run stimme` erzeugt je Szene eine Aufnahme über HeyGen (`POST /v3/voices/speech`, 0,6 Credits je Sprechminute) und speichert Audio und Zeitstempel je Wort unter `content/sprecher/`. Nur Szenen, deren Text, Stimme oder Tempo sich geändert hat, werden neu erzeugt. `npm run stimme -- --musik` lädt die Hintergrundmusik.
3. Die Szenendauer ist Vorlauf plus Sprechzeit plus Nachlauf. Animation und Bildtext hängen an Wörtern der Aufnahme: In jeder Szene steht `p.w('Elektromotor')` für den Moment, in dem das Wort gesprochen wird.
4. `npm run render` rendert die Bilder, kodiert das Video, mischt den Ton (`render/mischen.js`: Stimme auf -16 LUFS, Musik auf -33 LUFS, unter der Stimme abgesenkt) und führt beides zusammen.

Zugang zu HeyGen: Die Umgebung hängt den Header `X-Api-Key` an Anfragen an `api.heygen.com` an, oder die Variable `HEYGEN_API_KEY` ist gesetzt. Die Aufrufe laufen über `curl`, damit der Proxy der Umgebung greift.

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
| Bildstreifen eines Zeitbereichs zum Prüfen | `node render/ausschnitt.js <von_s> <bis_s> <schritt_s>` |
| Stimme erzeugen (nur geänderte Szenen) | `npm run stimme` |
| Nur Ton neu mischen und einfügen | `npm run ton` |
| Alle Bilder, MP4, Ton | `npm run render` |
| Animatic in halber Auflösung | `node render/render.js --skala 0.5 && bash render/encode.sh` |

Jeder Render schreibt `out/szenendauern.md` (Szenendauern und Sprechzeiten) und `out/zeitplan.json` (Grundlage der Tonmischung).

## Schriften

D4 sieht Georgia und Calibri vor. Sind sie installiert (`fc-list`), werden sie verwendet. Sonst kommen die metrisch kompatiblen freien Schriften aus `src/fonts/` zum Einsatz, beide unter SIL Open Font License:

- Gelasio statt Georgia (`Gelasio-VF.ttf`, `OFL-Gelasio.txt`)
- Carlito statt Calibri (`Carlito-Regular.ttf`, `Carlito-Bold.ttf`, `OFL-Carlito.txt`)

**Bisher verwendet: Gelasio und Carlito.** Vor jedem Render wird mit `document.fonts.check` geprüft, ob die Schriften wirklich geladen sind. Zusätzlich wird geprüft, ob die Schriftdateien den Status „geladen“ haben, weil `check` auch dann wahr meldet, wenn eine Schrift gar nicht deklariert ist. Schlägt die Prüfung fehl, bricht der Render ab.

## Aufbau

```
content/script.json   einzige Quelle für alle Texte und Animationszeiten
src/lib/              Zeitsteuerung, Textumbruch, Farben, Fabrik, Zeitachsen, Endbild
src/scenes/           eine Datei pro Szene, jeweils render(t) → SVG
src/preview.html      Vorschau
render/serve.js       lokaler Server, wählt die Schriften
render/render.js      Playwright, Bild für Bild
render/encode.sh      ffmpeg
```

Szenendauern folgen der Stimme, nie von Hand gesetzt. Wer einen Sprechtext in `script.json` kürzt und `npm run stimme` ausführt, kürzt die Szene.

Erweiterungen am Format von `script.json` gegenüber D3:

- `sprecher`, `bildtext`, `bildtext_ab`, `vorlauf_s`, `nachlauf_s` je Szene, `stimme` und `musik` am Anfang
- `anzeige`: `titel` (S00) oder `abspann` (S15), `abspann` mit Hinweis, Quellen, Vermerk; `dauer_fest_s` für Szenen ohne Stimme

## Gestaltungsentscheidungen, die über das Briefing hinausgehen

- **Sprecherstimme und Musik** gegen D4 „kein Ton“. Begründung in `content/drehbuch_v4.md`, Teil 1.
- **Ein Bildtext je Szene** statt mehrerer Blöcke. Er erscheint, wenn die Stimme den Gedanken ausgesprochen hat, und bleibt bis zum Szenenwechsel.
- **Begriffsmarke** steht unten rechts in einer eigenen Zeile unter dem Bildtext.
- **Material in der alten Fabrik:** In S03 läuft das Material im Zickzack zwischen den Reihen, in S04 nach dem Umbau gerade. So ist „Das Material fließt besser“ im Bild zu sehen, nicht nur im Text.
- **S09:** Die Person markiert am Ende die unauffällige Stelle im Text. Das ist das Bild für „wo ein Mensch prüft“.
- **Übergänge ohne weiße Fläche** bei S00→S01, S05→S06 und S13→S14, weil dort dasselbe Bild weiterläuft (Kontinuität nach D4b).
- **Zielgruppen im Endbild** nach dem Wortlaut in D5, nicht nach der PNG („zentrales Team und ausgewählte Fach- und Führungskräfte“).
- **MEHRWERT** in Gold statt Orange, weil D4b Orange auf Begriffsmarken, Kopfzeile, Trennlinie und Balken 3 beschränkt.
