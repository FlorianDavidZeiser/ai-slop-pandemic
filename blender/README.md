# Blender-Experiment: Raum + Deckenrauchmelder

Machbarkeitstest — kann ein Sprachmodell aus einem Prompt heraus ein
korrektes, weiterbearbeitbares 3D-Modell erzeugen? Anlass war ein
LinkedIn-Post ("Oval Office in einem Prompt").

## Was hier passiert

`room_detector.py` erzeugt per Blender-Python-API (`bpy`) ein Büro mit
Deckenrauchmelder und visualisiertem Erfassungsbereich. Kein Asset, keine
Texturdatei, kein Marketplace-Modell — alles aus Primitiven plus Modifier
(Bevel, Subsurf, Solidify) und prozeduralen Materialien.

## Maße

| Größe             | Wert                                    |
|-------------------|-----------------------------------------|
| Raum              | 6,40 × 5,00 × 2,75 m                    |
| Melder            | Ø 110 mm, Höhe 42 mm                    |
| Überwachungsradius| 3,50 m (Anhalt: Raumhöhe ≤ 6 m)         |

Die Radiusangabe ist als Darstellungsparameter gesetzt, nicht als
Planungsgrundlage — für echte Projektierung gelten DIN 14676 bzw.
DIN VDE 0833-2 und die Herstellerangaben.

## Benutzung

```bash
pip install bpy                      # Blender 5.0.1 als Python-Modul
python3 room_detector.py preview     #  480x270  @  24 Samples
python3 room_detector.py work        #  960x540  @  64 Samples
python3 room_detector.py final       # 1920x1080 @ 160 Samples
```

Erzeugt `render_<stufe>.png` und `buero_melder.blend`. Die .blend lässt
sich in Blender öffnen; jedes Objekt ist einzeln anwählbar und änderbar.

## Gemessene Renderzeiten

4 CPU-Kerne (Xeon @ 2,10 GHz), Cycles, kein GPU-Backend:

| Stufe    | Auflösung  | Samples | Zeit    |
|----------|------------|---------|---------|
| preview  | 480 × 270  | 24      | ~8 s    |
| work     | 960 × 540  | 64      | ~46 s   |
| final    | 1920 × 1080| 160     | ~6–10 min |

Daraus folgt direkt, dass Animation auf dieser Maschine ausscheidet:
24 Bilder pro Sekunde × 6 min ≈ 2,4 Stunden Rechenzeit pro Sekunde Film.

## Was der Versuch gezeigt hat

Vier Durchläufe bis zu einem brauchbaren Ergebnis:

1. **Überbelichtet.** Der Raum war flächig milchig weiß, nichts las sich.
   Ursache: drei Lichtquellen zu stark plus zu helle Weltbeleuchtung.
2. **Erfassungskegel als Lampe.** Das transparente Annotationsobjekt hat
   Licht abgestrahlt und den ganzen Raum blau geflutet. Behoben, indem der
   Kegel aus der Beleuchtungsrechnung genommen wurde — `visible_diffuse`,
   `visible_glossy`, `visible_shadow` auf `False`.
3. **Bildwirkung stimmt.** In der 480×270-Vorschau sah alles korrekt aus.
4. **Fachlicher Fehler, erst in 1080p sichtbar.** Erfassungskegel und
   Radiuskreis liefen durch Wand und Fensterfront hindurch und setzten
   sich außerhalb des Raums fort. Behoben durch Boolean INTERSECT gegen
   das Rauminnenvolumen.

Der vierte Punkt ist der eigentliche Befund. Die Geometrie saß von Anfang
an — nichts schwebte, nichts steckte im Boden, die Maße stimmten. Falsch
war die *Aussage* des Bildes, und zwar genau in der Dimension, auf die es
bei einer Brandschutzdarstellung ankommt. Ein Erfassungsbereich, der
Wände ignoriert, ist kein Schönheitsfehler.

Dazu kommt: In der schnellen Vorschau war der Fehler nicht zu sehen. Wer
nur die Vorschau prüft, hätte ihn durchgewinkt.

Der Wert entsteht also in der Schleife aus Rendern, Hinschauen und
Korrigieren — nicht im ersten Prompt. Und die Prüfung muss auf der Stufe
stattfinden, auf der der Fehler überhaupt sichtbar wird.

## Renders im Repo

`render_*.png` ist bewusst nicht eingecheckt. Die Bilder sind abgeleitete
Artefakte — Quelle der Wahrheit sind `room_detector.py` und die `.blend`.
Wer ein Bild braucht, erzeugt es mit einem der drei Befehle oben neu.
