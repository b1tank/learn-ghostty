---
title: "01 · The terminal is a relationship"
description: "Observe processes, a pseudo-terminal, and control bytes before reading Ghostty's implementation."
---

<script setup>
import ByteWorkbench from '../components/ByteWorkbench.vue'
import LabRunner from '../components/LabRunner.vue'
import PredictionCard from '../components/PredictionCard.vue'
import SourceLink from '../components/SourceLink.vue'
</script>

<div id="welcome" class="lesson-hero">
  <div class="lesson-hero__index">01</div>
  <div class="lesson-hero__copy">
    <span class="lesson-eyebrow">FOUNDATIONS · TWO MISSIONS · 75–90 MINUTES</span>
    <h1>The terminal is<br><em>a relationship.</em></h1>
    <p>A shell is not “inside” Ghostty like text inside a text box. Processes are connected through a kernel object that preserves the shape of an old physical terminal. You will observe that relationship before naming every part.</p>
  </div>
</div>

## Mission 1 — Observe the software cable

### Begin with a prediction

The same C program will run twice:

1. as an ordinary process whose output is captured by the course server;
2. inside a newly allocated pseudo-terminal.

The program prints seven facts about itself. Before running it, predict which facts must change merely because its connection changed.

<PredictionCard
  question="Will the program get a new PID, session, process group, terminal device, or all four when it runs inside a new PTY?"
  hint="A PTY is more than a byte pipe. Think about who becomes the leader of a new terminal session."
  answer="Do not treat this as the assessment answer. Run the probe and compare. The useful discovery is which identifiers become equal in the PTY case and why that grouping matters."
/>

### Run the observation

<LabRunner lab="terminal-reality" title="Compile the C probe and compare no-PTY with PTY" />

This is real native code, not a browser animation. The runner:

1. compiles [`labs/c/terminal-reality/main.c`](https://github.com/b1tank/learn-ghostty/blob/main/labs/c/terminal-reality/main.c) with warnings treated as errors;
2. runs it normally;
3. asks util-linux `script` to allocate a fresh PTY and runs the same binary again;
4. shows both observations without interpreting them for you.

### Read the output like an investigator

Do not begin with definitions. Begin with differences.

Write down:

- Which run has a terminal device name?
- In the PTY run, which of PID, SID, PGID, and foreground PGID are equal?
- Which process is the parent? Why is it not the terminal emulator in this experiment?
- What remained ordinary process behavior despite adding a PTY?

Only now attach vocabulary:

| Observation | Precise term | Why it exists |
|---|---|---|
| `/dev/pts/N` | **PTY slave device** | Gives a child a file-descriptor interface that behaves like a terminal |
| SID equals the probe PID | **Session leader** | Establishes a process family with one controlling terminal |
| PGID equals the foreground PGID | **Foreground process group** | Decides which process group receives interactive input and terminal-generated signals |
| `isatty` changes to yes | **Terminal endpoint** | Tells software it is connected to terminal semantics, not an ordinary pipe |

The other side of the PTY is the **master**. A terminal emulator owns that side. Bytes written by the child to the slave can be read from the master; bytes written to the master become input on the slave.

```text
Ghostty / course runner                 shell or child
owns PTY master                         inherits PTY slave
        │                                      │
        └──────────── kernel PTY pair ─────────┘
              bytes + terminal semantics
```

“Software cable” is a useful first analogy. Its limit is now visible: an ordinary pipe carries bytes too, but it does not create terminal identity, a controlling terminal, foreground process-group behavior, canonical input, echo, or window size.

### Why history produced this interface

A physical terminal really was at the end of a connection. Unix programs learned to expect terminal behavior from a device. When the endpoint moved into software, the PTY pair let an emulator occupy one side while preserving a terminal-shaped device for the child.

This is why applications can ask “am I connected to a terminal?” and change behavior:

- `ls` may enable columns and color;
- a shell may show an interactive prompt;
- a TUI may enter raw mode;
- a program may react to terminal resize.

The PTY preserves a contract, not the hardware.

## Find the same boundary in Ghostty

You are not going to read all of `pty.zig` or `Exec.zig`.

<SourceLink path="src/pty.zig" :line="115" :end="171" label="Open Ghostty's PTY pair" note="Read PosixPty.open. Find where master and slave descriptors appear, which side receives CLOEXEC, and the comment explaining why." />

Answer one source question:

> Why should Ghostty's child inherit the slave descriptor but not the master descriptor?

<SourceLink path="src/termio/Exec.zig" :line="88" :end="110" label="Start the subprocess on the I/O thread" note="Read threadEnter only through subprocess.start. Identify the handoff from generic Termio to the PTY-backed subprocess." />

Answer one boundary question:

> Which object starts the process, and what pair of handles comes back for later reading and writing?

## Evidence required for Mission 1

Before moving on, your notebook must contain:

1. **Prediction:** what you expected to change between the two runs.
2. **Observation:** the actual equalities and differences in the output.
3. **Explanation:** why a PTY changes more than byte transport.
4. **Source invariant:** master stays with Ghostty; slave is inherited by the child.

The evidence notebook appears after the byte workbench in the completed lesson. For now, keep those four answers nearby.

## Mission 2 — Bytes drive a screen

A PTY carries bytes; it does not decide what those bytes mean on screen. The next boundary is a parser and a state machine.

This workbench is deliberately tiny and honest about its limits. It handles printable ASCII, escape/CSI framing for SGR colors 0/31/32, carriage return, backspace, and one row of twelve cells. It does not pretend to be Ghostty. Its purpose is to make causality visible before production complexity arrives.

<ByteWorkbench />

### Three discoveries to earn

Run all three presets with a written prediction.

#### Green `Hi`

Separate bytes that occupy cells from bytes that only change parser or style state. If your explanation says “the escape code prints green,” make it more precise: which byte dispatches the style action, and when does the parser return to ground?

#### Carriage return

For `abc\rX`, notice that CR changes the cursor but erases nothing. `X` overwrites only because the next printable byte writes at column zero. This distinction survives from physical carriage motion.

#### Backspace

For `abc\bX`, notice that BS moves left but also erases nothing. A later printable byte overwrites the cell. Programs that want visual deletion usually send a movement plus an erase or replacement.

### Find the parser boundary—not all parser behavior

<SourceLink path="src/terminal/Parser.zig" :line="222" :end="285" label="One byte enters Parser.next" note="Read the order in the comment: exit action, transition action, entry action. Ignore the full transition table for now." />

Answer:

> Why can one input byte produce up to three ordered actions even though the toy workbench reports one summary line?

Then read only the action vocabulary near the top of the file:

<SourceLink path="src/terminal/Parser.zig" :line="13" :end="57" label="Parser states and transition actions" note="Find ground, escape, csi_entry, csi_param, print, collect, param, and csi_dispatch. Map each familiar toy state to the production vocabulary." />

### The boundary you now own

You have observed two separate systems:

```text
process/session/PTY relationship  →  carries bytes correctly
parser/terminal-state relationship → interprets bytes correctly
```

A display bug can originate on either side. If the child has no controlling terminal, parser correctness does not help. If the bytes arrive intact but parser state is wrong, PTY correctness does not help.

## Evidence required for Mission 2

Your notebook entry must contain:

1. a prediction for one selected sequence;
2. the final cells, cursor, and style you observed;
3. a causal explanation for every non-printing byte;
4. this source invariant in your own words: parser actions are ordered, and terminal-state mutation belongs after parsing.

The evidence notebook below saves these claims as ordinary files. Pi will challenge them; it should not replace them.
