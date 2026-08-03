# Architecture

Learn Ghostty is a static Astro site deployed to GitHub Pages.

## Stack

- Astro static output with Starlight as the standard documentation/learning shell and visual design system
- Starlight docs loader, Pagefind search, navigation, sidebar, table of contents, theme, typography, and accessibility defaults
- MDX content collections for lessons
- Vue islands only for interactive walkthroughs, browser progress, search, and Copy for AI
- Browser localStorage for last section and completed lessons
- Pinned public Ghostty source
- Puppeteer browser audit

No learner-facing server, account, database, CLI, agent, or native runtime is required.

## Source of truth

Each `src/content/docs/lessons/*.mdx` file defines order, title, description, duration, module, status, and source references. Starlight renders published lessons and owns navigation/search/theme chrome; Astro derives the homepage roadmap and AI Markdown from the same docs collection.

## Routes

- `/`
- `/course-map`
- `/source`
- `/lessons/<id>`
- `/ai/lessons/<id>.md`

## Browser progress

`src/lib/progressStore.js` records only:

- current lesson and section
- last section per lesson
- explicitly completed lessons
- timestamps

Restart offers export before deletion. No grading or evidence model exists.

## Copy for AI

The Vue island uses a body-level Teleport and collision-aware fixed popup. It produces neutral current-section context with clean Markdown, URLs, progress, pinned source, `~/learn-ghostty`, `~/ghostty`, and an empty question field.

## Publishing

`LEARN_GHOSTTY_BASE=/learn-ghostty/ npm run build` emits `dist/`, which GitHub Actions deploys to Pages.
