import bpy, math, random, json, os
from pathlib import Path
from mathutils import Vector
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = str(ROOT / 'dist' / 'assets')
SOURCE = str(Path(__file__).resolve().parent)
RENDERS = str(ROOT / 'source' / 'renders')
os.makedirs(OUT, exist_ok=True)
os.makedirs(RENDERS, exist_ok=True)
random.seed(23)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
for d in list(bpy.data.materials): bpy.data.materials.remove(d)

def material(name, color, roughness=.5, metallic=0):
    m=bpy.data.materials.new(name); m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value=(*color,1)
    bs.inputs['Roughness'].default_value=roughness
    bs.inputs['Metallic'].default_value=metallic
    return m

def texture_material(name, rgb, kind='stone', roughness=.6):
    n=256; rng=np.random.default_rng(42)
    yy,xx=np.mgrid[0:n,0:n]
    if kind=='wood':
        v=.90+.07*np.sin(yy*.13+np.sin(xx*.025)*2.5)+.025*np.sin(yy*.72+np.sin(xx*.03)*1.6)+rng.normal(0,.012,(n,n))
    else: v=.95+rng.normal(0,.025,(n,n))+.018*np.sin(xx*.025)*np.sin(yy*.034)
    arr=np.ones((n,n,4),dtype=np.float32)
    for i in range(3): arr[:,:,i]=np.clip(v*rgb[i],0,1)
    im=bpy.data.images.new(name+' texture',width=n,height=n,alpha=True)
    im.pixels.foreach_set(arr.ravel());im.pack()
    m=material(name,rgb,roughness); ns=m.node_tree.nodes; tex=ns.new('ShaderNodeTexImage');tex.image=im
    m.node_tree.links.new(tex.outputs['Color'],ns.get('Principled BSDF').inputs['Base Color'])
    return m

concrete=texture_material('Honed concrete',(.53,.55,.54))
plaster=material('Warm lime plaster',(.78,.76,.69),.84)
white=material('Porcelain ivory',(.88,.87,.81),.26)
oak=texture_material('Natural oak',(.55,.34,.17),'wood')
oaklight=texture_material('Pale oak',(.65,.45,.25),'wood')
dark=material('Anthracite metal',(.055,.085,.087),.32,.62)
chrome=material('Brushed stainless steel',(.56,.61,.62),.20,.92)
copper=material('Copper hot water',(.70,.28,.09),.28,.72)
blue=material('Blue cold water',(.016,.31,.53),.34,.12)
electric=material('Cyan electrical conduit',(.005,.42,.56),.38,.1)
red=material('Electrical cable red',(.48,.055,.025),.4)
insulation=texture_material('Mineral wool',(.69,.52,.22))
fabric=material('Linen upholstery',(.57,.61,.54),.92)
bricks=[material('Brick %s'%i,(.48+i*.026,.215+i*.012,.12+i*.009),.86) for i in range(4)]
tilemats=[texture_material('Limestone tile %s'%i,(.68+i*.018,.67+i*.017,.60+i*.019)) for i in range(3)]
glass=material('Window glass',(.48,.68,.70),.12,.12)
leaf=material('Leaf green',(.13,.24,.12),.8)
soil=material('Pot earth',(.09,.058,.03),1)
roots={}
for stage in ['structure','masonry','electrical','plumbing','insulation','tiles','finish','furnishings']:
    ob=bpy.data.objects.new(stage,None);bpy.context.collection.objects.link(ob);ob['stage']=stage;roots[stage]=ob

def tag(ob, stage, seq=0):
    ob.parent=roots[stage];ob['stage']=stage;ob['sequence']=seq; return ob

def bevel(ob, amount=.02, segments=2):
    mod=ob.modifiers.new('Soft crafted edges','BEVEL');mod.width=amount;mod.segments=segments
    mod=ob.modifiers.new('Weighted normals','WEIGHTED_NORMAL')

def cube(name, loc, scale, mat, stage, seq=0, edge=.015):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc);o=bpy.context.object;o.name=name;o.dimensions=scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:o.data.materials.append(mat)
    if edge:bevel(o,edge)
    tag(o,stage,seq); return o

def cyl(name, loc, radius, depth, mat, stage, rotation=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=20,radius=radius,depth=depth,location=loc)
    o=bpy.context.object;o.name=name
    if rotation:o.rotation_euler=rotation
    o.data.materials.append(mat);bevel(o,.007,2);tag(o,stage)
    for p in o.data.polygons:p.use_smooth=True
    return o

