---
title: "00 · Ghostty: the whole machine"
description: "See what a terminal emulator really does, how Ghostty divides the work, and how to use this source-backed camp."
---

<script setup>
import ArchitectureExplorer from '../components/ArchitectureExplorer.vue'
import ByteJourney from '../components/ByteJourney.vue'
import PredictionCard from '../components/PredictionCard.vue'
import LabRunner from '../components/LabRunner.vue'
import LearningPath from '../components/LearningPath.vue'
import LessonCheckpoint from '../components/LessonCheckpoint.vue'
import SourceLink from '../components/SourceLink.vue'
</script>

<div id="welcome" class="lesson-hero">
  <div class="lesson-hero__index">00</div>
  <div class="lesson-hero__copy">
    <span class="lesson-eyebrow">ORIENTATION · 55 MINUTES</span>
    <h1>Ghostty:<br><em>the whole machine</em></h1>
    <p>Before we take apart parsers, PTYs, fonts, and GPU frames, build one dependable picture of what Ghostty does—and why every layer exists.</p>
    <div class="lesson-outcomes"><span>◉ See the complete output path</span><span>◉ Know what this camp will teach</span><span>◉ Learn how to learn with Pi</span></div>
  </div>
</div>

::: tip Your only job in this lesson
Do not memorize file names. Leave with a story you can tell: **a program emits bytes; Ghostty turns those bytes into an interactive native picture.** Everything else is a chapter in that story.
:::

<LessonCheckpoint step="welcome" next-step="why-terminal" :completion="5" label="Begin the lesson" event="started the Ghostty overview" />

<span id="why-terminal" class="lesson-anchor"></span>

## Why study a terminal emulator?

A terminal window can look deceptively simple: a dark rectangle, a prompt, and some text. That simplicity hides an unusually rich systems project.

A modern terminal emulator sits where many worlds meet:

- Unix processes and kernel interfaces;
- protocols that grew from physical machines built decades ago;
- Unicode, scripts, emoji, ligatures, and font fallback;
- keyboard layouts, input methods, mouse protocols, and clipboards;
- concurrent I/O and rendering under heavy output;
- GPU APIs such as OpenGL and Metal;
- native desktop frameworks such as GTK and SwiftUI;
- compatibility expectations accumulated across thousands of programs.

That makes Ghostty a compact tour through real systems engineering. Learning it is not only learning “how to draw a shell.” It is learning how a modern product preserves an old contract while using contemporary hardware and platform design.

If a browser is a portal through which remote applications become local interactive pixels, a terminal emulator is a portal through which local and remote command-line applications become local interactive pixels. Both parse input, maintain state, shape text, accept human input, and composite a frame. Their contracts and data models differ, but the comparison gives us familiar landmarks.

<PredictionCard
  question="When you type `ls`, which program decides what filenames to print: Ghostty, your shell, or the operating system's GPU driver?"
  hint="Ask which component understands commands such as `ls` and which component only understands display instructions."
  answer="Your shell interprets `ls` and launches the `ls` program. That program chooses the filenames and writes bytes. Ghostty does not understand the meaning of the command; it interprets the resulting terminal byte stream and displays it."
/>

## First, separate four things people call “the terminal”

In casual conversation, “open a terminal” is useful shorthand. In architecture work, it hides important boundaries.

| Thing | Plain-language job | Example |
|---|---|---|
| **Terminal emulator** | Turns a terminal protocol into pixels and human input back into bytes | Ghostty |
| **Shell** | Reads command language, launches programs, and connects them | Bash, Zsh, Fish, Nushell |
| **Terminal application** | A program designed to interact through a terminal | `vim`, `top`, `git`, `ls` |
| **PTY** | The kernel-provided software connection between emulator and program | `/dev/pts/…` on Linux |

A useful browser comparison:

- Ghostty is closer to the **browser engine and native browser shell**.
- The shell or TUI is closer to the **web application**.
- The PTY is loosely like a **bidirectional local connection**.
- Terminal control sequences are closer to a tiny, stateful **display protocol**.

The analogy breaks at the data model. HTML mostly describes a document. A terminal application mostly sends commands: print this character, change this style, move this cursor, erase this region. A terminal screen is a small machine being driven over time, not a document delivered once.

::: warning A foundational distinction
The shell is normally **inside** the terminal session. Ghostty hosts it; Ghostty is not the shell. A bug in command parsing belongs to the shell. A bug in how the resulting bytes alter the screen may belong to Ghostty.
:::

## The historical zoom-out: software inherited a physical shape

The word *terminal* originally described an endpoint—a physical device at the end of a wire. Early terminals evolved from teletypes: keyboard-and-printer machines that could send characters to a distant computer and print the characters it sent back.

Later video terminals replaced paper with a screen. Devices such as DEC's VT series learned commands beyond ordinary characters: move the cursor, clear a line, change display attributes. Software began depending on those command languages.

