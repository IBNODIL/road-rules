"""Procedural cars for the parking simulator.

Run:  blender --background --python scripts/blender/make_cars.py -- <out_dir> [preview_dir]

Blender conventions used here: Z up, the car faces -Y, its left side is +X.
The glTF exporter turns that into three.js: Y up, car faces +Z, left is +X.

Node names the web app relies on:
  Wheel_FL/FR/RL/RR   spin about local X   (FL/FR sit inside Steer_FL/FR)
  Steer_FL/FR         pivots, rotate about Y to steer
  SteeringWheel       rotate about local Z (its parent SteerColumn holds the tilt)
  Stalk               indicator stalk, rotate about X
  Head_L/R Tail_L/R Rev_L/R Sig_FL/FR/RL/RR Sig_SL/SR   emissive lamps
  Ind_L/Ind_R         green dashboard arrows
  Eye, MirrorL, MirrorR, MirrorRear   empties
  Int_*               interior meshes, everything else is exterior
"""
import math
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else "."
PREVIEW = argv[1] if len(argv) > 1 else None


# ---------------------------------------------------------------- helpers

def smooth(a, b, t):
    t = max(0.0, min(1.0, t))
    t = (1 - math.cos(t * math.pi)) / 2
    return a + (b - a) * t


def curve(keys, y):
    """Cosine interpolation through (y, z) keys."""
    if y <= keys[0][0]:
        return keys[0][1]
    for (y0, z0), (y1, z1) in zip(keys, keys[1:]):
        if y <= y1:
            return smooth(z0, z1, (y - y0) / (y1 - y0))
    return keys[-1][1]


MATS = {}


def mat(name, color, rough=0.5, metal=0.0, emit=None, emit_s=0.0, alpha=1.0):
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = emit_s
    if alpha < 1:
        b.inputs["Alpha"].default_value = alpha
    m.diffuse_color = (*color, 1)
    MATS[name] = m
    return m


def make_materials(paint):
    mat("Paint", paint, 0.3, 0.45)
    mat("Glass", (0.05, 0.08, 0.1), 0.05, 0.0, alpha=0.35)
    mat("Tire", (0.02, 0.02, 0.02), 0.9)
    mat("Rim", (0.7, 0.72, 0.75), 0.3, 1.0)
    mat("Brake", (0.25, 0.25, 0.27), 0.6, 0.8)
    mat("Chrome", (0.8, 0.8, 0.82), 0.15, 1.0)
    mat("Trim", (0.03, 0.03, 0.035), 0.55)
    mat("ArchLiner", (0.02, 0.02, 0.02), 0.95)
    mat("Headlight", (1, 0.97, 0.85), 0.1, emit=(1, 0.95, 0.8), emit_s=0.3)
    mat("Taillight", (0.5, 0.02, 0.03), 0.2, emit=(1, 0.05, 0.05), emit_s=0.3)
    mat("Signal", (1, 0.45, 0.0), 0.2, emit=(1, 0.5, 0.0), emit_s=0.0)
    mat("Reverse", (0.9, 0.9, 0.9), 0.2, emit=(1, 1, 1), emit_s=0.0)
    mat("Plate", (0.9, 0.9, 0.88), 0.5)
    mat("Int_Wall", (0.09, 0.09, 0.1), 0.85)
    mat("Int_Dash", (0.05, 0.055, 0.06), 0.6)
    mat("Int_Seat", (0.22, 0.23, 0.25), 0.9)
    mat("Int_Carpet", (0.05, 0.05, 0.055), 1.0)
    mat("Int_Roof", (0.55, 0.55, 0.52), 0.95)
    mat("Gauge", (0.02, 0.05, 0.08), 0.3, emit=(0.2, 0.5, 0.9), emit_s=0.35)
    mat("Indicator", (0.01, 0.05, 0.015), 0.3, emit=(0.1, 1.0, 0.2), emit_s=0.0)
    mat("Wheel", (0.02, 0.02, 0.022), 0.6)


