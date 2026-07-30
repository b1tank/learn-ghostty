# Implementation roadmap

## Strategy

Build vertical slices that prove the actual learning experience. Do not author the entire curriculum before validating resume, browser learning, source navigation, lab execution, explain-back, and wrap-up.

Estimated full scope is substantial: roughly 80–120 content/code files and 8,000–12,000 lines across Markdown, TypeScript/Vue, C, Zig, shaders, diagrams, and scripts.

## Build while learning

The course is developed **on the go**, in the same order it is learned.

First build only the minimum dependable foundation: the dashboard, durable progress, local server, source navigation, safe lab runner, and Pi resume/wrap-up workflow. Do not build a large generic platform in anticipation of lessons that do not exist yet.

After that, work one lesson or tightly related topic at a time. Each increment must be a complete learning experience:

```text
approachable explanation + history + analogy + visual
+ experiment or lab + Ghostty source trail + assessment
```

The learner should use each lesson immediately. Questions, confusion, and friction discovered during real learning become input to the next course commit. Infrastructure grows only when a concrete lesson requires it, and a topic is not considered built if it has only prose, only UI, or only a lab.

The working loop is:

1. Choose the learner's next concept.
2. Build the smallest missing capability needed to teach it well.
3. Complete one end-to-end lesson.
4. Learn through that lesson with Pi.
5. Record confusing points and usability friction.
6. Improve the lesson and foundation.
7. Commit the finished slice, then move to the next concept.

This keeps course construction aligned with actual understanding and makes the repository useful long before the full curriculum is complete.

## Milestone 1 — Learning cockpit prototype

Prove the end-to-end loop with only three lessons.

### Deliverables

- Local repository and pinned Ghostty submodule.
- Attractive dashboard.
- Durable progress and journal storage.
- `./camp doctor`, `status`, `serve`, and `open`.
- Root `AGENTS.md` and project skill.
- Optional Pi status/command extension.
- Browser source viewer.
- Open-in-VS-Code action.
- Lessons:
  1. What a terminal emulator is.
  2. PTY byte flow.
  3. VT parser state machine.
- C PTY lab.
- Interactive parser visualizer.
- Explain-back checkpoint.
- Wrap-up and fresh-session resume.

### Acceptance journey

1. Start Pi in a fresh session.
2. Ask “what's next?”
3. Pi reads progress and opens the correct page.
4. Complete a visual interaction and native lab.
5. Ask Pi a contextual question.
6. Complete an explain-back.
7. Wrap up and close everything.
8. Start another fresh session.
9. Resume at the exact correct point.

The milestone passes only if this feels seamless.

## Phase breakdown

P1–P5 establish only the minimum reusable foundation. From P6 onward, phases are learner-facing topic slices and should be implemented, used, refined, and committed one at a time. Do not batch-author later topics before the current lesson has been learned and validated.

- [ ] **P1 — Repository skeleton and pinned source**
  Establish licensing, submodule, manifests, learner schema, source-reference conventions, and basic CI.

- [ ] **P2 — Course CLI and local service**
  Implement doctor/status/serve/open, safe lab execution, state API, bounded output, and health checks.

- [ ] **P3 — Site shell and dashboard**
  Add VitePress/Vue, navigation, timeline, dual progress metrics, question list, and architecture map shell.

- [ ] **P4 — Source navigation**
  Add browser viewer, validated editor opening, Pi copy references, pinned GitHub links, and link/symbol checks.

- [ ] **P5 — Agent workflow**
  Finalize `AGENTS.md`, skill, prompts, wrap-up protocol, and optional footer/commands extension.

- [ ] **P6 — Orientation vertical slice**
  Build history-first terminal overview, whole-stack visual, source trail, experiment, and explain-back.

- [ ] **P7 — PTY vertical slice**
  Build historical diagrams, C PTY lab, byte timeline, safe runner integration, and Ghostty source trail.

- [ ] **P8 — Parser vertical slice**
  Build parser stepper, toy implementation, malformed input exercises, production trace, and assessment.

- [ ] **P9 — Prototype user test and redesign**
  Perform the full acceptance journey, record friction, and revise architecture before scaling.

- [ ] **P10 — Zig bridge**
  Add C-to-Zig lessons, ownership labs, comptime examples, and tests.

- [ ] **P11 — Terminal state**
  Add grid/scrollback visualizer, state labs, libghostty-vt examples, selection, and compression introduction.

- [ ] **P12 — Concurrency**
  Add thread timeline, mailbox lab, starvation experiment, and lifecycle source tour.

- [ ] **P13 — Unicode and fonts**
  Add grapheme/shaping/atlas visualizers, fallback labs, and source trails.

- [ ] **P14 — GPU rendering**
  Add WebGL introduction, native OpenGL lab, frame explorer, shaders, and Metal mapping.

- [ ] **P15 — Input and runtimes**
  Add input decision tree, mock runtime, IME exercises, GTK labs, and macOS conceptual/runnable tracks.

- [ ] **P16 — Advanced and cross-cutting systems**
  Add Kitty, search, configuration, shell integration, inspector, crash, WASM, and packaging electives.

- [ ] **P17 — Seeded bugs and capstones**
  Add regression-test exercises, benchmark/fuzzing labs, and contribution-readiness report.

- [ ] **P18 — Polish and release**
  Improve accessibility, offline behavior, responsive UI, cross-platform CI, source migration tooling, and editorial consistency.

## Verification by layer

### Content

- Editorial checklist passes.
- Every term is introduced before use.
- Analogies state limitations.
- Official and source references exist.
- Markdown and links validate.

### Site

- Unit tests for progress and components.
- Browser tests for resume, lab, source, and notes flows.
- Accessibility checks.
- No network required for core content.

### Service

- Path traversal tests.
- Command allowlist tests.
- Timeout/output-limit tests.
- Atomic state update tests.
- Loopback binding checks.

### Labs

- Independent build/test commands.
- Deterministic reset.
- Clear expected outcomes.
- Targeted CI where host capabilities permit.

### Agent

- Fresh-session resume test.
- Missing-state behavior.
- Socratic/hint behavior evaluation.
- Wrap-up correctness.
- No false lesson completion.

## Contribution readiness report

At course end, generate a local inventory of:

- subsystems studied;
- labs and explain-backs passed;
- seeded bugs diagnosed;
- production source explored;
- weak areas and due reviews;
- recommended issue categories;
- official contribution and AI-policy checklist.

It is a readiness inventory, not a certification.
