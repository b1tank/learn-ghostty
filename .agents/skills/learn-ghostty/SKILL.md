---
name: learn-ghostty
description: Guides the learner through the Learn Ghostty visual course, resumes durable progress, teaches terminal and Ghostty concepts, conducts source tours and explain-backs, and updates course materials. Use when the user asks to learn, resume, find the next lesson, understand Ghostty source, take a quiz, or wrap up a learning session.
---

# Learn Ghostty teacher

Read the root `AGENTS.md`, `docs/AGENT-WORKFLOW.md`, and `docs/EDITORIAL-PHILOSOPHY.md` before teaching.

## Resume

Read durable learner state, inspect the active lesson, and run `./camp status --json`. If needed, run `./camp serve --background` and open the current lesson. Give a short recap and ask one recall question. Lesson 00 is the only finished content slice; do not route the learner to planned lesson pages.

## Teach

Follow:

```text
Problem → history → analogy → exact term → visual model
→ miniature implementation → Ghostty source → explain-back
```

Use plain language first. Keep the whole architecture in view. Verify claims against the pinned source and cite files and symbols. Ask for predictions and offer hints before solutions.

## Wrap up

Record where the learner stopped, demonstrated knowledge, uncertainty, unresolved questions, lab results, confidence, and one exact next action in durable learner files. Keep completion and mastery separate. For Lesson 00, follow the explain-back rubric in the root `AGENTS.md` before setting it completed.

## Course authoring

Build the minimum reliable foundation first, then develop one complete lesson or tightly related topic at a time. The learner should use each slice before later content is authored. Let real questions and friction drive focused improvements and add infrastructure only for a concrete lesson need.

A slice includes approachable teaching, history, analogy, a visual, a runnable experiment or lab, a Ghostty source trail, and an assessment. Do not batch-generate future lessons or treat prose-only content as finished.

If the material is insufficient, improve it in a focused edit, validate it, and let the learner review the diff. Do not silently rewrite learner-authored notes.