class Mesh:
    """Collects boxes and lofts into one bmesh, with per-face material slots."""

    def __init__(self, name, mats, bevel=0.0):
        self.name = name
        self.bm = bmesh.new()
        self.slots = list(mats)
        self.bevel = bevel

    def slot(self, m):
        return self.slots.index(m)

    def box(self, center, size, rot=(0, 0, 0), m=None, bevel=None, bottom_mat=None):
        bm = self.bm
        g = bmesh.ops.create_cube(bm, size=1.0)
        verts = g["verts"]
        xf = (
            Matrix.Translation(center)
            @ Matrix.Rotation(rot[2], 4, "Z")
            @ Matrix.Rotation(rot[1], 4, "Y")
            @ Matrix.Rotation(rot[0], 4, "X")
            @ Matrix.Diagonal((size[0], size[1], size[2], 1))
        )
        bmesh.ops.transform(bm, matrix=xf, verts=verts)
        faces = {f for v in verts for f in v.link_faces}
        for f in faces:
            f.material_index = self.slot(m) if m else 0
            if bottom_mat and f.normal.z < -0.9 and abs(f.normal.z) > 0.9:
                f.material_index = self.slot(bottom_mat)
        b = self.bevel if bevel is None else bevel
        if b > 0:
            edges = {e for f in faces for e in f.edges}
            bmesh.ops.bevel(bm, geom=list(edges), offset=b, segments=2, affect="EDGES")

    def beam(self, p0, p1, tx, ty, m, bevel=0.0):
        p0, p1 = Vector(p0), Vector(p1)
        d = p1 - p0
        q = d.to_track_quat("Z", "Y")
        bm = self.bm
        g = bmesh.ops.create_cube(bm, size=1.0)
        xf = Matrix.Translation((p0 + p1) / 2) @ q.to_matrix().to_4x4() @ Matrix.Diagonal((tx, ty, d.length, 1))
        bmesh.ops.transform(bm, matrix=xf, verts=g["verts"])
        for f in {f for v in g["verts"] for f in v.link_faces}:
            f.material_index = self.slot(m)

    def cyl(self, center, radius, depth, axis="X", m=None, seg=20, r2=None):
        bm = self.bm
        rot = {"X": Matrix.Rotation(math.pi / 2, 4, "Y"), "Y": Matrix.Rotation(math.pi / 2, 4, "X"), "Z": Matrix.Identity(4)}[axis]
        g = bmesh.ops.create_cone(
            bm, cap_ends=True, segments=seg, radius1=radius, radius2=radius if r2 is None else r2,
            depth=depth, matrix=Matrix.Translation(center) @ rot,
        )
        for f in {f for v in g["verts"] for f in v.link_faces}:
            f.material_index = self.slot(m)

    def lathe(self, loop, segs, m, axis_shift=0.0):
        """Closed profile loop of (axial, radius) revolved about X."""
        bm = self.bm
        rings = []
        for a, r in loop:
            ring = []
            for k in range(segs):
                p = 2 * math.pi * k / segs
                ring.append(bm.verts.new((a + axis_shift, r * math.cos(p), r * math.sin(p))))
            rings.append(ring)
        n = len(rings)
        for i in range(n):
            r0, r1 = rings[i], rings[(i + 1) % n]
            for k in range(segs):
                f = bm.faces.new((r0[k], r0[(k + 1) % segs], r1[(k + 1) % segs], r1[k]))
                f.material_index = self.slot(m)

    def loft(self, rings, m, cap=True):
        bm = self.bm
        vr = [[bm.verts.new(p) for p in ring] for ring in rings]
        n = len(vr[0])
        for a, b in zip(vr, vr[1:]):
            for k in range(n):
                f = bm.faces.new((a[k], a[(k + 1) % n], b[(k + 1) % n], b[k]))
                f.material_index = self.slot(m)
        if cap:
            for ring in (vr[0], vr[-1]):
                f = bm.faces.new(ring)
                f.material_index = self.slot(m)

    def finish(self, sharp_deg=45, parent=None, loc=(0, 0, 0)):
        bm = self.bm
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        for f in bm.faces:
            f.smooth = True
        for e in bm.edges:
            if len(e.link_faces) == 2 and e.calc_face_angle(0) > math.radians(sharp_deg):
                e.smooth = False
        me = bpy.data.meshes.new(self.name)
        bm.to_mesh(me)
        bm.free()
        for m in self.slots:
            me.materials.append(m)
        ob = bpy.data.objects.new(self.name, me)
        bpy.context.collection.objects.link(ob)
        ob.parent = parent
        ob.location = loc
        return ob


def empty(name, loc, parent=None, rot=(0, 0, 0)):
    e = bpy.data.objects.new(name, None)
    e.empty_display_size = 0.1
    bpy.context.collection.objects.link(e)
    e.parent = parent
    e.location = loc
    e.rotation_euler = rot
    return e