When the terminal became a window on the same computer, Unix could not simply discard the old interface. Shells, editors, and operating-system behavior already expected to talk to something terminal-shaped. The **pseudo-terminal**, or PTY, preserved that shape in software.

That history still leaks into everyday behavior:

- carriage return and line feed remain distinct operations;
- applications negotiate terminal capabilities;
- cursor movement arrives as bytes that resemble old device commands;
- terminal size is reported through an operating-system interface;
- “raw mode” changes how the kernel handles keyboard input;
- compatibility with xterm and DEC behavior still matters.

We will learn these oddities beside the history that created them, rather than treating them as arbitrary trivia.

<div class="history-strip">
  <div><span>1800s–1930s</span><strong>Telegraph + teletype</strong><p>Human keys become coded signals over a wire.</p></div>
  <i>→</i>
  <div><span>1960s–1970s</span><strong>Video terminals</strong><p>Control codes drive a cursor and screen.</p></div>
  <i>→</i>
  <div><span>1980s–2000s</span><strong>Software emulators</strong><p>A window imitates the terminal device.</p></div>
  <i>→</i>
  <div><span>Today</span><strong>Ghostty</strong><p>Native UI and GPUs carry the old contract forward.</p></div>
</div>

<LessonCheckpoint step="why-terminal" next-step="architecture" :completion="22" label="I see why the layers exist" />

## One output journey: bytes to light

Suppose a program wants to show the word **Hi** in green. It does not call Ghostty's drawing API. It writes bytes: some represent commands, and some represent visible letters.

<ByteJourney />

This single trip gives us the spine of the course:

```text
program → PTY → parser → terminal state → fonts → GPU → native window
```

Input runs through many of the same boundaries in reverse:

```text
human → native key event → Ghostty input rules → encoded bytes → PTY → program
```

The difficult—and interesting—work lives at the boundaries. What owns this memory? Which thread may touch it? Does this byte mean text or a command? Is this Unicode sequence one cell, two cells, or several glyphs? Is the application asking for the key itself or the text produced by an input method? Ghostty must answer those questions quickly and compatibly.

<span id="architecture" class="lesson-anchor"></span>

## Explore Ghostty's layers

Click every layer. Read the plain-language description first; source paths are only signposts for later.

<ArchitectureExplorer />

### The central design idea

Ghostty shares a large Zig core but does not force every platform into the same native shell.

The shared core handles work that should mean the same thing everywhere: terminal state, PTY I/O, input encoding, fonts, rendering logic, configuration, and a surface abstraction. Platform runtimes provide windows, tabs, splits, menus, clipboard behavior, and native event integration.

On Linux and FreeBSD, the application runtime uses GTK and the renderer uses OpenGL. On macOS, Swift and SwiftUI/AppKit own the native experience while the shared Zig core is reached through a C-compatible boundary; rendering uses Metal. This is not “write once, tolerate every platform.” It is shared machinery inside a deliberately native product.

<PredictionCard
  question="Why call the core object a `Surface` instead of a `Window`?"
  hint="One terminal can be placed in more than one kind of native container."
  answer="A terminal surface is the smallest interactive terminal view. The platform may place it in a window, tab, split, preview, or another container. Calling it a Surface keeps the shared core independent from platform-specific window organization."
/>

<LessonCheckpoint step="architecture" next-step="learning-path" :completion="46" label="I can trace the seven layers" />

<span id="learning-path" class="lesson-anchor"></span>

## What you will learn

This camp follows dependencies rather than directory order. We learn the old contract before its modern implementation, the state model before its renderer, and the renderer before native integration.

<LearningPath />

By the end of the critical path, you should be able to trace two complete stories.

### Story A: output to pixels

Given:

```console
printf '\033[1;31mA\033[0m\n'
```

You can explain the PTY bytes, parser transitions, style state, cell creation, render snapshot, glyph resolution, atlas entry, GPU buffers, shaders, and presented frame.

### Story B: key to program

Given a key press with modifiers or input-method composition, you can explain the native event, Ghostty input representation, keybinding decision, terminal-mode encoding, mailbox, PTY write, and bytes observed by the child.

Those stories turn a large repository into a navigable machine. When a bug appears, you can ask: *At which boundary did the meaning become wrong?*

## How to learn this course

### 1. Keep the browser and Pi side by side

The page provides sequence and visuals. Pi provides dialogue. When a paragraph feels fuzzy, do not reread it five times—ask Pi to explain it from a different angle or walk the exact source.

```console
cd ~/learn-ghostty
pi
```

Useful natural requests:

```text
What's next?
Explain this layer using the browser analogy, then tell me where it breaks.
Walk this output through the source and stop at each thread boundary.
Give me a hint, not the answer.
Quiz me on the overview.
Wrap up.
```

### 2. Predict before running

Prediction creates a model you can test. Without it, clicking Run produces motion but little learning. Wrong predictions are useful—they reveal exactly which boundary needs work.

### 3. Build a small version before reading the industrial one

