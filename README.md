# Learn Ghostty

A local, visual, learn-by-doing course for understanding Ghostty from terminal fundamentals to contribution-ready architecture knowledge.

This repository is currently in its **design phase**. The detailed product and curriculum plans live in [`docs/`](docs/README.md).

## The intended experience

```console
cd ~/learn-ghostty
pi
```

Then ask:

> What's next?

Pi reads durable course progress, reminds the learner where they stopped, starts the local learning site, and opens the current lesson. The learner uses a polished browser UI for explanations, diagrams, interactive experiments, runnable labs, progress, and links into a pinned local Ghostty checkout. Pi remains alongside as a patient teacher for questions, source tours, quizzes, debugging, and improvements to the course itself.

The browser is the **learning cockpit**, Pi is the **teacher**, Ghostty's source is the **textbook**, durable files are the **memory**, and Git is the **history**.

## Design documents

- [Product and experience](docs/PRODUCT.md)
- [Teaching and editorial philosophy](docs/EDITORIAL-PHILOSOPHY.md)
- [System architecture](docs/SYSTEM-DESIGN.md)
- [Two-week curriculum](docs/CURRICULUM.md)
- [Agent-assisted workflow](docs/AGENT-WORKFLOW.md)
- [Implementation roadmap](docs/IMPLEMENTATION-ROADMAP.md)
- [Design decisions](docs/DECISIONS.md)

## Target learner

The initial learner is a senior software engineer with a C background and broad systems knowledge, but no assumed experience with:

- terminal-emulator internals;
- Zig;
- GPU rendering, OpenGL, or Metal;
- GTK/GNOME;
- Swift or SwiftUI.

The material intentionally teaches like a patient instructor rather than writing like an internal engineering report. Technical vocabulary is necessary, but every important term should be motivated, visualized, connected to the larger system, and accompanied by a useful analogy.

## Ambition and honesty

A one- or two-week camp cannot reproduce years of maintainer judgment. It can build a dependable end-to-end mental model, make the codebase navigable, establish practical debugging habits, and prepare the learner to begin credible contributions. Long-term maintainer-level understanding comes from repeated issue investigation, code review, performance work, and subsystem rotation after the camp.

## Status

- [x] Product vision and detailed design
- [ ] Learning cockpit prototype
- [ ] First three vertical-slice lessons
- [ ] Full two-week critical path
- [ ] Advanced electives and maintainer ascent track