def superellipse(w, zb, zt, rt=0.1, rb=0.14, arc=5):
    """Rounded rectangle ring (name kept), CCW from the right side, tight top shoulders."""
    h = (zt - zb) / 2
    rt, rb = min(rt, h * 0.9), min(rb, h * 0.9)
    rt, rb = min(rt, w * 0.5), min(rb, w * 0.5)
    pts = []
    for cx, cz, r, a0 in ((w - rt, zt - rt, rt, 0), (-(w - rt), zt - rt, rt, 90),
                          (-(w - rb), zb + rb, rb, 180), (w - rb, zb + rb, rb, 270)):
        for i in range(arc + 1):
            a = math.radians(a0 + 90 * i / arc)
            pts.append((cx + r * math.cos(a), cz + r * math.sin(a)))
    return pts


# ---------------------------------------------------------------- specs
# Every y is measured from the car centre, negative toward the nose.
SPECS = {
    "sedan": dict(
        paint=(0.9, 0.62, 0.0), L=4.1, W=1.82, wb=2.55, R=0.31, tw=0.2, clear=0.17,
        belt=0.95, roof=1.46,
        hood=[(-2.05, 0.60), (-1.7, 0.78), (-1.2, 0.86), (-0.78, 0.93)],
        tail=[(1.45, 0.95), (1.75, 0.98), (2.05, 0.90)],
        ws_base=-0.78, ws_top=-0.12, rr_top=0.82, rr_base=1.45, rear_cap=True,
    ),
    "hatch": dict(
        paint=(0.15, 0.4, 0.75), L=3.85, W=1.76, wb=2.45, R=0.30, tw=0.19, clear=0.17,
        belt=0.93, roof=1.50,
        hood=[(-1.92, 0.58), (-1.6, 0.76), (-1.1, 0.85), (-0.72, 0.92)],
        tail=[(1.7, 0.95), (1.92, 0.78)],
        ws_base=-0.72, ws_top=-0.05, rr_top=1.0, rr_base=1.72, rear_cap=False,
    ),
    "suv": dict(
        paint=(0.7, 0.1, 0.1), L=4.3, W=1.9, wb=2.65, R=0.37, tw=0.235, clear=0.22,
        belt=1.08, roof=1.72,
        hood=[(-2.15, 0.78), (-1.8, 0.95), (-1.2, 1.02), (-0.82, 1.08)],
        tail=[(1.9, 1.08), (2.15, 0.95)],
        ws_base=-0.82, ws_top=-0.1, rr_top=1.25, rr_base=1.9, rear_cap=False,
    ),
    "van": dict(
        paint=(0.88, 0.88, 0.9), L=4.4, W=1.84, wb=2.8, R=0.33, tw=0.2, clear=0.2,
        belt=1.0, roof=1.82,
        hood=[(-2.2, 0.68), (-1.9, 0.84), (-1.45, 0.92), (-1.15, 1.0)],
        tail=[(2.0, 1.0), (2.2, 0.9)],
        ws_base=-1.15, ws_top=-0.55, rr_top=1.7, rr_base=2.0, rear_cap=False,
    ),
}


