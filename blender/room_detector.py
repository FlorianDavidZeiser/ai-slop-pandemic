"""
Buero mit Deckenrauchmelder + Erfassungsbereich.
Alles aus Primitiven, keine externen Assets, keine Texturdateien.
Masse in Metern, an DIN 14676 / VDE 0833 angelehnt.
"""
import bpy, math, sys, os

OUT = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------- Raummasse
RW, RD, RH = 6.4, 5.0, 2.75          # Breite, Tiefe, Hoehe
DET_R      = 0.055                    # Melder Radius 11 cm Durchmesser
DET_H      = 0.042
COVER_R    = 3.5                      # Ueberwachungsradius bei <= 6 m Raumhoehe

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ---------------------------------------------------------------- Material
def mat(name, col, rough=0.6, metal=0.0, alpha=1.0, emit=None, emit_s=1.0, transmission=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*col, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if transmission:
        b.inputs["Transmission Weight"].default_value = transmission
        b.inputs["IOR"].default_value = 1.45
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = emit_s
    if alpha < 1.0:
        b.inputs["Alpha"].default_value = alpha
        m.blend_method = 'BLEND'
    return m

M_WALL  = mat("Wand",     (0.72, 0.71, 0.68), 0.85)
M_FLOOR = mat("Boden",    (0.205, 0.135, 0.082), 0.32)
M_CEIL  = mat("Decke",    (0.93, 0.93, 0.92), 0.90)
M_DESK  = mat("Tisch",    (0.55, 0.42, 0.28), 0.40)
M_METAL = mat("Metall",   (0.55, 0.56, 0.58), 0.30, 1.0)
M_CHAIR = mat("Stuhl",    (0.12, 0.13, 0.16), 0.70)
M_WHITE = mat("Gehaeuse", (0.94, 0.94, 0.93), 0.35)
M_LED   = mat("LED",      (0.9, 0.1, 0.1), 0.3, emit=(1.0, 0.15, 0.1), emit_s=8.0)
M_CONE  = mat("Erfassung",(0.10, 0.50, 0.95), 0.5, alpha=0.055,
              emit=(0.12, 0.48, 0.95), emit_s=0.9)
M_RING  = mat("Radius",   (0.10, 0.50, 0.95), 0.4,
              emit=(0.15, 0.55, 1.0), emit_s=3.0)
M_GLASS = mat("Glas",     (0.92, 0.96, 1.0), 0.02, transmission=1.0)
M_PLANT = mat("Pflanze",  (0.13, 0.32, 0.12), 0.75)
M_PAPER = mat("Papier",   (0.95, 0.94, 0.90), 0.80)

def add(prim, mtl, loc=(0,0,0), rot=(0,0,0), scale=(1,1,1), **kw):
    getattr(bpy.ops.mesh, prim)(location=loc, rotation=rot, **kw)
    o = bpy.context.object
    o.scale = scale
    if mtl: o.data.materials.append(mtl)
    return o

def bevel(o, w=0.012, seg=2):
    m = o.modifiers.new("bev", 'BEVEL'); m.width = w; m.segments = seg; return o

# ---------------------------------------------------------------- Huelle
add("primitive_cube_add", M_FLOOR, loc=(0, 0, -0.05), scale=(RW/2, RD/2, 0.05), size=2)
add("primitive_cube_add", M_CEIL,  loc=(0, 0, RH+0.05), scale=(RW/2, RD/2, 0.05), size=2)
# Rueckwand + Seitenwaende (Vorderwand weg -> Kamerablick hinein)
add("primitive_cube_add", M_WALL, loc=(0,  RD/2, RH/2), scale=(RW/2, 0.05, RH/2), size=2)
add("primitive_cube_add", M_WALL, loc=(-RW/2, 0, RH/2), scale=(0.05, RD/2, RH/2), size=2)

# Fensterband rechts: Rahmen + Glas
for i, y in enumerate((-1.5, 0.0, 1.5)):
    add("primitive_cube_add", M_GLASS, loc=(RW/2, y, 1.55), scale=(0.03, 0.65, 0.62), size=2)
    for dy, dz, sy, sz in ((0,0.64,0.68,0.04), (0,-0.64,0.68,0.04),
                           (0.68,0,0.04,0.66), (-0.68,0,0.04,0.66)):
        add("primitive_cube_add", M_METAL,
            loc=(RW/2, y+dy, 1.55+dz), scale=(0.05, sy, sz), size=2)

# ---------------------------------------------------------------- Rauchmelder an der Decke
DET_XY = (0.4, -0.3)
base = add("primitive_cylinder_add", M_WHITE, loc=(*DET_XY, RH-DET_H/2),
           vertices=64, radius=DET_R, depth=DET_H)
bevel(base, 0.008, 3)
add("primitive_cylinder_add", M_WHITE, loc=(*DET_XY, RH-DET_H-0.006),
    vertices=64, radius=DET_R*0.72, depth=0.012)
# Raucheintrittsschlitze
for i in range(12):
    a = i / 12 * math.tau
    add("primitive_cube_add", M_METAL,
        loc=(DET_XY[0]+math.cos(a)*DET_R*0.86, DET_XY[1]+math.sin(a)*DET_R*0.86, RH-DET_H*0.5),
        rot=(0, 0, a), scale=(0.004, 0.016, DET_H*0.32), size=2)
add("primitive_uv_sphere_add", M_LED, loc=(DET_XY[0], DET_XY[1]-0.028, RH-DET_H-0.008),
    radius=0.006, segments=16, ring_count=8)

# Erfassungsbereich als Kegel (Spitze am Melder, Radius COVER_R am Boden)
cone = add("primitive_cone_add", M_CONE, loc=(*DET_XY, (RH-DET_H)/2),
           vertices=64, radius1=COVER_R, radius2=0.02, depth=RH-DET_H)
cone.rotation_euler = (0, 0, 0)
cone.data.materials[0] = M_CONE
for p in cone.data.polygons: p.use_smooth = True
cone.show_transparent = True
for flag in ("visible_shadow", "visible_diffuse", "visible_glossy", "visible_transmission"):
    setattr(cone, flag, False)
# Bodenkreis als Markierung des Ueberwachungsradius
ring = add("primitive_torus_add", M_RING, loc=(*DET_XY, 0.012),
           major_radius=COVER_R, minor_radius=0.016,
           major_segments=96, minor_segments=8)
for flag in ("visible_shadow", "visible_diffuse", "visible_glossy"):
    setattr(ring, flag, False)

# ---------------------------------------------------------------- Schreibtisch
DX, DY = -1.5, 0.6
top = add("primitive_cube_add", M_DESK, loc=(DX, DY, 0.735), scale=(0.8, 0.42, 0.019), size=2)
bevel(top, 0.008)
for sx in (-1, 1):
    for sy in (-1, 1):
        add("primitive_cylinder_add", M_METAL,
            loc=(DX+sx*0.72, DY+sy*0.34, 0.36), vertices=16, radius=0.022, depth=0.72)
# Monitor
add("primitive_cube_add", M_METAL, loc=(DX, DY+0.30, 0.77), scale=(0.14, 0.09, 0.012), size=2)
add("primitive_cylinder_add", M_METAL, loc=(DX, DY+0.30, 0.88), vertices=12, radius=0.02, depth=0.22)
scr = add("primitive_cube_add", mat("Screen", (0.05,0.06,0.08), 0.15,
          emit=(0.26,0.40,0.58), emit_s=0.85),
          loc=(DX, DY+0.28, 1.17), rot=(math.radians(-6),0,0), scale=(0.30, 0.012, 0.19), size=2)
bevel(scr, 0.006)
# Papier + Tasse
add("primitive_cube_add", M_PAPER, loc=(DX+0.28, DY-0.16, 0.755), rot=(0,0,0.18),
    scale=(0.105, 0.148, 0.001), size=2)
cup = add("primitive_cylinder_add", M_WHITE, loc=(DX-0.45, DY-0.14, 0.79),
          vertices=32, radius=0.038, depth=0.09)
bevel(cup, 0.006)

# Buerostuhl
CX, CY = DX+0.05, DY-0.75
seat = add("primitive_cube_add", M_CHAIR, loc=(CX, CY, 0.46), scale=(0.26, 0.25, 0.035), size=2)
bevel(seat, 0.03, 3)
back = add("primitive_cube_add", M_CHAIR, loc=(CX, CY-0.24, 0.75), rot=(math.radians(8),0,0),
           scale=(0.24, 0.032, 0.27), size=2)
bevel(back, 0.03, 3)
add("primitive_cylinder_add", M_METAL, loc=(CX, CY, 0.24), vertices=16, radius=0.03, depth=0.42)
for i in range(5):
    a = i/5*math.tau
    add("primitive_cube_add", M_CHAIR, loc=(CX+math.cos(a)*0.16, CY+math.sin(a)*0.16, 0.045),
        rot=(0,0,a), scale=(0.17, 0.022, 0.014), size=2)

# Regal an der Rueckwand
for i, z in enumerate((0.35, 0.78, 1.21, 1.64)):
    add("primitive_cube_add", M_DESK, loc=(2.0, RD/2-0.20, z), scale=(0.55, 0.16, 0.014), size=2)
for sx in (-1, 1):
    add("primitive_cube_add", M_DESK, loc=(2.0+sx*0.55, RD/2-0.20, 1.0),
        scale=(0.014, 0.16, 0.85), size=2)
import itertools
cols = [(0.45,0.18,0.15),(0.16,0.24,0.38),(0.20,0.32,0.22),(0.38,0.33,0.18),(0.28,0.20,0.30)]
for i, z in enumerate((0.35, 0.78, 1.21, 1.64)):
    x = 2.0-0.48
    for j in range(9):
        w = 0.035 + (j % 3) * 0.012
        h = 0.19 + ((i+j) % 4) * 0.022
        add("primitive_cube_add", mat(f"B{i}{j}", cols[(i+j) % 5], 0.8),
            loc=(x+w/2, RD/2-0.20, z+0.014+h/2), scale=(w/2, 0.055, h/2), size=2)
        x += w + 0.006

# Pflanze
pot = add("primitive_cone_add", mat("Topf", (0.42,0.28,0.22), 0.7),
          loc=(2.5, -1.7, 0.14), vertices=32, radius1=0.13, radius2=0.17, depth=0.28)
for i in range(11):
    a = i/11*math.tau
    add("primitive_cone_add", M_PLANT, loc=(2.5+math.cos(a)*0.10, -1.7+math.sin(a)*0.10, 0.52),
        rot=(math.radians(26)*math.cos(a), math.radians(26)*math.sin(a), 0),
        vertices=6, radius1=0.035, radius2=0.0, depth=0.52)

# Tuer links hinten
add("primitive_cube_add", mat("Tuer", (0.80,0.78,0.74), 0.6),
    loc=(-RW/2+0.06, -1.3, 1.03), scale=(0.02, 0.44, 1.03), size=2)
add("primitive_uv_sphere_add", M_METAL, loc=(-RW/2+0.12, -0.95, 1.05), radius=0.028,
    segments=16, ring_count=8)

# ---------------------------------------------------------------- Licht
bpy.ops.object.light_add(type='SUN', rotation=(math.radians(52), 0, math.radians(-118)))
sun = bpy.context.object; sun.data.energy = 2.15; sun.data.angle = math.radians(2.5)
sun.data.color = (1.0, 0.95, 0.86)
for x in (-1.8, 1.8):                       # Deckenleuchten
    bpy.ops.object.light_add(type='AREA', location=(x, 0.2, RH-0.10))
    L = bpy.context.object.data
    L.shape = 'RECTANGLE'; L.size = 1.2; L.size_y = 0.25
    L.energy = 22; L.color = (1.0, 0.97, 0.92)
bpy.ops.object.light_add(type='AREA', location=(RW/2-0.3, 0, 1.6), rotation=(0, math.radians(90), 0))
f = bpy.context.object.data; f.size = 3.0; f.energy = 35; f.color = (0.90, 0.94, 1.0)

world = bpy.data.worlds.new("W"); scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.42, 0.50, 0.62, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.30

# ---------------------------------------------------------------- Kamera
bpy.ops.object.empty_add(location=(-0.3, 0.1, 1.15))
tgt = bpy.context.object
bpy.ops.object.camera_add(location=(-2.6, -3.55, 1.72))
cam = bpy.context.object; cam.data.lens = 21
c = cam.constraints.new('TRACK_TO'); c.target = tgt
c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
scene.camera = cam

# ---------------------------------------------------------------- Render
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 8
scene.render.film_transparent = False
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.view_settings.exposure = -0.35

QUALITY = sys.argv[-1] if len(sys.argv) > 1 else "preview"
PRESETS = {"preview": (480, 270, 24), "work": (960, 540, 64), "final": (1920, 1080, 160)}
w, h, s = PRESETS.get(QUALITY, PRESETS["preview"])
scene.render.resolution_x, scene.render.resolution_y, scene.cycles.samples = w, h, s
scene.render.filepath = os.path.join(OUT, f"render_{QUALITY}.png")

import time; t = time.time()
bpy.ops.render.render(write_still=True)
print(f"### {QUALITY} {w}x{h}@{s} -> {time.time()-t:.1f}s", flush=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "buero_melder.blend"))
print("### blend gespeichert", flush=True)