def path(name, points, radius, mat, stage, seq=0):
    cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.resolution_u=8;cu.bevel_depth=radius;cu.bevel_resolution=3
    sp=cu.splines.new('POLY');sp.points.add(len(points)-1)
    for p,co in zip(sp.points,points):p.co=(*co,1)
    ob=bpy.data.objects.new(name,cu);bpy.context.collection.objects.link(ob);ob.data.materials.append(mat);tag(ob,stage,seq);return ob

def beam(name,a,b,width,depth,mat,stage):
    mid=(Vector(a)+Vector(b))*.5; vec=Vector(b)-Vector(a)
    ob=cube(name,mid,(width,depth,vec.length),mat,stage,edge=.012)
    ob.rotation_euler=vec.to_track_quat('Z','Y').to_euler();return ob

def sphere(name,loc,scale,mat,stage):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=loc)
    o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(mat);tag(o,stage)
    for p in o.data.polygons:p.use_smooth=True
    return o

# A full-size home cut away from its front and right elevations.
cube('Foundation raft',(0,0,-.18),(8.2,6.1,.34),concrete,'structure',edge=.045)
cube('Screed edge',(0,0,.015),(7.86,5.78,.09),plaster,'structure',edge=.01)
cube('Left rear pier',(-3.83,2.72,1.45),(.27,.27,2.9),concrete,'structure')
cube('Right rear pier',(3.83,2.72,1.45),(.27,.27,2.9),concrete,'structure')
cube('Rear lintel',(0,2.73,2.82),(7.8,.25,.22),concrete,'structure')
beam('Roof rear left rafter',(-4.0,2.83,2.90),(0,2.83,4.35),.17,.21,oak,'structure')
beam('Roof rear right rafter',(0,2.83,4.35),(4.0,2.83,2.90),.17,.21,oak,'structure')
beam('Roof ridge',(0,2.83,4.35),(0,1.74,4.35),.16,.20,oak,'structure')

# Brickwork is individually laid, then merged by material for efficient WebGL.
for row in range(13):
    z=.15+row*.205
    for col in range(19):
        x=-3.63+col*.395+(row%2)*.195
        if x>3.68:continue
        if -.45<x<1.38 and .95<z<2.43:continue
        cube('Rear brick %02d %02d'%(row,col),(x,2.69,z),(.378,.18,.188),random.choice(bricks),'masonry',row,edge=.009)
for row in range(13):
    z=.15+row*.205
    for col in range(14):
        y=-2.60+col*.395+(row%2)*.195
        if y>2.55:continue
        cube('Side brick %02d %02d'%(row,col),(-3.78,y,z),(.18,.378,.188),random.choice(bricks),'masonry',row,edge=.009)

# The water paths are visible under the floor and along the open wet-room wall.
for i,(mat,dx) in enumerate([(blue,-.07),(copper,.07)]):
    path('Water main '+str(i),[(-3.45,-2.50,.12),(-3.45,2.25,.12),(2.5,2.25,.12),(2.5,2.25,.99)],.035,mat,'plumbing',i)
    path('Bathroom riser '+str(i),[(-3.45,.65,.12),(-2.80,.65,.12),(-2.80,.65,1.10),(-3.44,.65,1.10)],.031,mat,'plumbing',i+2)
    path('Shower riser '+str(i),[(-3.45,2.1,.12),(-3.45,2.1,1.35),(-3.45,2.1+dx,2.35)],.028,mat,'plumbing',i+4)
path('Waste pipe',[(-2.75,-2.55,.10),(-2.75,1.8,.10),(-2.4,1.8,.10)],.065,dark,'plumbing',6)

# Clean electrical loops and boxed junctions stay visible through the cutaway.
for i,x in enumerate([-2.95,-1.55,1.65,3.30]):
    path('Circuit rear '+str(i),[(-3.55,2.45,2.58),(x,2.45,2.58),(x,2.45,.48)],.023,electric,'electrical',i)
    cube('Socket back box '+str(i),(x,2.43,.45),(.14,.075,.19),dark,'electrical',i,edge=.02)
