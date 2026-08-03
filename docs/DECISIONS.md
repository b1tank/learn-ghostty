# Design decisions

## Accepted defaults

- Primary use is the self-contained GitHub Pages website. A learner needs only a browser; cloning, a local server, CLI commands, and Pi are optional enhancements.
- The browser is the complete learning environment. Any AI, LLM, or coding agent may be an optional external teacher for adversarial questioning and open-ended exploration, never a navigation or persistence dependency.
- Markdown is the primary lesson authoring format, enhanced with interactive UI components.
- VitePress and Vue are the preferred documentation/UI foundation.
- Preserve VitePress's official documentation chrome: navigation, local search, headings and permalink anchors, sidebar, outline, typography, focus treatment, and light/dark appearance control. The initial `auto` state may follow the OS, but do not maintain custom framework UI unless a future lesson creates a concrete need.
- Scope custom styles to Learn Ghostty components (`.cockpit-*`, `.lesson-*`, `.architecture-*`, `.journey-*`, `.source-*`, or `.lg-*`). Avoid generic selectors such as `.button`, global form focus rules, and unscoped `.vp-doc`/`.VP*` overrides.
- Let VitePress own its compatible Vite and Vue plugin versions. Keep Vue as a direct dependency for course components, but do not separately install Vite or `@vitejs/plugin-vue` without a demonstrated build requirement.
- Mermaid handles ordinary diagrams; Canvas, SVG, or WebGL handle richer visualizers.
- Browser localStorage tracks the last viewed section, explicitly completed lessons, and optional notebook evidence. Section resume is automatic; completion is always an ungated personal bookmark.
- Restart progress requires confirmation and offers an export backup before deletion. No cloud service, account, database, or local daemon is required.
- A small Node service may enhance development checkouts with live native labs, local source access, and editor integration. The website must detect it opportunistically and remain complete when it is absent.
- Native experiments required for understanding ship with clearly labeled, normalized reference traces captured from checked-in probes. A live run may appear as an optional enhancement but cannot gate a mission.
- Ghostty is pinned as a git submodule so source trails are reproducible.
- Primary runnable platform is Linux/GTK/OpenGL.
- macOS/SwiftUI/Metal receives a complete conceptual track and runnable material where the host permits it.
- C is used first when it exposes fundamentals cleanly; Zig follows for production-source fluency.
- AI integration is vendor-neutral. The primary Copy for AI action copies the current section with clean Markdown, URL, compact progress, pinned source, `~/learn-ghostty`, `~/ghostty`, and an empty question field. Notebook answers are excluded unless the learner explicitly chooses the notes-inclusive action.
- Every published lesson is freely accessible from the roadmap. Prerequisites recommend an order but never enforce locks.
- Project `AGENTS.md` and skills improve local-agent behavior but are not required by the website.
- The canonical hierarchy is modules → lessons → missions. Homepage, sidebar, course map, optional agents, and learner state derive from `course/manifest.json`.
- Mission progress is evidence-based: prediction, observation, explanation, and source invariant produce stages such as observed, explained, traced, and modified. Do not display mastery percentages.
- Browser simulations must be input-driven, expose internal state, and state their limits. A timed sequence of static explanations is not a lab.
- The site never embeds a second AI conversation.
- Optional live native lab execution is allowlisted; the browser cannot submit arbitrary shell commands.
- Course development is learning-led: build the minimum foundation, then complete, use, and refine one lesson or topic before starting the next.
- Infrastructure is introduced only for a concrete learner-facing need; speculative platform work and batch-generated future content are avoided.
- A lesson is a vertical slice and is not complete unless its teaching, visual, runnable, source-reference, and assessment parts work together.

## Source snapshot used during initial design

The design was informed by Ghostty at:

```text
6ad1fe7d8cbda36c77b337a96c9bea8a77883699
```

The implementation should pin an explicit upstream commit and record it in the course manifest. Updating the pin is a deliberate migration with source-link validation.

## Open questions for prototype validation

- Is VitePress sufficiently flexible for the desired dashboard and lesson state, or should a small dedicated Vue application wrap it?
- Should learner progress be committed by default or ignored with an explicit opt-in?
- Which browser-opening mechanism is most reliable in the target environment?
- Should browser-native Zig use WASM in the first release or wait until native labs are stable?
- How much Pi extension UI adds value beyond `AGENTS.md`, the project skill, and slash templates?
- How should explain-back assessments be represented so they remain human-readable and easy for Pi to update?

These should be decided through the three-lesson cockpit prototype, not abstract debate.
