---
title: "00 · Ghostty: the whole machine"
description: "A fifteen-minute map for every trace you will build later."
prev: false
next: false
---

<script setup>
import ArchitectureExplorer from '../components/ArchitectureExplorer.vue'
import EvidenceNotebook from '../components/EvidenceNotebook.vue'
import LessonFooter from '../components/LessonFooter.vue'
import LessonProgress from '../components/LessonProgress.vue'
import SourceLink from '../components/SourceLink.vue'
</script>

<div id="welcome" class="lesson-hero lesson-hero--compact">
  <div class="lesson-hero__index">00</div>
  <div class="lesson-hero__copy">
    <span class="lesson-eyebrow">ORIENTATION · 12–15 MINUTES</span>
    <h1>Build the map.<br><em>Then earn the details.</em></h1>
    <p>This page gives you one story to carry through the entire camp. The next lesson stops talking and starts observing real processes, a real PTY, and real control bytes.</p>
  </div>
</div>

<LessonProgress lesson-id="00-ghostty-overview" />

::: tip The story to leave with
A program writes bytes. A PTY carries them. A parser decides which bytes are text and which are commands. Terminal state remembers the result. Fonts and the GPU turn that state into pixels. Native UI carries your input back.
:::

## Four things people call “the terminal”

Open a terminal window and type `ls`. Four different actors are already involved:

| Actor | Job | Example |
|---|---|---|
| **Terminal emulator** | Turns a terminal protocol into pixels and human input back into bytes | Ghostty |
| **Shell** | Reads command language and launches programs | Bash, Zsh, Fish |
| **Terminal application** | Reads and writes through a terminal-shaped interface | `ls`, `vim`, `top` |
| **PTY** | Kernel-provided software connection between emulator and child | `/dev/pts/…` |

The most important correction is simple:

> **Ghostty is not the shell.** Ghostty normally launches a shell, gives it a terminal-shaped connection, interprets the bytes that come back, and displays the result.

A browser analogy can orient you: Ghostty is closer to the browser engine and native shell; a terminal application is closer to the web application. But do not push the analogy too far. HTML mostly describes a document. Terminal programs mostly send imperative commands against a stateful grid: print, move, erase, recolor.

## Why software still imitates old hardware

A terminal was originally a physical endpoint at the end of a wire. A keyboard sent coded characters to a distant computer; a printer or screen displayed what came back. Video terminals later learned commands such as “move the cursor” and “clear this line.” Programs came to depend on those commands.

When the terminal became a software window, Unix preserved the relationship through a **pseudo-terminal**, or PTY. That is why modern software still contains behavior shaped by old devices:

- carriage return and line feed are different operations;
- applications send cursor movement as bytes;
- terminal size is an operating-system property;
- raw mode changes kernel input behavior;
- compatibility with DEC terminals and xterm still matters.

The course will introduce each historical oddity immediately before you observe it. History is not decoration here; it explains the contract.

## The whole output path

Click the layers once. Do not memorize file names yet. Ask one question at each boundary: **what form does the data have now?**

<ArchitectureExplorer />

The compact trace is:

```text
terminal application
  -- bytes --> PTY
  -- bytes --> VT parser
  -- actions --> terminal state
  -- cells/code points --> font system
  -- glyphs/buffers/textures --> GPU
  -- frame --> native window
```

Input travels in the opposite direction:

```text
you → GTK/SwiftUI event → Ghostty input rules → encoded bytes → PTY → application
```

This gives you a debugging method before you know the implementation:

> When behavior is wrong, find the first boundary where the meaning becomes wrong.

## Ghostty’s product shape

Ghostty shares a large Zig core without forcing every platform into one generic desktop shell.

The shared core handles terminal behavior, PTY I/O, input encoding, font work, rendering logic, configuration, and the `Surface` abstraction. Platform runtimes provide native windows, tabs, splits, menus, clipboard behavior, and event integration.

- Linux and FreeBSD use GTK with OpenGL.
- macOS uses SwiftUI/AppKit with Metal and reaches the Zig core through a C-compatible boundary.

A `Surface` is deliberately not called a `Window`. One terminal session may live inside a window, tab, split, preview, or embedded view. The native runtime chooses the container; the shared core owns terminal behavior.

## Your first narrow source read

Do not browse `src/`. Read only the opening comments and the indicated startup block.

<SourceLink path="src/main_ghostty.zig" :line="80" :end="112" label="Core meets native runtime" note="Find the three actions: create App, initialize the chosen runtime, run its event loop. Ignore logging and CLI code." />

Your question:

> Which object contains shared behavior, and which object owns the platform event loop?

<SourceLink path="src/Surface.zig" :line="1" :end="24" label="Why Ghostty says Surface" note="Read the file comment only. Identify what the core owns and what it intentionally refuses to know." />

Your question:

> Name two things a Surface owns and two container decisions left to the runtime.

## Produce one piece of evidence

Close the architecture explorer mentally and explain this without copying:

> I run `printf '\033[32mHi\033[0m'`. How does that become two green glyphs in a native Ghostty window?

A useful answer does not need implementation details yet. It should name the boundaries and say what changes form at each one.

Write the explanation first. Then ask Pi to attack the weakest boundary rather than rewriting it.

<EvidenceNotebook mission-id="orientation-map" />

Suggested Pi review:

```text
I finished the orientation. Make me tell the byte-to-pixel story without hints.
Challenge the first vague boundary. Do not award a percentage.
```

## Next: observe before naming

The next lesson begins with a mystery, not another overview. You will compile a small C probe, run it inside a newly allocated PTY, and explain the process/session/TTY relationships visible in its output. Then you will drive a tiny terminal screen one byte at a time.

<div class="lesson-finish">
  <span>FIRST REAL LESSON</span>
  <h2>The terminal is a relationship</h2>
  <p>Processes, a software cable, and bytes that change the screen.</p>
</div>

<LessonFooter lesson-id="00-ghostty-overview" />