path('Floor power run',[(-3.55,2.45,.19),(-3.55,-1.4,.19),(-.4,-1.4,.19),(-.4,.55,.19)],.022,electric,'electrical',5)
cube('Electrical distribution panel',(-3.64,-1.91,1.58),(.12,.43,.62),white,'electrical',6)
for i in range(5):cube('Circuit breaker '+str(i),(-3.55,-2.06+i*.07,1.61),(.05,.038,.12),dark,'electrical',6)

# Part of the left wall is retained as an honest building section.
for i in range(8):
    y=-2.3+i*.64
    cube('Timber wall stud '+str(i),(-3.59,y,1.40),(.08,.055,2.64),oaklight,'insulation',i)
    cube('Mineral wool panel '+str(i),(-3.57,y+.29,1.40),(.11,.52,2.59),insulation,'insulation',i)
cube('Insulation sill',(-3.57,.13,.12),(.13,5.2,.09),oaklight,'insulation')

# Tiled wet zone, each tile can arrive independently.
for ix in range(4):
    for iy in range(8):
        cube('tile_%02d'%(iy*4+ix),(-3.15+ix*.59,-2.36+iy*.59,.15),(.58,.58,.045),tilemats[(ix+iy)%3],'tiles',iy*4+ix,edge=.006)

# Finished rear wall stops before the exposed services at the left.
cube('Rear finished wall west',(-.82,2.53,1.40),(.59,.075,2.65),plaster,'finish')
cube('Rear finished wall east',(2.64,2.53,1.40),(2.40,.075,2.65),plaster,'finish')
cube('Rear finished window sill',(.46,2.52,.50),(1.97,.09,.87),plaster,'finish')
cube('Rear finished over window',(.46,2.52,2.59),(1.97,.09,.29),plaster,'finish')
for x in [-.49,1.40]:cube('Window frame side '+str(x),(x,2.48,1.72),(.065,.11,1.52),dark,'finish')
for z in [1.0,2.45]:cube('Window frame rail '+str(z),(.455,2.48,z),(1.95,.11,.065),dark,'finish')
cube('Window mullion',(.455,2.48,1.72),(.045,.10,1.45),dark,'finish')
cube('Glass pane',(.455,2.55,1.72),(1.85,.016,1.40),glass,'finish',edge=0)
cube('Window interior sill',(.455,2.36,.98),(2.08,.40,.065),oaklight,'finish')
for ix in range(7):
    for iy in range(14):
        x=-.79+ix*.67; y=-2.65+iy*.39
        cube('Oak floor board %s %s'%(ix,iy),(x,y,.145),(.655,.38,.038),oak if (ix+iy)%3 else oaklight,'finish',edge=.003)
cube('Rear skirting',(1.36,2.44,.24),(5.0,.05,.16),plaster,'finish')

# Kitchen joinery, recessed fronts and a genuinely curved mixer tap.
for i in range(5):
    x=.15+i*.69
    cube('Kitchen cabinet '+str(i),(x,2.02,.60),(.67,.86,.86),oaklight,'furnishings')
    cube('Kitchen door '+str(i),(x,1.57,.60),(.64,.045,.76),oak,'furnishings',edge=.012)
    cube('Kitchen pull '+str(i),(x,1.53,.91),(.25,.025,.025),dark,'furnishings',edge=.008)
cube('Kitchen stone worktop',(1.53,2.02,1.065),(3.53,.96,.075),white,'furnishings',edge=.02)
cube('Sink rim',(2.40,2.0,1.108),(.63,.56,.018),chrome,'furnishings',edge=.075)
cube('Sink dark basin',(2.40,2.0,1.12),(.52,.43,.022),dark,'furnishings',edge=.07)
tap_points=[]
tap_points += [(2.40,2.34,1.1),(2.40,2.34,1.44)]
for t in np.linspace(0,math.pi,20):tap_points.append((2.40,2.21+.13*math.cos(t),1.44+.13*math.sin(t)))
tap_points += [(2.40,2.08,1.37)]
path('Curved stainless kitchen mixer',tap_points,.025,chrome,'furnishings')
cyl('Mixer base',(2.40,2.34,1.13),.054,.06,chrome,'furnishings')
path('Mixer lever',[(2.46,2.34,1.16),(2.51,2.34,1.25)],.014,chrome,'furnishings')
cube('Induction glass',(.33,2.01,1.11),(.74,.61,.021),dark,'furnishings',edge=.02)
for x in [.10,.53]:
    for y in [1.83,2.16]:
        pts=[(x+math.cos(t)*.105,y+math.sin(t)*.105,1.125) for t in np.linspace(0,math.tau,33)]
        path('Hob etched ring',pts,.003,chrome,'furnishings')
