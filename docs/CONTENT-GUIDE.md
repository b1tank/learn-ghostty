# Content guide

## Reader

Write for an experienced engineer with no assumed knowledge of terminal hardware, PTYs, VT protocols, Zig, font shaping, GPU rendering, GTK, SwiftUI, tmux, or SSH internals.

## Lesson sequence

```text
user action
→ visible result
→ data moving at each boundary
→ component responsible
→ necessary technical term
→ analogy and its limit
→ narrow Ghostty source read
→ optional deeper detail
```

Do not begin with a glossary or architecture inventory.

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

## Data labels

Name concrete representations: hardware event, platform key event, UTF-8 bytes, command line, argv, filesystem entries, ANSI/ECMA-48 bytes, parser actions, terminal cells, code points, glyphs, atlas textures, GPU buffers, frames, pixels.

## Analogy

The primary scalable analogy is a live sports broadcast: producers, remote feeds, control rooms, graphics rundown, compositor, and viewer. Use it for roles and routing. Always explain that software follows deterministic byte protocols rather than human semantic intent.

## Source references

Every excerpt states what to read, what to ignore, and the architectural question it answers. Include immutable GitHub and `~/ghostty` paths. Link official Ghostty documentation for authoritative behavior and policy.

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

## Avoid

- learner tests, gates, notebooks, scores, or required answers
- unexplained jargon
- marketing prose inside lessons
- fake animation standing in for causality
- huge source files without a narrow range
- AI as a prerequisite