You will build a small PTY relay, parser, grid, threaded pipeline, glyph atlas, and GPU renderer. Each toy deliberately omits production complexity. It exists to give the production code somewhere to attach in your mind.

### 4. Read source as an execution trail

Do not “read `src/`.” Follow one event. Start where it enters, cross each ownership boundary, and stop when the result is observable. The course links exact files in that order.

### 5. Explain it back

Recognition is not understanding. At lesson boundaries, close the page mentally and explain the system in your own words. Pi will challenge gaps against the pinned source.

### 6. Let the course grow behind you, not ahead of you

Only the next useful topic is built. Your real questions improve the lesson you just used. This avoids a giant generic course and gives you influence over the path.

::: tip The learning contract
Pi may help you navigate, question, test, and review. You remain responsible for being able to explain any code you contribute. This matches Ghostty's own AI policy: assistance is allowed, understanding is required, and assistance must be disclosed.
:::

## Open the real machine

Now verify that the course and Ghostty source agree.

<LabRunner lab="orientation-source-check" title="Ask the pinned checkout for its core map" />

The check does not compile Ghostty yet. It proves a more basic contract: the lesson is attached to a specific source snapshot, and the named entry points are present locally.

### Your first source trail

<SourceLink path="README.md" :line="16" label="Ghostty's public promise" note="Read how the project describes speed, native UI, and libghostty." />

<SourceLink path="src/main_ghostty.zig" :line="25" :end="112" label="The process wakes up" note="Global initialization, CLI handling, core App creation, runtime creation, and the GUI loop." />

<SourceLink path="src/App.zig" :line="1" :end="24" label="The shared application core" note="Owns surfaces, application-level state, and communication with the chosen runtime." />

<SourceLink path="src/Surface.zig" :line="1" :end="25" label="The unit you will follow most often" note="One terminal session: PTY, input, terminal state, renderer, and platform boundary." />

Do not read these files top to bottom yet. Read their opening comments and identify the handoff:

```text
main creates App → runtime hosts App → runtime creates Surface
```

That is enough for today.

<LessonCheckpoint step="learning-path" next-step="explain-back" :completion="82" label="I ran the source orientation" />

## Common wrong models to discard now

### “Ghostty is a shell”

Ghostty normally launches a shell. It does not interpret shell command language.

### “The terminal only prints strings”

The stream mixes visible text with commands that mutate cursor, style, modes, title, clipboard, links, images, and more.

### “GPU acceleration is the architecture”

The GPU is the final drawing engine. Correct parsing, terminal state, Unicode, I/O, and native behavior are equally fundamental.

### “Cross-platform means one UI toolkit everywhere”

Ghostty shares a core while choosing native platform experiences: GTK on Linux/FreeBSD and SwiftUI/AppKit on macOS.

### “I need to understand all 350,000 lines before contributing”

You need a reliable whole-system map and deep understanding of the path touched by a change. Breadth comes through repeated paths, not one heroic read-through.

<span id="explain-back" class="lesson-anchor"></span>
<span id="pi-explain-back" class="lesson-anchor"></span>

## Explain it back

Before marking this lesson complete, return to Pi and answer without copying the page:

1. What is the difference between Ghostty, a shell, a terminal application, and a PTY?
2. Why does a modern terminal emulator preserve behavior from physical terminals?
3. Trace a short colored word from a program to pixels using the seven layers.
4. Where does the browser analogy help, and where does it become misleading?
5. Why does Ghostty combine a shared Zig core with native GTK and Swift/SwiftUI runtimes?
6. What are the two end-to-end stories you expect to explain after the camp?

Use:

```text
Quiz me on Lesson 00. Make me trace output end to end, challenge weak answers,
and only then update my mastery and journal.
```

<LessonCheckpoint step="explain-back-ready" next-step="pi-explain-back" :completion="100" label="Save: ready for Pi explain-back" event="finished Lesson 00 reading and became ready for explain-back" />

## Official references and deeper reading

Use these after the course explanation, not instead of it:

- [About Ghostty — official documentation](https://ghostty.org/docs/about)
- [Ghostty repository README](https://github.com/ghostty-org/ghostty/blob/6ad1fe7d8cbda36c77b337a96c9bea8a77883699/README.md)
- [Developing Ghostty](https://github.com/ghostty-org/ghostty/blob/6ad1fe7d8cbda36c77b337a96c9bea8a77883699/HACKING.md)
- [libghostty overview and examples](https://github.com/ghostty-org/ghostty/tree/6ad1fe7d8cbda36c77b337a96c9bea8a77883699/example)
- [Ghostty's AI usage policy](https://github.com/ghostty-org/ghostty/blob/6ad1fe7d8cbda36c77b337a96c9bea8a77883699/AI_POLICY.md)

<div class="lesson-finish">
  <span>NEXT, BUILT AFTER YOU LEARN THIS</span>
  <h2>From teletype wires to a PTY</h2>
  <p>We will replace the vague phrase “the terminal” with a physical story, a process diagram, and a small C program that opens the software cable for itself.</p>
</div>