cube('Oak floating shelf',(2.67,2.29,1.94),(1.76,.43,.065),oak,'furnishings')
for i in range(3):cyl('Ceramic kitchen jar '+str(i),(2.22+i*.21,2.22,2.09),.066,.23,white,'furnishings')

# Bathroom fixtures and a walk-in shower.
cube('Bathroom half wall',(-1.33,1.08,.65),(.13,2.64,1.2),plaster,'finish')
cube('Shower tray',(-2.63,1.85,.22),(1.55,1.38,.10),white,'furnishings',edge=.06)
cube('Shower drain',(-2.63,1.88,.28),(.55,.055,.012),dark,'furnishings',edge=.005)
path('Shower column',[(-3.43,2.0,1.18),(-3.43,2.0,2.36),(-3.09,2.0,2.36)],.023,chrome,'furnishings')
cyl('Rain shower head',(-3.04,2.0,2.33),.16,.034,chrome,'furnishings')
cube('Vanity cabinet',(-2.85,.18,.65),(1.16,.60,.75),oak,'furnishings')
cube('Vanity porcelain top',(-2.85,.18,1.05),(1.22,.66,.10),white,'furnishings',edge=.045)
sphere('Vanity basin',(-2.85,.17,1.12),(.40,.23,.075),white,'furnishings')
path('Vanity mixer',[(-3.12,.35,1.12),(-3.12,.35,1.32),(-2.99,.35,1.32)],.02,chrome,'furnishings')

# Soft furnishings keep the finished scene architectural and inhabitable.
cube('Linen sofa base',(1.20,-1.43,.45),(2.64,1.00,.45),fabric,'furnishings',edge=.14)
cube('Linen sofa back',(1.20,-1.82,.84),(2.64,.30,.70),fabric,'furnishings',edge=.13)
for i in [-1,1]:cube('Sofa arm '+str(i),(1.2+i*1.19,-1.43,.69),(.28,.93,.55),fabric,'furnishings',edge=.12)
for i in [-1,1]:cube('Sofa cushion '+str(i),(1.2+i*.55,-1.37,.73),(1.02,.72,.17),fabric,'furnishings',edge=.09)
for x in [.13,2.27]:
    for y in [-1.70,-1.07]:cyl('Sofa foot',(x,y,.24),.036,.17,dark,'furnishings')
cube('Coffee table top',(1.30,-.20,.55),(1.55,.78,.08),oaklight,'furnishings',edge=.18)
for x in [.70,1.90]:
    for y in [-.42,.03]:cyl('Coffee table leg',(x,y,.35),.027,.36,dark,'furnishings')
cube('Book',(1.09,-.18,.61),(.39,.29,.045),white,'furnishings',edge=.008)
cyl('Coffee cup',(1.64,-.14,.65),.067,.12,white,'furnishings')
cube('Entrance bench',(3.10,-1.20,.54),(.70,1.7,.11),oak,'furnishings',edge=.04)
for y in [-1.82,-.58]:cube('Bench leg '+str(y),(3.10,y,.34),(.53,.07,.38),dark,'furnishings')
cyl('Plant pot',(3.15,.48,.43),.24,.50,white,'furnishings')
cyl('Plant earth',(3.15,.48,.69),.21,.015,soil,'furnishings')
for i in range(11):
    a=i*2.4;h=.74+(i%4)*.18;x=3.15+math.cos(a)*.22;y=.48+math.sin(a)*.22
    path('Plant stem '+str(i),[(3.15,.48,.65),(x,y,h+.35)],.008,leaf,'furnishings')
    o=sphere('Plant leaf '+str(i),(x,y,h+.30),(.20,.065,.08),leaf,'furnishings');o.rotation_euler=(0,-.5,a)

