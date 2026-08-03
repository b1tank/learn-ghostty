# Sprint plan — Astro migration and scenario-first curriculum

## Sprint goal

Replace VitePress with a thin Astro learning site, remove stale LMS/evidence architecture, and rebuild the opening curriculum around complete real-user data-flow scenarios: Ghostty startup plus `ls`/`cat`, Codex as a long-running TUI, tmux nesting, and SSH/remote tmux.

## Prioritized tasks

- [x] **1. Establish the Astro foundation with route parity**
  - Add Astro static output, MDX content collections, Vue islands, GitHub Pages base support, shared layouts, default navigation, theme behavior, and search.
  - Preserve `/`, `/course-map`, `/source`, `/lessons/<slug>`, and `/ai/lessons/<slug>.md`.
  - Reuse only interactive components that still earn their cost.

- [x] **2. Replace the old curriculum model with content collections**
  - Make lesson frontmatter the source of truth for roadmap, sidebar, previous/next navigation, source references, status, duration, and search metadata.
  - Create four published scenario lessons and seven planned deep-dive entries.
  - Remove the duplicated manifest, mission hierarchy, evidence state, local API, and learner fixtures.

- [x] **3. Build the simple homepage and browser progress**
  - Explain what the course is, how to use it, who it serves, what it covers, and the real-human contributor path.
  - Show the full roadmap and returning exact-section resume.
  - Keep automatic section tracking, explicit completion, export, and restart-with-backup only.

- [x] **4. Implement robust lesson chrome and Copy for AI**
  - Add breadcrumbs, sidebar, on-page outline, previous/next, mark complete, and responsive lesson layout.
  - Keep current-section Copy for AI with a collision-aware body portal, clean Markdown endpoints, local/remote source paths, and vendor-neutral context.
  - Keep AI optional and notes out of the product.

- [x] **5. Author Lesson 00 — Ghostty startup, `ls`, and `cat`**
  - Walk Ubuntu/Bash/OpenGL and macOS/zsh/Metal branches from app launch through PTY creation, shell startup, prompt, keyboard input, command parsing, process execution, ANSI output, terminal state, fonts, GPU, compositor, and pixels.
  - Label the data type on every boundary and introduce jargon only after the job is understood.

- [x] **6. Author Lesson 01 — Codex as a long-running TUI**
  - Separate terminal UI bytes from model/network/tool data.
  - Explain raw mode, alternate screen, redraw, cursor/style output, resize, paste, and long-running process state through the user scenario.

- [x] **7. Author Lesson 02 — tmux panes and sessions**
  - Explain client/server, pane PTYs, nested terminal parsing, split-screen composition, input routing, detach/reattach, copy mode, and resize propagation.

- [x] **8. Author Lesson 03 — SSH and remote tmux**
  - Trace keyboard and output across local PTY, ssh process, encrypted transport, sshd, remote PTY, remote shell, and optional remote tmux/panes.
  - Separate local and remote kernels, processes, terminal state, rendering, and latency.

- [x] **9. Add reusable scenario pedagogy and source references**
  - Build a reusable data-flow walkthrough component and sports-broadcast analogy callouts with explicit analogy limits.
  - Add pinned remote GitHub links, `~/ghostty` paths, official docs, and narrow “read this / ignore that / answer this” source guidance.

- [x] **10. Remove stale architecture and verify publication**
  - Delete VitePress, local-server, mission/evidence, obsolete components, duplicated plans, and stale design documents.
  - Replace them with current Astro architecture, content guide, and roadmap docs.
  - Rewrite browser audits for Astro routes, first/return visits, section resume, completion/reset, copy menu containment, clean Markdown, source actions, themes, mobile/desktop, and public base path.

## Definition of done

- Astro is the only site framework and GitHub Pages builds `dist/`.
- Four scenario-first lessons are published and readable without tests or notebooks.
- Homepage and lessons require only a browser; AI is optional.
- Browser progress is limited to last section and completed lessons.
- Copy for AI is bounded, accessible, vendor-neutral, and generated from clean Markdown.
- Old VitePress/LMS/local-server design is removed rather than left stale.
- Full static build, source validation, UI audit, and production dependency audit pass.

## Hiccups & Notes

- Astro 7.1.6 uses the content loader API in `src/content.config.ts`; lesson frontmatter now replaces the duplicated JSON manifest and VitePress sidebar configuration.
- Reusing the Vue Copy for AI island under server rendering caused a hydration mismatch because its teleported menu has no identical SSR tree. `LessonTools` now uses `client:only="vue"`, keeping lesson HTML fully static while mounting the toolbar safely on the client.
- Vue islands marked `client:visible` are not interactive until scrolled into view. Browser audits now scroll the walkthrough into view before testing step selection.
- The old dev server had to be stopped before Astro could own port 4173. No learner-facing local server remains in the product architecture.
- Four scenario lessons now cover startup/ls/cat, Codex, tmux, and SSH/remote tmux. Seven deeper lessons remain visible and unlinked until built while learning.
- The reusable walkthrough labels actor, data in, transformation, data out, and sports-broadcast analogy at every step. Every lesson includes an explicit analogy-limit section.
- VitePress, its theme overrides, local API, `camp`, mission/evidence state, native-lab runner, duplicated manifest, learner fixtures, and obsolete design documents were deleted rather than left stale.
- Final Astro audit passes 101 assertions across seven routes, two themes, three viewport widths, first/return progress, explicit completion/reset, collision-aware Copy for AI, search, and interactive scenarios.
- Public-base build emits all assets and lesson links under `/learn-ghostty/`; production dependencies report zero vulnerabilities.