def build(name, s):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    MATS.clear()
    make_materials(s["paint"])
    M = MATS
    L, W, R = s["L"], s["W"], s["R"]
    hl, hw = L / 2, W / 2
    belt, roof = s["belt"], s["roof"]
    root = empty("Car", (0, 0, 0))

    # ---------- lower body (lofted superellipse sections)
    keys = s["hood"] + [(s["ws_base"] + 0.01, belt), (s["rr_base"] - 0.01, belt)] + s["tail"]
    keys = sorted(set(keys))
    # keep the beltline flat between windscreen and rear glass
    top = lambda y: belt if s["ws_base"] <= y <= s["rr_base"] else curve(keys, y)
    ys = sorted(set([k[0] for k in keys] + [-hl + (L * i / 26) for i in range(27)]))
    rings = []
    for y in ys:
        t = abs(y) / hl
        u = max(0.0, (t - 0.85) / 0.15)
        w = hw * (1 - 0.30 * u * u) * (0.97 if y > 0 else 1.0)
        zb = s["clear"] + 0.12 * u * u + (0.02 if t > 0.5 else 0)
        zt = top(y) - 0.07 * u * u
        rings.append([(x, y, z) for x, z in superellipse(w, zb, zt)])
    body = Mesh("Body", [M["Paint"], M["ArchLiner"], M["Int_Wall"]])
    body.loft(rings, M["Paint"])
    body_ob = body.finish(sharp_deg=55, parent=root)

    # cutters: wheel arches and the cabin cavity
    cut = Mesh("Cut_Arch", [M["ArchLiner"]])
    for sx in (-1, 1):
        for sy in (-1, 1):
            x0 = sx * (hw + 0.2)
            x1 = sx * (hw - 0.25)
            cut.cyl(((x0 + x1) / 2, sy * s["wb"] / 2, R), R + 0.07, abs(x0 - x1), "X", M["ArchLiner"], seg=28)
    arch_ob = cut.finish(parent=None)
    cav = Mesh("Cut_Cabin", [M["Int_Wall"]])
    floor = 0.36
    cav_f, cav_b = s["ws_base"], s["rr_base"]
    cav.box(((0), (cav_f + cav_b) / 2, (floor + belt + 0.6) / 2), (W - 0.42, cav_b - cav_f, belt + 0.6 - floor), m=M["Int_Wall"])
    cav_ob = cav.finish(parent=None)
    for cutter in (arch_ob, cav_ob):
        bpy.context.view_layer.objects.active = body_ob
        mod = body_ob.modifiers.new("cut", "BOOLEAN")
        mod.operation = "DIFFERENCE"
        mod.solver = "EXACT"
        mod.object = cutter
        mod.material_mode = "TRANSFER"
        bpy.ops.object.modifier_apply(modifier=mod.name)
        bpy.data.objects.remove(cutter, do_unlink=True)

    # ---------- greenhouse: glass envelope, roof, pillars
    gb, gt = hw - 0.11, hw * 0.74

    def zg(y):
        if y < s["ws_top"]:
            return smooth(belt + 0.01, roof, (y - s["ws_base"]) / (s["ws_top"] - s["ws_base"]))
        if y <= s["rr_top"]:
            return roof - 0.03 * ((y - (s["ws_top"] + s["rr_top"]) / 2) / (s["rr_top"] - s["ws_top"])) ** 2 * 4
        return smooth(roof, belt + 0.01, (y - s["rr_top"]) / (s["rr_base"] - s["rr_top"]))

    gys = sorted(set([s["ws_base"], s["ws_top"], s["rr_top"], s["rr_base"]] + [s["ws_base"] + (s["rr_base"] - s["ws_base"]) * i / 16 for i in range(17)]))
    grings = []
    for y in gys:
        z = zg(y)
        gtt = gb - (gb - gt) * min(1, (z - belt) / (roof - belt))
        grings.append([(-gb, y, belt), (gb, y, belt), (gtt + 0.02, y, z - 0.08), (gtt - 0.07, y, z), (-(gtt - 0.07), y, z), (-(gtt + 0.02), y, z - 0.08)][::-1])
    gl = Mesh("Glass", [M["Glass"]])
    gl.loft(grings, M["Glass"])
    gl.finish(parent=root)

    roofm = Mesh("Roof", [M["Paint"], M["Int_Roof"]])
    ry0, ry1 = s["ws_top"] - 0.02, s["rr_top"] + 0.02
    roofm.box((0, (ry0 + ry1) / 2, roof - 0.005), (2 * gt - 0.02, ry1 - ry0, 0.045), m=M["Paint"], bevel=0.012, bottom_mat=M["Int_Roof"])
    roofm.finish(sharp_deg=30, parent=root)

    pil = Mesh("Pillars", [M["Trim"]])
    ax = gb - 0.01
    pil.beam((ax, s["ws_base"], belt), (gt, s["ws_top"], roof - 0.02), 0.06, 0.07, M["Trim"])
    pil.beam((-ax, s["ws_base"], belt), (-gt, s["ws_top"], roof - 0.02), 0.06, 0.07, M["Trim"])
    yb = (s["ws_top"] + s["rr_top"]) / 2 + 0.05
    pil.beam((gb, yb, belt), (gt, yb, roof - 0.03), 0.05, 0.1, M["Trim"])
    pil.beam((-gb, yb, belt), (-gt, yb, roof - 0.03), 0.05, 0.1, M["Trim"])
    pil.beam((gb, s["rr_base"], belt), (gt, s["rr_top"], roof - 0.02), 0.06, 0.09, M["Trim"])
    pil.beam((-gb, s["rr_base"], belt), (-gt, s["rr_top"], roof - 0.02), 0.06, 0.09, M["Trim"])
    pil.finish(sharp_deg=30, parent=root)

    # ---------- exterior trim & lights
    tr = Mesh("Trim", [M["Trim"], M["Chrome"], M["Plate"]])
    nose_z = top(-hl) - 0.07
    tr.box((0, -hl - 0.005, s["clear"] + 0.3), (W * 0.42, 0.04, 0.12), m=M["Trim"], bevel=0.01)      # grille
    tr.box((0, -hl - 0.005, s["clear"] + 0.14), (W * 0.6, 0.05, 0.1), m=M["Trim"], bevel=0.01)      # lower intake
    tr.box((0, -hl - 0.02, s["clear"] + 0.2), (0.3, 0.01, 0.07), m=M["Plate"])                     # front plate
    tr.box((0, hl + 0.02, s["clear"] + 0.35), (0.3, 0.01, 0.07), m=M["Plate"])                     # rear plate
    tr.box((0, hl - 0.04, s["clear"] + 0.12), (W * 0.7, 0.06, 0.1), m=M["Trim"], bevel=0.01)       # rear diffuser
    for sx in (-1, 1):  # door handles, mirrors
        for y in (s["ws_top"] - 0.27, yb + 0.45):
            tr.box((sx * (hw + 0.0), y, belt - 0.08), (0.04, 0.16, 0.025), m=M["Chrome"])
        tr.beam((sx * (hw - 0.05), s["ws_base"] + 0.15, belt + 0.02), (sx * (hw + 0.1), s["ws_base"] + 0.2, belt + 0.1), 0.035, 0.035, M["Trim"])
        tr.box((sx * (hw + 0.15), s["ws_base"] + 0.2, belt + 0.12), (0.12, 0.22, 0.18), m=M["Trim"], bevel=0.03)
    tr.finish(sharp_deg=40, parent=root)

    def lamp(name, mname, center, size):
        lm = Mesh(name, [M[mname]])
        lm.box(center, size, m=M[mname], bevel=0.012)
        return lm.finish(sharp_deg=40, parent=root)

    zl = top(-hl) - 0.05 + 0.0
    hz = max(s["clear"] + 0.45, zl - 0.1)
    for sx, side in ((1, "L"), (-1, "R")):
        lamp(f"Head_{side}", "Headlight", (sx * 0.5, -hl + 0.04, hz), (0.34, 0.12, 0.1))
        lamp(f"Sig_F{side}", "Signal", (sx * 0.72, -hl + 0.13, hz - 0.02), (0.14, 0.14, 0.09))
        tz = s["clear"] + 0.5 if s["rear_cap"] else belt - 0.12
        lamp(f"Tail_{side}", "Taillight", (sx * 0.56, hl - 0.05, tz), (0.36, 0.1, 0.1))
        lamp(f"Sig_R{side}", "Signal", (sx * 0.76, hl - 0.12, tz - 0.02), (0.14, 0.14, 0.09))
        lamp(f"Rev_{side}", "Reverse", (sx * 0.3, hl - 0.04, s["clear"] + 0.2), (0.1, 0.05, 0.05))
        lamp(f"Sig_S{side}", "Signal", (sx * (hw + 0.2), s["ws_base"] + 0.1, belt + 0.14), (0.04, 0.05, 0.05))
        mg = Mesh(f"MirrorGlass_{side}", [M["Chrome"]])
        mg.box((sx * (hw + 0.15), s["ws_base"] + 0.31, belt + 0.12), (0.2, 0.01, 0.15), m=M["Chrome"])
        mg.finish(parent=root)

    # ---------- wheels
    wheel_axle_y = s["wb"] / 2
    track = W - 0.24
    rim_r = R * 0.64
    for sx, side in ((1, "L"), (-1, "R")):
        for sy, end in ((-1, "F"), (1, "R")):
            pos = (sx * track / 2, sy * wheel_axle_y, R)
            if end == "F":
                piv = empty(f"Steer_{end}{side}", pos, root)
                parent, loc = piv, (0, 0, 0)
            else:
                parent, loc = root, pos
            wm = Mesh(f"Wheel_{end}{side}", [M["Tire"], M["Rim"], M["Brake"]])
            tw = s["tw"]
            sw = R - rim_r
            tire = [(-tw * 0.45, rim_r), (-tw * 0.5, rim_r + sw * 0.5), (-tw * 0.47, R - 0.03), (-tw * 0.33, R),
                    (tw * 0.33, R), (tw * 0.47, R - 0.03), (tw * 0.5, rim_r + sw * 0.5), (tw * 0.45, rim_r)]
            wm.lathe(tire, 32, M["Tire"])
            wm.lathe([(-tw * 0.4, rim_r + 0.002), (tw * 0.4, rim_r + 0.002), (tw * 0.4, rim_r - 0.03), (-tw * 0.4, rim_r - 0.03)], 32, M["Rim"])
            o = sx * tw * 0.35  # outward direction
            wm.cyl((o * 0.55, 0, 0), rim_r - 0.03, 0.025, "X", M["Rim"], seg=32)
            for k in range(5):
                a = k * 2 * math.pi / 5 + 0.3
                wm.beam((o * 0.55, 0.05 * math.cos(a), 0.05 * math.sin(a)), (o * 0.45, (rim_r - 0.02) * math.cos(a), (rim_r - 0.02) * math.sin(a)), 0.025, 0.045, M["Rim"])
            wm.cyl((-o * 0.15, 0, 0), rim_r * 0.85, 0.02, "X", M["Brake"], seg=32)
            wo = wm.finish(sharp_deg=50, parent=parent, loc=loc)

    # ---------- interior
    yF, yB = s["ws_base"], s["rr_base"]
    dash_z = belt - 0.03
    hub_y = yF + 0.55
    hub_z = belt - 0.17
    drv = 0.37
    ex = Mesh("Int_Dash", [M["Int_Dash"], M["Gauge"], M["Indicator"]])
    ex.box((0, yF + 0.22, belt - 0.15), (W - 0.2, 0.44, 0.24), m=M["Int_Dash"], bevel=0.02)
    ex.box((0, yF + 0.36, floor + (belt - 0.28 - floor) / 2), (W - 0.2, 0.2, belt - 0.28 - floor), m=M["Int_Dash"])
    ex.box((drv, yF + 0.36, belt + 0.01), (0.58, 0.22, 0.17), m=M["Int_Dash"], bevel=0.03)             # binnacle
    ex.cyl((drv - 0.15, yF + 0.468, belt + 0.01), 0.05, 0.012, "Y", M["Gauge"])
    ex.cyl((drv + 0.15, yF + 0.468, belt + 0.01), 0.05, 0.012, "Y", M["Gauge"])
    ex.box((0, yF + 0.5, belt - 0.12), (0.34, 0.08, 0.26), m=M["Int_Dash"], bevel=0.015)                  # centre stack
    ex.box((0, yF + 0.78, floor + 0.12), (0.26, 0.9, 0.24), m=M["Int_Dash"], bevel=0.02)                 # console
    ex.box((0, yF + 0.5, belt - 0.2), (0.3, 0.06, 0.08), m=M["Int_Dash"])
    ex.box((0, yF + 0.2, belt + 0.28), (0.44, 0.04, 0.11), m=M["Int_Dash"], bevel=0.015)                            # rear-view mirror
    ex.beam((0, yF + 0.18, belt + 0.25), (0, yF + 0.2, belt + 0.28), 0.02, 0.02, M["Int_Dash"])
    ex.cyl((drv, hub_y - 0.05, hub_z - 0.04), 0.045, 0.16, "Y", M["Int_Dash"], seg=12)                   # column cover
    ex.finish(sharp_deg=40, parent=root)

    ind = Mesh("Ind_L", [M["Indicator"]])
    ind.box((drv + 0.07, yF + 0.472, belt + 0.075), (0.05, 0.004, 0.035), m=M["Indicator"])
    ind.finish(parent=root)
    ind = Mesh("Ind_R", [M["Indicator"]])
    ind.box((drv - 0.07, yF + 0.472, belt + 0.075), (0.05, 0.004, 0.035), m=M["Indicator"])
    ind.finish(parent=root)

    se = Mesh("Int_Seats", [M["Int_Seat"], M["Int_Dash"]])
    seat_y = hub_y + 0.62
    for sx in (-1, 1):
        x = sx * drv
        se.box((x, seat_y, floor + 0.12), (0.5, 0.52, 0.16), m=M["Int_Seat"], bevel=0.04)
        se.box((x, seat_y + 0.28, floor + 0.46), (0.5, 0.12, 0.64), rot=(math.radians(-10), 0, 0), m=M["Int_Seat"], bevel=0.04)
        se.box((x, seat_y + 0.33, floor + 0.84), (0.24, 0.1, 0.16), m=M["Int_Seat"], bevel=0.03)
    ry = min(yB - 0.28, seat_y + 0.95)
    se.box((0, ry, floor + 0.12), (W - 0.4, 0.5, 0.16), m=M["Int_Seat"], bevel=0.04)
    se.box((0, ry + 0.26, floor + 0.46), (W - 0.4, 0.12, 0.6), rot=(math.radians(-10), 0, 0), m=M["Int_Seat"], bevel=0.04)
    shelf_y = ry + 0.34
    if shelf_y < yB:
        se.box((0, (shelf_y + yB) / 2, belt - 0.03), (W - 0.2, yB - shelf_y, 0.05), m=M["Int_Dash"])
    se.finish(sharp_deg=40, parent=root)

    cp = Mesh("Int_Carpet", [M["Int_Carpet"]])
    cp.box((0, (yF + yB) / 2, floor + 0.004), (W - 0.2, yB - yF, 0.008), m=M["Int_Carpet"])
    cp.finish(parent=root)

    # steering column: tilted empty holds the wheel, which spins about its local Z
    col = empty("SteerColumn", (drv, hub_y, hub_z), root, rot=(math.radians(22), 0, 0))
    sw_m = Mesh("SteeringWheel", [M["Wheel"], M["Chrome"]])
    sw_m.lathe([(-0.012, 0.185), (0.012, 0.185), (0.012, 0.16), (-0.012, 0.16)], 24, M["Wheel"])
    # the lathe revolves about X; turn the disc so its axis is local Y (facing the driver)
    bmesh.ops.transform(sw_m.bm, matrix=Matrix.Rotation(math.pi / 2, 4, "Z"), verts=sw_m.bm.verts[:])
    for a in (0.0, math.pi, -math.pi / 2):
        sw_m.box((0.085 * math.cos(a), 0, 0.085 * math.sin(a)), (0.17, 0.026, 0.035), rot=(0, -a, 0), m=M["Wheel"])
    sw_m.cyl((0, 0, 0), 0.055, 0.05, "Y", M["Chrome"], seg=20)
    sw_m.finish(sharp_deg=40, parent=col)

    stalk_p = empty("Stalk", (drv - 0.1, hub_y - 0.02, hub_z - 0.02), root)
    st = Mesh("StalkMesh", [M["Int_Dash"]])
    st.box((-0.06, 0, 0), (0.12, 0.02, 0.02), m=M["Int_Dash"])
    st.finish(parent=stalk_p)

    # eye + mirror anchors
    empty("Eye", (drv, hub_y + 0.68, 1.17), root)
    empty("MirrorL", (hw + 0.15, s["ws_base"] + 0.3, belt + 0.12), root)
    empty("MirrorR", (-hw - 0.15, s["ws_base"] + 0.3, belt + 0.12), root)
    empty("MirrorRear", (0, yF + 0.2, belt + 0.27), root)
    return root


