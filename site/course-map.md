---
title: Course map
---

# The machine you are about to understand

The course moves in the same direction as real terminal output: from a program, through old compatibility layers, into durable terminal state, text shaping, GPU work, and finally pixels. Then it follows input in reverse.

<div class="map-placeholder">
  <span>PROGRAM</span><b>→</b><span>PTY</span><b>→</b><span>PARSER</span><b>→</b><span>GRID</span><b>→</b><span>FONTS</span><b>→</b><span>GPU</span><b>→</b><span>YOU</span>
</div>

## Build while learning

Only the first lesson is available today. Each next topic is built as a complete visual and runnable slice after you learn the current one. Your questions shape what comes next.

| Stage | Question you will answer | Status |
|---|---|---|
| Overview | What is Ghostty, and how does the whole machine fit together? | **Ready** |
| Terminal origins | Why does software still imitate a physical terminal? | Built next |
| Zig bridge | How do my C instincts translate into Ghostty's Zig? | Planned |
| VT parser | How do arbitrary bytes become meaningful actions? | Planned |
| Terminal state | How can a screen remember history while constantly changing? | Planned |
| Threads and I/O | How does output stay responsive under load? | Planned |
| Unicode and fonts | How does a character become the right glyph? | Planned |
| GPU renderer | How do cells and glyphs become a frame? | Planned |
| Input and native UI | How does a key cross GTK or SwiftUI and reach a program? | Planned |
| Maintainer practice | How do you change any layer without breaking the ecosystem? | Planned |
