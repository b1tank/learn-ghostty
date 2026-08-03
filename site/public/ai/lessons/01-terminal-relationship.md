---
course: Learn Ghostty
lesson_id: 01-terminal-relationship
title: "The terminal is a relationship"
source_commit: 6ad1fe7d8cbda36c77b337a96c9bea8a77883699
canonical_url: https://b1tank.github.io/learn-ghostty/lessons/01-terminal-relationship
local_course_path: ~/learn-ghostty/site/lessons/01-terminal-relationship.md
---

# The terminal is a relationship.

> A shell is not “inside” Ghostty like text inside a text box. Processes are connected through a kernel object that preserves the shape of an old physical terminal. You will observe that relationship before naming every part.

## Mission 1 — Observe the software cable

### Begin with a prediction

The reference experiment runs the same checked-in C program twice:

1. as an ordinary process with captured output;
2. inside a newly allocated pseudo-terminal.

The website bundles a normalized trace captured from that real Linux run, so no setup is required and everyone can reason from the same evidence. When an optional local runner is already present, the page also offers a live run. Before revealing either, predict which facts must change merely because the connection changed.

> **Pause and predict:** Will the program get a new PID, session, process group, terminal device, or all four when it runs inside a new PTY?

### Run the observation

> **Systems experiment on the website:** Compile the C probe and compare no-PTY with PTY.

The reference output came from real native code, not an invented browser model:

1. [`labs/c/terminal-reality/main.c`](https://github.com/b1tank/learn-ghostty/blob/main/labs/c/terminal-reality/main.c) was compiled with warnings treated as errors;
2. the binary ran normally;
3. util-linux `script` allocated a fresh PTY and ran the same binary again;
4. only volatile identifiers and the PTY number were normalized for a stable website experiment.

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
Ghostty / PTY owner                     shell or child
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

**Ghostty source — Open Ghostty's PTY pair**

- Remote: https://github.com/ghostty-org/ghostty/blob/6ad1fe7d8cbda36c77b337a96c9bea8a77883699/src/pty.zig#L115-L171
- Local: `~/ghostty/src/pty.zig:115-171`
- Read for: Read PosixPty.open. Find where master and slave descriptors appear, which side receives CLOEXEC, and the comment explaining why.

Answer one source question:

> Why should Ghostty's child inherit the slave descriptor but not the master descriptor?

**Ghostty source — Start the subprocess on the I/O thread**

- Remote: https://github.com/ghostty-org/ghostty/blob/6ad1fe7d8cbda36c77b337a96c9bea8a77883699/src/termio/Exec.zig#L88-L110
- Local: `~/ghostty/src/termio/Exec.zig:88-110`
- Read for: Read threadEnter only through subprocess.start. Identify the handoff from generic Termio to the PTY-backed subprocess.

Answer one boundary question:

> Which object starts the process, and what pair of handles comes back for later reading and writing?

## Evidence required for Mission 1

Before moving on, your notebook must contain:

1. **Prediction:** what you expected to change between the two runs.
2. **Observation:** the actual equalities and differences in the output.
3. **Explanation:** why a PTY changes more than byte transport.
4. **Source invariant:** master stays with Ghostty; slave is inherited by the child.

Save those claims before moving on. Partial evidence is valid; unsupported confidence is not.

> **Notebook on the website:** save evidence for mission `process-pty-observation`.

## Mission 2 — Bytes drive a screen

A PTY carries bytes; it does not decide what those bytes mean on screen. The next boundary is a parser and a state machine.

This workbench is deliberately tiny and honest about its limits. It handles printable ASCII, escape/CSI framing for SGR colors 0/31/32, carriage return, backspace, and one row of twelve cells. It does not pretend to be Ghostty. Its purpose is to make causality visible before production complexity arrives.

> **Interactive on the website:** edit and step terminal byte sequences through parser state, style, cursor, and cells.

### Three discoveries to earn

Run all three presets with a written prediction.

#### Green `Hi`

Separate bytes that occupy cells from bytes that only change parser or style state. If your explanation says “the escape code prints green,” make it more precise: which byte dispatches the style action, and when does the parser return to ground?

#### Carriage return

For `abc\rX`, notice that CR changes the cursor but erases nothing. `X` overwrites only because the next printable byte writes at column zero. This distinction survives from physical carriage motion.

#### Backspace

For `abc\bX`, notice that BS moves left but also erases nothing. A later printable byte overwrites the cell. Programs that want visual deletion usually send a movement plus an erase or replacement.

### Find the parser boundary—not all parser behavior

**Ghostty source — One byte enters Parser.next**

- Remote: https://github.com/ghostty-org/ghostty/blob/6ad1fe7d8cbda36c77b337a96c9bea8a77883699/src/terminal/Parser.zig#L222-L285
- Local: `~/ghostty/src/terminal/Parser.zig:222-285`
- Read for: Read the order in the comment: exit action, transition action, entry action. Ignore the full transition table for now.

Answer:

> Why can one input byte produce up to three ordered actions even though the toy workbench reports one summary line?

Then read only the action vocabulary near the top of the file:

**Ghostty source — Parser states and transition actions**

- Remote: https://github.com/ghostty-org/ghostty/blob/6ad1fe7d8cbda36c77b337a96c9bea8a77883699/src/terminal/Parser.zig#L13-L57
- Local: `~/ghostty/src/terminal/Parser.zig:13-57`
- Read for: Find ground, escape, csi_entry, csi_param, print, collect, param, and csi_dispatch. Map each familiar toy state to the production vocabulary.

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

The evidence notebook below saves these claims privately in your browser. Export the record from the dashboard for backup or optional Pi review. Pi should challenge the claims, not replace them.

> **Notebook on the website:** save evidence for mission `bytes-to-screen`.

## Explain the two boundaries together

Without looking back, explain why these are different bugs:

1. a child starts without a controlling terminal;
2. the child writes `abc\rX`, but the emulator displays `abcX`.

The first belongs before bytes reach the parser. The second belongs after transport. If you can locate the first boundary where meaning becomes wrong, the architecture is beginning to work for you.

  NEXT LESSON · BUILT AFTER THIS EVIDENCE IS USED
  <h2>Enough Zig to read Ghostty</h2>
  <p>Translate the C probe's process, file-descriptor, and error-handling ideas into the Zig patterns used by Ghostty.</p>
