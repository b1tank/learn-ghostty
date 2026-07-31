# Sprint plan — foundation and first lesson

## Sprint goal

Build the minimum dependable Learn Ghostty cockpit and publish a payment-quality first lesson, **Ghostty Overview: what you will learn, why it matters, and how this course works**, so the learner can start immediately with Pi beside them.

## Prioritized tasks

- [x] **1. Establish the executable course foundation**
  - Add the real course manifest and initial durable learner state.
  - Add a single `./camp` command with doctor, status, next, serve, open, and build operations.
  - Add a loopback-only local API with validated progress updates and allowlisted lab execution.

- [x] **2. Build the polished learning cockpit shell**
  - Scaffold VitePress/Vue and a distinctive responsive visual theme.
  - Build the dashboard, progress indicators, course path, current lesson card, and questions/review surfaces.
  - Connect browser progress to durable repository state.

- [x] **3. Build safe local Ghostty source navigation**
  - Add a browser source viewer with highlighted line context.
  - Add validated Open in VS Code, Copy for Pi, and pinned GitHub actions.
  - Add source-reference verification to the build path.

- [x] **4. Author the first complete learning slice**
  - Teach what Ghostty is, why terminals matter, the historical-to-modern big picture, and how to use the camp.
  - Add browser comparisons, a clickable architecture explorer, prediction/reveal interactions, vocabulary, source trail, official references, and explain-back.
  - Make progress resumable and provide a clear handoff to the next future lesson.

- [x] **5. Integrate the Pi teacher and validate the complete journey**
  - Update agent guidance for the now-runnable cockpit and first lesson.
  - Add resume and wrap-up state files/prompts.
  - Run unit/static checks, production build, CLI checks, and visual browser verification.

## Definition of done

- `./camp doctor`, `./camp status`, `./camp build`, and `./camp serve` work.
- The local dashboard is polished, responsive, and backed by durable progress.
- The first lesson is complete enough to begin learning immediately.
- Lesson source links resolve against the pinned Ghostty checkout.
- Pi can inspect the durable state and direct the learner to the correct page.
- The production site builds without errors.
- All sprint commits are pushed to `main`.

## Hiccups & Notes

- VitePress 1.6.4 currently carries a nested development-server `esbuild` advisory with no upstream fix in the stable release. `npm audit --omit=dev` reports zero production vulnerabilities. The development server is deliberately bound to `127.0.0.1`, which also matches the advisory's recommended exposure boundary.
- Planned lessons originally appeared as sidebar links and would have produced 404 pages. They are now visible as intentionally unlinked `NEXT`/`PLANNED` entries until their complete vertical slices exist.
- Visual verification used an isolated 1050×980 Chrome window. The dashboard hierarchy, lesson hero, navigation, responsive grid, typography, and dark/lime visual system rendered correctly.
- API verification covered durable progress updates, allowlisted lab execution, source reads, and rejection of source path traversal. The learner state was restored to its clean starting point afterward.
- Final checks passed: `./camp doctor`, `./camp next`, `npm run check`, source security checks, and the VitePress production build.
- Lesson 00 is ready at `http://127.0.0.1:4173/lessons/00-ghostty-overview`. Its reading checkpoint reaches 100% completion, while mastery remains reserved for the Pi-guided explain-back.
