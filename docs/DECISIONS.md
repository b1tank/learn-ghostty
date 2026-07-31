# Design decisions

## Accepted defaults

- Primary use is local and single-learner.
- The browser is the visual learning environment; Pi remains the only AI chat interface.
- Markdown is the primary lesson authoring format, enhanced with interactive UI components.
- VitePress and Vue are the preferred documentation/UI foundation.
- Preserve VitePress's official documentation chrome: navigation, local search, headings and permalink anchors, sidebar, outline, typography, focus treatment, and light/dark appearance control. The initial `auto` state may follow the OS, but do not maintain custom framework UI unless a future lesson creates a concrete need.
- Scope custom styles to Learn Ghostty components (`.cockpit-*`, `.lesson-*`, `.architecture-*`, `.journey-*`, `.source-*`, or `.lg-*`). Avoid generic selectors such as `.button`, global form focus rules, and unscoped `.vp-doc`/`.VP*` overrides.
- Let VitePress own its compatible Vite and Vue plugin versions. Keep Vue as a direct dependency for course components, but do not separately install Vite or `@vitejs/plugin-vue` without a demonstrated build requirement.
- Mermaid handles ordinary diagrams; Canvas, SVG, or WebGL handle richer visualizers.
- A small Node service handles progress, source navigation, and allowlisted native labs.
- No cloud service, account, or database is required.
- Learner state is stored in ordinary JSON and Markdown files and may be committed.
- Ghostty is pinned as a git submodule so source trails are reproducible.
- Primary runnable platform is Linux/GTK/OpenGL.
- macOS/SwiftUI/Metal receives a complete conceptual track and runnable material where the host permits it.
- C is used first when it exposes fundamentals cleanly; Zig follows for production-source fluency.
- Pi integration uses `AGENTS.md` and a project skill as the foundation. Prompt templates and a small extension add convenience but are not required.
- Course completion and demonstrated mastery are separate metrics.
- The site never embeds a second AI conversation.
- Native lab execution is allowlisted; the browser cannot submit arbitrary shell commands.
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
