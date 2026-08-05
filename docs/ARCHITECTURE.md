# Architecture

Learn Ghostty is a static Astro Starlight site deployed to GitHub Pages. `b1tank/ghostty-from-scratch` is the implementation companion.

## Stack

- Starlight owns documentation chrome, navigation, Pagefind search, themes, typography, and accessibility defaults.
- MDX content collections define reconstruction chapters and optional field guides.
- Small Astro components render provenance, code snapshots, output, and dependency-frontier diagrams.
- Vue islands provide browser progress, interactive walkthroughs, and Copy for AI.
- Puppeteer audits responsive layouts, themes, progress, copy output, redirects, and interactions.

No learner-facing server, account, database, CLI, or AI is required.

## Reconstruction provenance

A published chapter is paired with a named tag or commit in `ghostty-from-scratch`. Its `historyRefs` identify validated earlier Ghostty commits where the taught responsibilities appeared, while `sourceRefs` target the pinned current implementation. Public snapshots live under `src/data/reconstruction/<chapter>/` with a manifest containing reconstruction revision, pinned upstream revision, fidelity status, and hashes.

Text output is rendered from committed fixtures. GUI screenshots and recordings must come from the tagged running reconstruction and include capture metadata. Mockups are not implementation evidence.

## Source of truth

- `src/content/docs/chapters/*.mdx` — reconstruction curriculum;
- `src/content/docs/field-guides/*.mdx` — optional integration stories;
- `src/data/reconstruction/` — allowlisted public snapshots and artifacts;
- `src/content.config.ts` — shared metadata schema.

Draft chapters remain unbuilt and unlinked until their implementation checkpoint and visual proof exist.

## Routes

- `/`
- `/chapters/<id>`
- `/field-guides/<id>`
- `/course-map`
- `/source`
- `/ai/lessons/<id>.md`

Legacy `/lessons/*` paths redirect to the appropriate chapter or field guide.

## Browser progress

`src/lib/progressStore.js` stores the current chapter and section, last section per entry, explicitly completed entries, and timestamps. Progress is local to the browser; there is no grading or evidence gate.

## Publishing

`LEARN_GHOSTTY_BASE=/learn-ghostty/ npm run build` emits `dist/`, which GitHub Actions deploys to Pages.
