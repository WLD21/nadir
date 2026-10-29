# Original Blender assets

The architectural model and all material cutouts were modeled and rendered specifically for this site using Blender 4.3.2. They illustrate renovation stages; they are not photographs of completed Nouveaux Toits projects. The logo is the user-supplied image retained unchanged at `dist/assets/logo-original.png`.

## Editable source and reproduction

- `blender/nouveaux-toits-house.blend`: editable model, procedural texture images packed into the file, materials, studio lights and hero camera.
- `blender/build_house.py`: reproducible model authoring, GLB export and transparent house/tile/material rendering.
- `blender/render_faucet.py`: isolated chrome faucet render from the same model.
- `blender/encode_assets.py`: Pillow encoding of PNG originals into the four WebP files used by the site. Alpha remains intact.

All packaged scripts resolve paths relative to this build. Run `blender --background --python source/blender/build_house.py`, then `blender --background --python source/blender/render_faucet.py`, then `python source/blender/encode_assets.py` from an environment with Blender 4.3 and Pillow. The authoring scripts write the GLB and manifest into `dist/assets`; PNG renders stay in `source/renders`.

## Delivery map

| Original render | Browser asset | Purpose |
| --- | --- | --- |
| `renders/hero-house.png` | `dist/assets/hero.webp` | Complete house poster and WebGL fallback |
| `renders/tile-cutout.png` | `dist/assets/tile-cutout.webp` | Independent porcelain sample plane |
| `renders/material-cutout.png` | `dist/assets/material-cutout.webp` | Concrete, insulation and oak layers |
| `renders/faucet-cutout.png` | `dist/assets/faucet-cutout.webp` | Chrome mixer cutout |

`renders/hero.png` is the retained identical hero PNG alias. `renders/hero-house.webp` is the retained intermediate hero encoding. These unused copies are excluded from the deployed `dist` assets.

## Model and animation contract

`dist/assets/renovation-house.glb` is 4,259,000 bytes and contains 180 meshes, 188 nodes and seven embedded texture images. Eight exact stage roots are exported: `structure`, `masonry`, `electrical`, `plumbing`, `insulation`, `tiles`, `finish`, and `furnishings`. Child extras include `stage` and `sequence`; the 32 wet-zone tiles remain separate for staged placement. Brickwork and oak flooring were merged by material to reduce draw calls.

The model includes a concrete foundation, brick walls, roof rafters, electrical circuits, copper/blue water networks, mineral-wool insulation, porcelain tile, oak flooring, kitchen cabinets, curved taps, shower, vanity, sofa, table, bench and plant. All geometry and texture images were created for this build. No downloaded 3D model or external stock texture is embedded.

The glTF export is Y-up and uses meter-scale dimensions. Recommended camera position is `[10.8, 9.8, 12.4]`, target `[0, 1.45, 0]`, perspective FOV `34`. See `dist/assets/house-manifest.json` for machine-readable metadata.

## Verification evidence

The 1600 × 1300 hero render and all three 900 × 900 material renders were visually inspected. Subjects are fully framed, the metallic faucet silhouette is complete, and the cutout planes have clean edges. All PNGs are RGBA with alpha extrema `(0, 255)`, confirming transparent and opaque pixels rather than a baked background. Browser WebP encodings retain the alpha channel. HTML asset references were checked after moving the unused originals: none was missing. Additional `hero-desktop.webp` and `hero-mobile.webp` fallback posters may be generated from the final browser scene during frontend verification.
