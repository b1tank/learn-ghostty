# Sprint plan — trace-driven learning redesign

## Sprint goal

Turn Learn Ghostty from a polished course brochure into an evidence-producing systems workbook. The teaching bar is: intuition as clear as Andrew Ng, code-first causal understanding as direct as Andrej Karpathy, and source fidelity strong enough to prepare a real Ghostty contributor.

## Prioritized tasks

- [x] **1. Establish one canonical learning model**
  - Define modules → lessons → missions in `course/manifest.json`.
  - Generate navigation and course-map UI from that model.
  - Replace percentage-centric state with evidence stages: observed, explained, traced, modified.
  - Add a safe, durable evidence API and notebook files.

- [x] **2. Replace the marketing dashboard with a learner cockpit**
  - Lead with the exact current mission and next action.
  - Show what the learner last proved, open questions, evidence collected, and the evolving system map.
  - Remove empty mastery theater, oversized slogan treatment, and duplicated course structures.

- [x] **3. Compress Lesson 00 into a sharp orientation**
  - Reduce it from a nominal 55-minute article to a 12–15 minute map.
  - Preserve the terminal/shell/application/PTY distinction and whole-system story.
  - Remove ceremonial interactions and broad source-file dumping.
  - End with one concrete trace question and a direct handoff to the first real lesson.

- [x] **4. Build a real process-and-PTY observation mission**
  - Add a small C probe that reports PID, parent, session, process group, foreground process group, TTY identity, and whether stdin/stdout are terminals.
  - Run it inside a newly allocated PTY through an allowlisted lab.
  - Teach the physical-terminal-to-PTY history through evidence the learner just observed.
  - Provide narrowly scoped Ghostty source excerpts and explicit questions.

- [x] **5. Build an input-driven byte-to-screen workbench**
  - Let the learner predict and step through printable bytes, carriage return, backspace, and SGR color.
  - Show byte values, parser interpretation, cursor movement, style state, and grid mutation.
  - Make the simulation causal and editable rather than a timed sequence of static prose.
  - Tie each toy behavior to the corresponding Ghostty parser/state boundary.

- [x] **6. Make progress require learner-produced evidence**
  - Add prediction, observation, explanation, and source-invariant notebook fields.
  - Save evidence atomically and display evidence stages on the dashboard.
  - Update Pi guidance to question the learner from saved evidence rather than award subjective percentages.
  - Keep completion and evidence distinct.

- [x] **7. Audit the redesigned learning journey**
  - Verify dark/light, mobile/desktop, keyboard, reduced-motion, error, and persistence behavior.
  - Exercise the C PTY probe and byte workbench end to end.
  - Run course checks, source security, UI audit, production build, and production dependency audit.

## Definition of done

- A new learner can complete a concise orientation and immediately perform a real systems observation.
- The first real lesson produces saved evidence, not a clicked completion percentage.
- The byte workbench executes a real miniature state machine controlled by the learner.
- Dashboard, sidebar, course map, Pi, and progress all derive from one learning model.
- Source tours specify exactly what to read, what to ignore, and what invariant to find.
- All checks pass and atomic commits are pushed to `main`.

## Hiccups & Notes

- The host has `cc` and util-linux `script` but no `zig` executable on PATH. The first native mission intentionally uses the learner's familiar C toolchain and treats warnings as errors. Later Zig work remains a dedicated lesson.
- The PTY probe runs the exact same binary once under ordinary captured I/O and once under a newly allocated PTY. This made terminal identity, session leadership, process groups, and foreground process groups observable without pretending the course server is the learner's interactive shell.
- Evidence API testing temporarily completed `orientation-map`; the original learner state was backed up and restored, and the test evidence file was removed. The learner remains at the untouched starting point.
- VitePress configuration and manifest changes require a dev-server restart. One audit run initially observed stale CSS; restarting the server removed those false failures. The final audit ran against a fresh server.
- Responsive audit found mission panels inheriting a min-content width from their evidence ladder at 390/420 px. Grid tracks and panels now use `minmax(0, …)`/`min-width: 0`, and all audited widths pass without horizontal overflow.
- Final browser audit passes 168 assertions across two themes, six routes, five widths, framework boundaries, native PTY execution, the byte workbench, reduced motion, evidence persistence, and recovery states.
- Deskpal visual verification confirmed the evidence-first dashboard and Lesson 01 in real Chrome at 1400×950. The learner state remains `orientation-map / not_started`.
