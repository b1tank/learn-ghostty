# System design

## 1. Repository shape

```text
learn-ghostty/
├── README.md
├── AGENTS.md
├── ghostty/                         # pinned upstream submodule
├── camp                             # one course command
├── course/
│   ├── manifest.yml
│   ├── source-map.yml
│   └── progress.example.json
├── learner/
│   ├── state.json
│   ├── journal.md
│   ├── questions.md
│   ├── explain-backs/
│   └── lab-results/
├── docs/                            # product and design documents
├── lessons/
│   ├── 00-orientation/
│   ├── 01-terminal-foundations/
│   ├── 02-pty-and-processes/
│   ├── 03-zig-for-ghostty/
│   ├── 04-vt-parser/
│   ├── 05-terminal-state/
│   ├── 06-threads-and-io/
│   ├── 07-unicode-and-fonts/
│   ├── 08-gpu-rendering/
│   ├── 09-input-stack/
│   ├── 10-application-runtime/
│   ├── 11-gtk/
│   ├── 12-macos/
│   ├── 13-advanced-protocols/
│   ├── 14-testing-and-performance/
│   └── 15-contribution-capstones/
├── labs/
│   ├── c/
│   ├── zig/
│   ├── opengl/
│   ├── gtk/
│   ├── swift/
│   └── seeded-bugs/
├── site/                            # VitePress/Vue learning cockpit
│   ├── .vitepress/
│   └── components/
├── visualizers/
│   ├── byte-stream/
│   ├── vt-parser/
│   ├── grid-and-scrollback/
│   ├── thread-timeline/
│   ├── glyph-atlas/
│   ├── gpu-frame/
│   └── architecture-explorer/
├── diagrams/
│   ├── source/
│   └── generated/
├── scripts/
│   ├── doctor
│   ├── verify-source-links
│   ├── generate-diagrams
│   ├── serve
│   └── check-progress
├── .agents/skills/learn-ghostty/
├── .pi/prompts/
└── .pi/extensions/                 # optional course polish
```

## 2. Technology choices

Preferred initial stack:

- VitePress for Markdown, navigation, search, and polished documentation.
- Vue for interactive components and dashboard state.
- Mermaid for maintainable diagrams.
- Canvas/SVG for parser, grid, thread, and atlas visualizers.
- WebGL for GPU-rendering lessons.
- Browser localStorage for private learner evidence plus portable JSON export.
- Pinned public Ghostty source with optional local-checkout enhancement.
- Checked-in native probes whose normalized reference traces ship with the website.
- An optional Node development service for live probes and editor integration.

The production website is static and requires no account, cloud API, clone, local server, CLI, or agent.

## 3. Optional local-service responsibilities

The website never depends on the local service. When one is already available, it may expose narrow enhancements:

- execute commands declared in the course manifest;
- stream bounded live-lab output;
- read the pinned local Ghostty checkout;
- open validated files in VS Code;
- report health and toolchain versions.

The UI detects these capabilities opportunistically. Missing capabilities reveal no setup error; the bundled reference trace and public source remain the complete default path. The service does not provide arbitrary command execution.

Example allowlisted lab declaration:

```yaml
labs:
  vt-03:
    cwd: labs/zig/vt-parser
    run: [zig, build, run]
    check: [zig, build, test]
    timeout_seconds: 30
```

Security rules:

- validate all paths stay under approved roots;
- validate source line values as integers;
- never interpolate browser text into a shell;
- spawn commands as argument arrays;
- cap output, duration, and concurrent processes;
- bind to loopback only;
- reject unknown lab IDs and actions.

## 4. Source navigation

Each source reference supplies:

```text
Parser.next
src/terminal/Parser.zig

[View here] [Open in VS Code] [Copy path for Pi] [Pinned GitHub]
```

### Browser source view

A route such as:

```text
/source/src/terminal/Parser.zig?line=247&end=290
```

shows syntax-highlighted context, symbols, source-trail navigation, and the pinned commit.

### VS Code

A validated local endpoint executes the equivalent of:

```console
code --goto ~/learn-ghostty/ghostty/src/terminal/Parser.zig:247
```

### Pi reference

Copy a stable prompt-friendly reference:

```text
@ghostty/src/terminal/Parser.zig:247
```

