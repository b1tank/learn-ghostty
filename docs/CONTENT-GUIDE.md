# Content guide

## Reader

Write for an experienced engineer with no assumed knowledge of terminal hardware, PTYs, VT protocols, Zig, font shaping, GPU rendering, GTK, SwiftUI, tmux, or SSH internals.

## Chapter sequence

```text
visible result
→ limitation in the previous checkpoint
→ smallest code delta
→ exact command or action
→ captured output, state, screenshot, or recording
→ explanation of each new boundary
→ historical Ghostty comparison
→ current pinned Ghostty comparison
→ stable chapter tag
```

Do not begin with a glossary, architecture inventory, or finished production implementation. Introduce a subsystem only after the learner can see why the previous version needs it.

## Diagrams and graphs

Every flow involving more than two components, any bidirectional interaction, or any nesting such as tmux/SSH must have a diagram or interactive graph before the detailed explanation.

A useful diagram labels:

- each actor or owner;
- user space, kernel space, hardware, local machine, and remote machine boundaries;
- arrow direction;
- the exact data representation on every edge;
- where parsing, state mutation, composition, encryption, or rendering occurs;
- optional branches such as Linux/OpenGL versus macOS/Metal.

Diagrams are teaching artifacts, not decoration. They must have a textual equivalent, readable contrast, keyboard-accessible interactive states, and a clear statement of any simplification. Prefer version-controlled Astro/SVG/Vue source over opaque screenshots.

Animation should reveal causality rather than add motion for its own sake. Animated flows must start only when visible, expose play/pause/replay and manual steps, pause when the learner takes control, preserve the current state in text, and honor `prefers-reduced-motion` by avoiding automatic motion.

## Visual proof for every implementation step

Every tiny reconstruction step must answer **“what will I see when this works?”** The website and `ghostty-from-scratch` implementation evolve together; a code step is not documented as complete until its observable result is represented on the chapter page.

Use this step anatomy:

```text
Goal
→ code delta or focused snippet
→ exact build/run/user action
→ observable output or state
→ visual proof
→ explanation of why it changed
→ upstream Ghostty comparison
```

Choose the visual that matches the result:

- **CLI or compiler behavior:** a faithful terminal-output panel with the exact command, stdout/stderr, and exit expectation. A screenshot is optional when the text panel is already exact.
- **Parser or state behavior:** an input/output trace, state table, grid visualization, memory/ownership diagram, or animated transition.
- **Timing, concurrency, or I/O behavior:** a sequence diagram or timeline showing owners, thread boundaries, waits, wakeups, and message data.
- **Native window milestone:** a real screenshot from the running reconstruction, beginning with the first blank GTK window.
- **GPU/font/interaction milestone:** before/after screenshots or a short real recording that shows the effect, such as the first colored rectangle, first glyph, cursor blink, resize, selection, or redraw.
- **Failure mode:** the real compiler error, runtime log, broken frame, or incorrect state alongside the corrected result when the failure teaches the boundary.

Visuals must be reproducible and trustworthy:

- capture them from a named `ghostty-from-scratch` commit or chapter tag;
- record the platform, display/backend, command, window size, and relevant configuration;
- use descriptive alt text and a prose equivalent;
- keep source assets and capture scripts version controlled;
- avoid decorative screenshots that do not teach a state transition;
- never use a mockup or AI-generated image as proof of implemented behavior.

Each chapter should open with a **“what you will see”** preview and finish with a **“your result should now look/behave like this”** comparison. When the implementation has no GUI yet, exact terminal output and state diagrams provide that visual feedback.

## Data labels

Name concrete representations: hardware event, platform key event, UTF-8 bytes, command line, argv, filesystem entries, ANSI/ECMA-48 bytes, parser actions, terminal cells, code points, glyphs, atlas textures, GPU buffers, frames, pixels.

## Analogy

Use an analogy only when it makes one unfamiliar boundary easier to predict. State where it stops matching the software. Do not force one course-wide metaphor onto process startup, PTYs, parser state, GPU rendering, and native runtimes when concrete bytes and owners are clearer.

## Source references

Every excerpt states what to read, what to ignore, and the architectural question it answers. Include immutable GitHub and `~/ghostty` paths. Link official Ghostty documentation for authoritative behavior and policy.

Historical source is required for reconstruction chapters, not merely useful context. Follow [the historical reconstruction method](HISTORICAL-METHOD.md): locate the earliest relevant responsibility, validate the exact commit/path/range, explain the pressure behind it, and present **then → reconstruction → now** without projecting current abstractions backward.

## Visual design

Starlight is the product design system. Use its typography, spacing, navigation, search, themes, icons, focus states, and responsive behavior rather than recreating documentation chrome.

Course-specific UI follows these rules:

- body copy is at least 17px on lesson pages with generous line height;
- metadata is never smaller than Starlight's `--sl-text-xs` unless it is truly tertiary;
- use Starlight semantic colors rather than neon brand overrides or decorative gradients;
- use Starlight SVG icons or purpose-built SVGs, never emoji or improvised Unicode glyphs for controls;
- group related information with spacing before adding borders and cards;
- use compact cards, restrained shadows, and one accent color;
- verify all pages in both themes and at 390px, tablet, and desktop widths;
- diagrams should be visually prominent enough to teach, not miniature decorations.

## Layout invariants

Professional UI depends on relationships staying aligned, not on isolated components looking acceptable.

- Sibling cards in the same row must share one top edge and stretch to the same height. Reset prose-flow margins inside grids instead of allowing framework stack spacing to shift later siblings.
- Buttons in one action group must share an explicit height, baseline, padding model, font metrics, and margin reset. Never rely on browser defaults for one control and custom sizing for another.
- Foundational roadmap diagrams show the complete path without horizontal scrolling. If a flow cannot fit, use a vertical pipeline, rows, or progressive sub-diagrams—not a hidden continuation behind a scrollbar.
- Diagram edge labels own a dedicated lane. Text may not sit on top of connector lines, spill into nodes, or rely on overlap to fit.
- Node text is left-aligned and vertically predictable; connectors carry only relationship/data labels.
- At narrow widths, dense horizontal diagrams become vertical flows rather than shrinking text or clipping nodes.
- Spacing communicates hierarchy: align first, add whitespace second, add a border or card only when it clarifies grouping.
- Validate bounding boxes, not just screenshots: sibling top coordinates, control heights, popup containment, and node/edge intersection are regression-testable invariants.

## Avoid

- learner tests, gates, notebooks, scores, or required answers
- unexplained jargon
- marketing prose inside lessons
- fake animation standing in for causality
- huge source files without a narrow range
- AI as a prerequisite
