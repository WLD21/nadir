# Nouveaux Toits

Interior-renovation website in French, Dutch and English, with an original Blender house model and scroll-driven assembly.

The opening sequence assembles the house in 3D and carries it into the homepage. It plays once per browser-tab session, can be skipped or replayed from the footer, and bypasses autoplay for reduced motion and direct section links. The intro reuses the existing hero renderer and fails open if the model cannot load.

**Website:** https://nadir-iota-nine.vercel.app

## Deployment

This repository is connected to the Vercel project `nadir`. The repository root `vercel.json` serves `nouveaux-toits-source/dist`. Both installation and build commands are intentionally empty: the website is buildless, its browser libraries are vendored, and its 3D model and image cutouts are ready to serve. Keep the Vercel Root Directory at the repository root.

Changes pushed to `main` are deployed by the existing Vercel GitHub integration.

## Files

- `nouveaux-toits-source/dist/`: published HTML, CSS, JavaScript and assets.
- `nouveaux-toits-source/source/blender/`: editable Blender model and generation scripts.
- `nouveaux-toits-source/source/renders/`: original transparent renders.
- `nouveaux-toits-source/BRIEF.md`: creative brief.
- `nouveaux-toits-source/VERIFICATION.md`: design and browser verification notes.

Serve `nouveaux-toits-source/dist` over HTTP for local development. There is no application build step. The package dependencies are authoring/verification dependencies and are not installed during deployment.

## Booking

The planner prepares a downloadable project brief. It does not currently send messages or confirm appointments. Set `window.NT_CONFIG.bookingUrl` in `nouveaux-toits-source/dist/index.html` to the company's verified booking URL to show the scheduling link after brief preparation.

The original source documentation also records the earlier private Sites preview. This repository and the Vercel URL above are the GitHub/Vercel deployment.