### Link validation

CI and local checks verify:

- the submodule commit matches the manifest;
- referenced files exist;
- named symbols remain discoverable;
- immutable GitHub links use the pin;
- lesson-to-source trails are complete.

## 5. Two kinds of runnable lab

### Browser-native

Immediate, deterministic experiments for:

- byte decoding;
- VT parser states;
- grid mutation and scrollback;
- Unicode and grapheme behavior;
- glyph-atlas packing;
- thread scheduling simulations;
- input encoding;
- WebGL rendering.

### Native evidence

Native probes are checked into the repository and executed during development/CI. Stable reference traces are normalized and bundled into the production website so every learner can inspect the same evidence without setup. Examples include PTY/process relationships, libghostty-vt behavior, and renderer diagnostics.

If the optional local service exists, the same component may additionally offer **Run live probe**. Live execution supplements the reference trace; it never gates the lesson. A prediction should precede either reveal.

## 6. Durable evidence

`course/manifest.json` defines one hierarchy: modules contain lessons; lessons contain missions. Each mission declares the evidence it requires from prediction, observation, explanation, and source invariant.

Machine-readable browser state records the last viewed heading per lesson, explicitly completed lessons, and optional learner-authored notebook evidence. IntersectionObserver/scroll tracking updates resume automatically; completion remains an ungated button. The learner can export a portable JSON record before backup, transfer, AI review, or confirmed reset. Browser storage remains authoritative and private by default.

Repository files under `learner/` are development fixtures, not the learner's runtime record. State updates must be schema-validated and must never invent an observation.

## 7. Evidence semantics

A click can record navigation but cannot demonstrate understanding. Mission evidence progresses through causal capabilities:

```text
not_started → predicted → observed → explained → traced → modified
```

Not every mission requires every stage. An orientation may require an explanation; a systems mission may require prediction, concrete observation, causal explanation, and a source invariant. Later transfer exercises test whether evidence remains usable in a new situation.

The homepage shows a simple first-visit explanation or returning resume card plus the complete roadmap, not percentages, confidence theater, or an LLM-generated mastery score.

AI-clean Markdown is generated from lesson source at build time. A sticky vendor-neutral Copy for AI control extracts the tracked current section and adds readable URL/progress/source metadata. Private notebook evidence is opt-in, never copied by the default action.

## 8. Course CLI

```console
./camp doctor
./camp status
./camp status --json
./camp next
./camp open
./camp open vt-03
./camp run vt-03
./camp check vt-03
./camp refs vt-03
./camp serve
./camp stop
./camp reset seeded-parser-01
```

The browser and Pi should call the same underlying course API/commands rather than duplicating logic.

## 9. Visual material inventory

The complete course should include at least:

- one interactive whole-system architecture map;
- eight animated sequence diagrams;
- one byte-stream decoder;
- one VT parser stepper;
- one screen/page/scrollback explorer;
- one terminal thread timeline;
- one Unicode/grapheme/glyph explorer;
- one glyph-atlas explorer;
- one GPU frame/pass explorer;
- one input decision tree;
- GTK and macOS lifecycle comparisons;
- 25–35 smaller text-generated diagrams.

Visual sources must be text-based and regenerable. Generated SVGs are artifacts, not opaque sources.

## 10. Architecture poster

The first major visual artifact is an interactive form of:

```mermaid
flowchart LR
    UI[GTK / SwiftUI] --> Surface[Surface]
    UI --> Input[Input stack]
    Input --> Termio[Termio mailbox]
    Termio --> PTY[PTY + child process]
    PTY --> IO[IO path]
    IO --> Stream[StreamHandler]
    Stream --> Parser[VT parser]
    Parser --> Terminal[Terminal state]
    Terminal --> Screen[Screen / PageList / cells]
    Screen --> Shared[Renderer state]
    Shared --> RT[Renderer thread]
    RT --> Generic[Generic renderer]
    Generic --> Fonts[Shaping + rasterization + atlas]
    Generic --> GPU[OpenGL / Metal]
    GPU --> UI
    Surface --> Termio
    Surface --> RT
```

Clicking a node reveals purpose, history, owning thread, important types, source files, tests, incoming/outgoing data, and recommended lesson.
