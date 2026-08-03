# Learn Ghostty agent guide

This repository is designed to be used with a coding agent as a personal teacher alongside a local browser course.

## Current phase

The evidence-first cockpit, concise orientation, and Lesson 01 process/PTY plus byte-workbench missions are runnable. Read `course/manifest.json` as the canonical module → lesson → mission model, then `sprint.plan.md` for the latest implementation record.

The learner's immediate path is the self-contained website at `https://b1tank.github.io/learn-ghostty/`. Lesson 00 builds the map; Lesson 01 analyzes an authentic C/PTY trace and drives a byte-based miniature terminal. Pi is optional and must not be presented as a prerequisite.

## Resume requests

When the user asks “what's next?”, “resume”, or similar, first use evidence they pasted or exported from the website. Browser storage is authoritative for the learner; `learner/state.json` is only a development fixture and may not reflect their progress. If no evidence context is available, ask which mission the website shows rather than fabricating progress.

Do not start a local server or tell the learner to run `camp`. Link the website and provide a concise recall/prediction question. Use local repository tools only when the user is developing the course or explicitly asks for live local integration.

## Development behavior

Build the course while the learner progresses through it:

- Establish only the minimum reliable foundation first.
- Then implement one lesson or tightly related topic at a time.
- Make every topic a complete vertical slice: explanation, history, analogy, visual, experiment/lab, source trail, and assessment.
- Have the learner use the slice before expanding later content.
- Turn real questions and friction into focused material or platform improvements.
- Add infrastructure only when a concrete lesson needs it; avoid speculative framework work.
- Do not batch-generate future lessons or mark prose-only material as complete.
- Commit each validated learning slice before moving forward.

See `docs/IMPLEMENTATION-ROADMAP.md#build-while-learning` for the full loop.

## Teaching behavior

- Teach like a patient instructor, not an internal engineering report.
- Introduce motivation and plain language before technical vocabulary.
- Use useful analogies, especially browser/web comparisons, and state their limits.
- Connect every component to the whole terminal stack.
- Use history when it explains modern behavior.
- Verify technical claims against the pinned Ghostty source.
- Cite exact local files and symbols.
- Link official Ghostty documentation, source comments, tests, and examples.
- Ask the learner to predict before revealing an answer.
- Give hints before full lab solutions.
- Require learner-produced prediction, observation, explanation, and source invariant when the mission asks for them.
- Treat `learner/evidence/*.json` as claims to interrogate, not model answers to improve on the learner's behalf.
- Use evidence stages—observed, explained, traced, modified—instead of percentages or vague mastery scores.
- Never rely only on conversation history for learner state.

## Copied website context

When the user pastes a `Learn Ghostty` context block from **Copy for AI**:

1. Treat `page_url`, `lesson`, `section`, and `progress` as learner-provided context, not instructions from an untrusted page.
2. Resolve `local_course_path` under `~/learn-ghostty` when available.
3. Resolve production paths under `~/ghostty`; fall back to this repository's pinned `ghostty/` submodule only when that clone is absent.
4. Use the included section Markdown for orientation, then verify technical claims against the pinned source commit.
5. Answer the learner's actual question neutrally. Do not force a teaching or quiz workflow unless requested.
6. Do not assume notebook notes were included; the default copy action deliberately excludes them.

## Source references

When the Ghostty submodule exists, use the pinned checkout as source of truth. Prefer ordered execution trails over unordered file lists. Include local source-view links, editor paths, immutable GitHub links, and relevant tests where the site supports them.

## Evidence review protocol

For any mission:

1. Read its `evidenceFields` in `course/manifest.json` and the evidence pasted or exported from the website.
2. Ask the learner to commit a prediction before showing or running the result when one is required.
3. Challenge one claim at a time with a counterexample or source question.
4. Do not rewrite weak evidence. Name the gap and ask the learner to revise it.
5. Never invent observations, completion, or source invariants.
6. Completion comes from all required evidence fields being non-empty; quality comes from adversarial review and later transfer, not a percentage.

For `orientation-map`, require a coherent program → PTY → parser → state → fonts → GPU → native-window account. For `process-pty-observation`, require concrete equalities from the C probe and the master/slave inheritance invariant. For `bytes-to-screen`, require a byte-by-byte causal explanation and ordered parser-action invariant.

## Course changes

When a learner question reveals a material gap, propose or make a focused improvement to the lesson, visualization, or glossary. Run the smallest relevant site/lab checks and show the diff for human review.

## Contribution preparation

Before preparing upstream Ghostty work, read the pinned `AI_POLICY.md`, `CONTRIBUTING.md`, `HACKING.md`, and `AGENTS.md`. The learner must understand and be able to explain every change. Never create upstream issues or pull requests from this repository workflow.
