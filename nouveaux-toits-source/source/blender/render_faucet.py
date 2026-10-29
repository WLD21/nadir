import bpy,os
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'source'/'blender'/'nouveaux-toits-house.blend'))
names=['Curved stainless kitchen mixer','Mixer base','Mixer lever']
for ob in bpy.data.objects:
    if ob.type in ['MESH','CURVE']:ob.hide_render=ob.name not in names
scene=bpy.context.scene;cam=scene.camera
cam.location=(3.40,1.13,1.95)
target=Vector((2.44,2.21,1.35));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=.74
scene.render.resolution_x=900;scene.render.resolution_y=900;scene.cycles.samples=48
scene.render.filepath=str(ROOT/'source'/'renders'/'faucet-cutout.png')
bpy.ops.render.render(write_still=True)
