# Erklärvideo AI Literacy

Video nach dem Gesamtbriefing, Fassung 3. Komplett per Code erzeugt: SVG und JavaScript im Browser, eigene deterministische Zeitsteuerung, Render mit Playwright und ffmpeg. Kein Remotion, keine generativen Bild- oder Videowerkzeuge, keine externen Bilder.

## Stand

Alle Szenen ausgearbeitet, Gesamtrender in 1080p (`out/erklaervideo.mp4`, nicht im Repository, Befehl unten). Offen aus D6: der Lesetest mit drei Testpersonen (Schritt 3) und die Abnahme (Schritt 6). Beide führt der Auftraggeber durch.

Standbilder: `out/stills/` (die fünf Freigabebilder) und `out/stills/szenen/` (ein Bild pro Szene).

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

## Gestaltungsentscheidungen, die über das Briefing hinausgehen

- **Textwechsel:** Der alte Block blendet erst aus (150 ms), dann der neue ein (150 ms). D4a nennt 300 ms Überblendung. Bei gleichzeitiger Überblendung an derselben Stelle überlagern sich die Buchstaben, deshalb nacheinander.
- **Begriffsmarke** steht unten rechts in einer eigenen Zeile unter dem Textblock. Die lange Marke in S05 würde sonst mit dem Text überlappen.
- **Lange Blöcke:** Vier Blöcke (S05 Block 1, S06 Block 2, S07, S08 Block 1) passen nicht in zwei Zeilen mit 55 Zeichen. Sie werden an der Satzgrenze in zwei Anzeigen geteilt, der Wortlaut bleibt Zeichen für Zeichen gleich. Die Leseregel gilt je Anzeige.
- **Material in der alten Fabrik:** In S05 läuft das Material im Zickzack zwischen den Reihen, in S06 nach dem Umbau gerade. So ist „Das Material fließt besser“ im Bild zu sehen, nicht nur im Text.
- **S11:** Die Person markiert am Ende die unauffällige Stelle im Text. Das ist das Bild für „wo ein Mensch prüft“.
- **Übergänge ohne weiße Fläche** bei S00→S01, S07→S08 und S15→S16, weil dort dasselbe Bild weiterläuft (Kontinuität nach D4b).
- **Kleingedrucktes in S02** zählt mit 0,4 s je Wort, ohne die zusätzliche Sekunde eines eigenen Blocks.
- **Zielgruppen im Endbild** nach dem Wortlaut in D5, nicht nach der PNG („zentrales Team und ausgewählte Fach- und Führungskräfte“).
- **MEHRWERT** in Gold statt Orange, weil D4b Orange auf Begriffsmarken, Kopfzeile, Trennlinie und Balken 3 beschränkt.
