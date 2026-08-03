# Follow-ups

The Astro migration is deployed and has no launch blockers. These are the remaining product and content follow-ups, ordered by learner value.

## Content

1. Build the seven planned deep dives while learning:
   - VT parsing
   - terminal state and scrollback
   - threads and I/O
   - Unicode, fonts, glyph atlases, and GPU rendering
   - input, IME, GTK, Wayland, and X11
   - SwiftUI, AppKit, CoreText, and Metal
   - debugging and responsible contribution
2. Work through every published scenario as a new learner and record confusing terminology, missing data boundaries, incorrect assumptions, pacing problems, weak analogies, and source excerpts that are too broad or too narrow.
3. Seek technical review for platform-specific and protocol-specific claims as the relevant deep dives are built.

## Product

1. Upgrade metadata-only lesson search to full-text static search after enough content exists to justify the index.
2. Replace temporary text glyphs used for header actions with a consistent accessible icon set.
3. Add a clipboard-denied fallback that presents selectable AI context and explicit recovery instructions.
4. Bundle referenced source excerpts at build time so the inline source viewer does not depend on `raw.githubusercontent.com`; retain pinned GitHub links as the authoritative remote reference.
5. Consider migration from obsolete experimental browser-progress keys only if real learners report losing useful progress. The current store intentionally starts clean rather than carrying forward mission/evidence concepts that no longer exist.

## Quality gates

For every release:

- run content/source validation;
- run browser audits across themes and responsive widths;
- build with the GitHub Pages base path;
- verify production dependencies;
- confirm the public deployment serves Astro assets, lesson routes, and AI Markdown routes.
