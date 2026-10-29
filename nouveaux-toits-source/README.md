# Nouveaux Toits

A French, Dutch and English interior renovation website. An original Blender architectural cutaway assembles under native scrolling, then leads into a three-step project planner.

## Run locally

Serve `dist/` with a static HTTP server. ES modules and the GLB model require HTTP rather than opening index.html directly.

```sh
npm install
npx http-server dist -p 4500
```

Open http://localhost:4500. No application build step is needed. Runtime JavaScript libraries are vendored under `dist/vendor/`. Google Fonts has system sans-serif fallbacks.

## Booking connection

The project planner currently produces a translated downloadable text brief. It does not send personal data and it does not confirm appointments. This is intentional: no company email, scheduling URL, service area or CRM was supplied.

To connect a real scheduling destination, set `window.NT_CONFIG.bookingUrl` in `dist/index.html` to the company's verified HTTPS booking URL. The completion screen will show an appointment link. The brief remains downloadable. Do not claim that selecting the link or downloading a brief confirms an appointment. A direct form submission requires a real backend or booking integration.

Personal inputs remain in page memory. Only the language preference is stored in localStorage. Refreshing loses entered form details.

## Edit

- `dist/index.html`: semantic marketing content and sections.
- `dist/style.css`: responsive layouts, tokens and interface styles.
- `dist/main.js`: language switching, Three.js scene and GSAP scroll choreography.
- `dist/translations.js`: all three languages and trade explanations.
- `dist/booking.js`: project planner, validation and document export.
- `dist/scrollcraft.js` and `.css`: unchanged ScrollCraft engine.
- `source/blender/`: editable Blender 4.3 source and generation scripts.
- `source/renders/`: original alpha renders; optimized WebP copies are deployed.
- `BRIEF.md`: creative brief, feeling curve, grammar and score.
- `VERIFICATION.md`: final checks and practical limits.

The model has eight named roots: structure, masonry, plumbing, electrical, insulation, tiles, finish, furnishings. Nodes carry stage/sequence metadata. A single downloaded GLB is cloned for the two scenes. Rendering is triggered by scene changes and paused outside the viewport. Pixel ratio is capped. Reduced motion removes extended pinning; static matching posters support unavailable WebGL. No pointer lock or capture is used.

## Libraries and credits

Original supplied Nouveaux Toits logo retained. Original 3D assets made in Blender 4.3.2 for this project; illustrations are conceptual, not photographs of completed client work.

- [Three.js 0.186.1](https://threejs.org/) and [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), MIT.
- [GSAP 3.15.0](https://gsap.com/docs/v3/) and [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), license supplied in `dist/vendor/`.
- ScrollCraft local skill and unchanged engine.
- Manrope and DM Sans via Google Fonts.

Sites hosting configuration is stored in `.openai/hosting.json`. This is a private review Site by default. The source contains no secrets or personal form submissions.
