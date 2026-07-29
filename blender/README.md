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

Der erste Durchlauf war unbrauchbar — komplett überbelichtet. Der zweite
war das Gegenteil: der Erfassungskegel hat als Lichtquelle gewirkt und den
Raum blau geflutet. Erst der dritte Durchlauf stimmte, nachdem der Kegel
aus der Beleuchtungsrechnung genommen wurde (`visible_diffuse` etc. auf
`False`).

Das ist der eigentliche Befund: Die Geometrie sitzt sofort, die
Bildwirkung nicht. Der Wert entsteht in der Schleife aus Rendern,
Hinschauen und Korrigieren — nicht im ersten Prompt.
