# Fairy Headquarters UI

Run `npm ci --ignore-scripts` at repository root, then `npm run dev`. Open http://127.0.0.1:5175 . Build with `npm run build:ui`; preview with `npm run preview:ui` on port 4175.

A sanitized export of an original fairy-world interface: ten 3D rooms, volumetric fairies with wing/hover animation logic, orbit, click-to-focus, double-click empty scene to reset, room map, quality controls, reduced motion, translucent inspector and tab-only draft input. All runtime metadata stays unavailable. Generic room labels are visual organization, not registered autonomous agents. No personal configuration, private agent identity files, instructions or policy is required. No helpers are declared in this public catalog; no helper activity is invented.

There is no API proxy or private filesystem reader. Opening this UI does not start a model, read mail, write Notion, execute a task or connect to the private application. Owner integration components remain separately available under frontend/; a future reviewed backend may implement their contract. The UI adapter intentionally returns unavailable state without fetching accounts.

Asset provenance and hashes: ASSETS.json. Furniture/small nature models are Kenney CC0, and environment lighting is Poly Haven CC0. Original AI-assisted generated scenery and face decals are published at owner request and are not labeled CC0 or human photographs. Local GLB resources are embedded. Brand logos and unused historical assets are excluded. Source licensing remains as described in the repository README. Public asset pins verify identity, not artistic copyright certainty.

No assets are fetched from a CDN at runtime. Run `npm test`, `npm run typecheck:ui`, `npm run build:ui` and `python3 scripts/check-release.py` before reviewing a publication.
