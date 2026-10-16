# Visual assets

File-based visuals (Napkin AI exports, approved illustrations, real Odoo training-instance screenshots).

- Path: `public/visuals/<course-slug>/<lesson-slug>/<descriptive-kebab-name>.(svg|png|webp)`
- Register every file in `src/content/visuals/registry.ts` (concept, type, source, caption, alt, format, size, rights).
- Reference it from a lesson with a `visual-figure` block.
- Run `npm run visuals:check` before committing.

Never add fabricated screenshots of Odoo; use labelled `visual-mockup` blocks until real screenshots are captured.