def export(name):
    path = f"{OUT}/{name}.glb"
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", export_apply=True, export_yup=True,
        export_cameras=False, export_lights=False, export_materials="EXPORT",
    )
    return path


def preview(name):
    if not PREVIEW:
        return
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_WORKBENCH"
    sc.display.shading.light = "STUDIO"
    sc.display.shading.color_type = "MATERIAL"
    sc.render.resolution_x, sc.render.resolution_y = 900, 560
    sc.world = bpy.data.worlds.new("w")
    sc.world.color = (0.55, 0.62, 0.7)
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    bpy.context.collection.objects.link(cam)
    sc.camera = cam
    views = {
        "3q": ((6.2, -6.5, 2.6), (0, 0, 0.7)),
        "back": ((-5.0, 6.0, 2.0), (0, 0, 0.7)),
        "cabin": ((0.37, 0.2, 1.22), (0.37, -2.0, 0.85)),
    }
    cam.data.lens = 35
    for tag, (loc, tgt) in views.items():
        if tag == "cabin":
            cam.data.lens = 22
        cam.location = loc
        d = Vector(tgt) - Vector(loc)
        cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
        sc.render.filepath = f"{PREVIEW}/{name}_{tag}.png"
        bpy.ops.render.render(write_still=True)


for nm, sp in SPECS.items():
    build(nm, sp)
    export(nm)
    preview(nm)
print("done")
