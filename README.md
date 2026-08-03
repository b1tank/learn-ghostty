# Learn Ghostty

A self-contained visual, learn-by-doing website for understanding Ghostty from terminal fundamentals to contribution-ready architecture knowledge.

## The intended experience

Open **https://b1tank.github.io/learn-ghostty/** and start. No clone, local server, CLI, or agent is required.

The website includes lessons, causal browser workbenches, normalized traces captured from real native experiments, pinned Ghostty source, a private evidence notebook, exact resume, and exportable progress. Evidence stays in browser storage unless you export it.

AI is optional. Whenever you want another perspective, use **Copy for AI** and paste the current section into Pi, Claude, ChatGPT, Codex, Copilot, Cursor, a local LLM, or another agent. The website remains complete without an AI; an AI can add adversarial questioning and open-ended source exploration.

The browser is the **learning cockpit**, Ghostty's pinned source is the **textbook**, learner-authored progress is the **memory**, and an AI can be an optional **teacher at your side**.

## Start here

Lesson 00, **Ghostty: the whole machine**, is a concise orientation. Lesson 01, **The terminal is a relationship**, is the first evidence-producing lesson: compare an authentic no-PTY/PTY trace and drive a miniature terminal one byte at a time.

The native PTY trace is bundled and normalized, so the mission works on any browser. If a contributor already runs the optional local development service, the same page automatically offers a live probe and editor integration. Those enhancements are never prerequisites.

## Optional contributor setup

Only contributors changing the course need the repository and development server:

```console
git submodule update --init
npm install
npm run dev
```

Validation commands:

```console
npm run check
npm run audit:ui
npm run build
```

## Design documents

- [Product and experience](docs/PRODUCT.md)
- [Teaching and editorial philosophy](docs/EDITORIAL-PHILOSOPHY.md)
- [System architecture](docs/SYSTEM-DESIGN.md)
- [Two-week curriculum](docs/CURRICULUM.md)
- [Agent-assisted workflow](docs/AGENT-WORKFLOW.md)
- [Implementation roadmap](docs/IMPLEMENTATION-ROADMAP.md)
- [Design decisions](docs/DECISIONS.md)

## Target learner

The initial learner is a senior software engineer with a C background and broad systems knowledge—including real humans who want to become responsible Ghostty ecosystem contributors—but no assumed experience with:

- terminal-emulator internals;
- Zig;
- GPU rendering, OpenGL, or Metal;
- GTK/GNOME;
- Swift or SwiftUI.

The material intentionally teaches like a patient instructor rather than writing like an internal engineering report. Technical vocabulary is necessary, but every important term should be motivated, visualized, connected to the larger system, and accompanied by a useful analogy.

## Build while learning

Development follows the learner rather than preceding them. We first create the minimum reliable learning cockpit, then build one complete lesson or topic at a time. The learner immediately uses that slice; questions and friction improve the material before work moves forward. Optional AI review is useful but never required.

A topic is only complete when it combines approachable teaching, historical motivation, analogy, visual explanation, a runnable experiment, Ghostty source references, and an understanding check. Infrastructure is added only when a real lesson needs it.

## Ambition and honesty

A one- or two-week camp cannot reproduce years of maintainer judgment. It can build a dependable end-to-end mental model, make the codebase navigable, establish practical debugging habits, and prepare the learner to begin credible contributions. Long-term maintainer-level understanding comes from repeated issue investigation, code review, performance work, and subsystem rotation after the camp.

## Status

- [x] Product vision and detailed design
- [x] Minimum learning cockpit foundation
- [x] Lesson 00: concise Ghostty orientation
- [x] Lesson 01: process/PTY observation and byte workbench
- [ ] First three vertical-slice lessons
- [ ] Full two-week critical path
- [ ] Advanced electives and maintainer ascent track
