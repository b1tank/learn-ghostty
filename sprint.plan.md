# Conversational code-first chapter sprint

Goal: rewrite every published reconstruction chapter (00–10) as a friendly teacher-led source walkthrough for a freshman who knows basic C, while preserving exact checkpoints, observable evidence, provenance, and historical/current Ghostty comparisons.

## Teaching contract

- Sound like a teacher sitting beside the student: “let’s open this file,” “here is why we need it,” and “in C you may have seen…”.
- Start with the small problem the current checkpoint is solving before naming architecture.
- Follow source in the order a student would naturally explore it: entrypoint → referenced declaration → called function → owner → build details.
- Explain why a type or lifecycle function exists before explaining its syntax.
- Use short paragraphs, concrete values, and small C comparisons. Avoid policy/report language and unexplained jargon.
- Keep exact commands, output, screenshots, checkpoint tags, fidelity labels, and then → reconstruction → now evidence.
- Keep each chapter inside its existing implementation frontier; do not pull future systems backward.

## Tasks

- [ ] Chapter 00: conversationally discover the first Zig process and build graph.
- [ ] Chapter 01: conversationally follow App create → init → run → destroy and explain why each lifecycle step exists.
- [ ] Chapter 02: retone the new source-following router walkthrough as an oral freshman lesson.
- [ ] Chapter 03: pivot to a source-following runtime/App/Surface ownership walkthrough.
- [ ] Chapter 04: pivot to a source-following child-process and ordinary-pipes walkthrough.
- [ ] Chapter 05: pivot to a source-following PTY and C-ABI walkthrough.
- [ ] Chapter 06: pivot to a source-following Termio ownership and incremental-I/O walkthrough.
- [ ] Chapter 07: pivot to a source-following parser state-machine walkthrough.
- [ ] Chapter 08: pivot to a source-following terminal-grid walkthrough.
- [ ] Chapter 09: pivot to a source-following GTK window walkthrough.
- [ ] Chapter 10: pivot to a source-following OpenGL rectangle walkthrough.
- [ ] Update the contributor-facing teaching guidance to preserve the conversational code-first tone.
- [ ] Run `npm run check` and `npm run build`, then deploy after the required public-write identity check and immediate confirmation.

## Hiccups & Notes

- “All chapters” is scoped to the eleven published reconstruction chapters, 00–10. Chapter 11 remains a planned frontier rather than invented lesson content.
- Browser audit tooling was removed in the previous sprint at the learner’s request; validation for this sprint is the static course check and production build.
- Public deployment still follows the repository policy requiring identity verification and immediate confirmation of the exact push, even though all local sprint work proceeds without pauses.