# Merge masonry and long floor boards by material after applying bevels.
def merge_stage(stage, predicate=None):
    objs=[o for o in list(bpy.data.objects) if o.type=='MESH' and o.parent==roots[stage] and (predicate is None or predicate(o))]
    groups={}
    for o in objs:
        key=o.data.materials[0].name if o.data.materials else 'none';groups.setdefault(key,[]).append(o)
    for key, obs in groups.items():
        for ob in obs:
            bpy.context.view_layer.objects.active=ob
            for mod in list(ob.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
        bpy.ops.object.select_all(action='DESELECT')
        for ob in obs:ob.select_set(True)
        bpy.context.view_layer.objects.active=obs[0]
        bpy.ops.object.join();bpy.context.object.name=stage+' | '+key
merge_stage('masonry')
merge_stage('finish',lambda o:o.name.startswith('Oak floor'))

# glTF contains only the architectural scene; lighting/cameras remain in .blend.
bpy.ops.object.select_all(action='DESELECT')
for root in roots.values():
    root.select_set(True)
    for ch in root.children_recursive:ch.select_set(True)
bpy.context.view_layer.objects.active=roots['structure']
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'renovation-house.glb'),export_format='GLB',use_selection=True,export_extras=True,export_apply=True,export_yup=True,export_cameras=False,export_lights=False)
manifest={'units':'meters','blenderVersion':bpy.app.version_string,'source':'Original architecture modeled and rendered in Blender','groups':list(roots.keys()),'bounds':{'width':8.2,'depth':6.1,'height':4.6},'camera':{'position':[10.8,9.8,12.4],'target':[0,1.45,0],'fov':34},'note':'glTF is Y-up. Camera sees open front and right. Child extras.stage and extras.sequence support assembly choreography.'}
with open(os.path.join(OUT,'house-manifest.json'),'w',encoding='utf-8') as f:json.dump(manifest,f,indent=2)
print('GLB_READY',flush=True)

# Studio rendering with a transparent film and genuine shadowed material response.
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.film_transparent=True
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
scene.render.resolution_x=1600;scene.render.resolution_y=1300;scene.render.resolution_percentage=100
scene.world.color=(.3,.3,.3)
world=scene.world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.72,.78,.80,1);world.node_tree.nodes['Background'].inputs[1].default_value=.45
scene.view_settings.view_transform='AgX'
def light(name,loc,power,size):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size
    ob=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(ob);ob.location=loc
    ob.rotation_euler=(Vector((0,0,1))-ob.location).to_track_quat('-Z','Y').to_euler()
light('Large daylight key',(2,-5,10),2100,8)
light('Soft studio fill',(-6,-2,6),1500,6)
light('Warm rear rim',(3,5,8),1800,5)
camdata=bpy.data.cameras.new('Architectural camera');cam=bpy.data.objects.new('Architectural camera',camdata);bpy.context.collection.objects.link(cam)
cam.location=(10.8,-12.4,9.8);target=Vector((0,0,1.45));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();camdata.type='ORTHO';camdata.ortho_scale=12.7;scene.camera=cam
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(SOURCE,'nouveaux-toits-house.blend'))
scene.render.filepath=os.path.join(RENDERS,'hero-house.png');bpy.ops.render.render(write_still=True)
print('HERO_READY',flush=True)

# Save matching finished/static poster, optimized later without losing alpha.
# Cutouts come from the same physical materials and lighting as the house.
for root in roots.values():
    for ob in root.children_recursive:ob.hide_render=True
tileobs=[]
for i in range(3):
    ob=cube('Cutout porcelain sample '+str(i),((i-1)*.18,(i-1)*.13,i*.10), (1.75,1.75,.08),tilemats[i],'tiles',edge=.013);ob.rotation_euler[2]=math.radians((i-1)*9);tileobs.append(ob)
cam.location=(3,-4,4);target=Vector((0,0,.2));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();camdata.ortho_scale=3.25
scene.render.resolution_x=900;scene.render.resolution_y=900;scene.render.filepath=os.path.join(RENDERS,'tile-cutout.png');bpy.ops.render.render(write_still=True)
for ob in tileobs:ob.hide_render=True
matobs=[]
for i,(mat,h) in enumerate([(concrete,.15),(insulation,.40),(oaklight,.09)]):
    ob=cube('Cutout floor layer '+str(i),(0,0,i*.45),(1.9,1.40,h),mat,'structure',edge=.012);matobs.append(ob)
cam.location=(3,-4,3.4);target=Vector((0,0,.45));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();camdata.ortho_scale=3.3
scene.render.filepath=os.path.join(RENDERS,'material-cutout.png');bpy.ops.render.render(write_still=True)
print('ALL_READY',flush=True)
