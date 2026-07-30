# Two-week curriculum

## Goal

The ten-day critical path builds an end-to-end mental model. Optional extension days and electives deepen individual subsystems. Each lesson follows the editorial loop defined in [`EDITORIAL-PHILOSOPHY.md`](EDITORIAL-PHILOSOPHY.md).

## Day 0 — Setup and map the system

### Learn

- What a terminal emulator is and is not.
- Terminal versus shell versus PTY versus GUI.
- Ghostty's shared Zig core and native application runtimes.
- Application, internal macOS library, libghostty-vt, and WASM artifacts.

### Do

- Run the toolchain doctor.
- Build Ghostty.
- Run one targeted Zig test.
- Emit color and cursor control sequences manually.
- Use Ghostty's inspector.
- Draw a “before camp” architecture map.

### Ghostty trail

- `build.zig`
- `src/main.zig`
- `src/main_ghostty.zig`
- `src/App.zig`
- `src/Surface.zig`
- `src/apprt.zig`

### Explain back

Why does `Surface` not know whether it lives in a window, tab, or split?

## Day 1 — Physical terminals, TTYs, PTYs, and processes

### Story

Start with teletypes and serial wires, then show why Unix retained terminal-shaped interfaces when the hardware became software. Compare the PTY to a local bidirectional connection between a browser engine and an application, while explaining why the kernel TTY behavior makes it unlike a plain socket.

### Learn

- Physical terminals and serial communication.
- Sessions, process groups, and controlling terminals.
- PTY master and slave ends.
- Line discipline, canonical mode, and raw mode.
- Window-size notifications.
- Shell integration boundaries.

### Do

- Build a `forkpty`-based terminal relay in C.
- Launch a shell and record bytes in both directions.
- Add resize support.
- Toggle canonical/raw behavior.
- Compare the byte log with the displayed result.

### Ghostty trail

- `src/pty.zig`
- `src/termio/Exec.zig`
- `src/termio/backend.zig`
- `src/termio/Termio.zig`
- `src/termio/shell_integration.zig`

## Day 2 — Zig for a C programmer

### Learn

Only the Zig needed to read and change Ghostty:

- slices and pointers;
- tagged unions and enums;
- error unions, `try`, `catch`, `defer`, and `errdefer`;
- allocators and ownership;
- comptime interfaces;
- modules and tests;
- packed and extern structures;
- C ABI interoperability.

### Do

- Port a tiny C byte parser to Zig.
- Diagnose a dangling slice.
- Write allocator-backed code and verify cleanup.
- Implement a tagged action union.
- Select between two mock backends at comptime.

### Ghostty trail

- `src/terminal/Parser.zig`
- `src/apprt.zig`
- `src/renderer/backend.zig`
- `src/datastruct/message_data.zig`
- `src/terminal/c/`

### Explain back

Why are the application runtime and renderer backend often compile-time abstractions rather than ordinary runtime interfaces?

## Day 3 — VT parsing: bytes become actions

### Story

A physical terminal understood control characters and later increasingly rich command languages. Modern terminal programs still “drive” an emulator by sending those commands. Compare this to parsing web input, while emphasizing that terminal streams are imperative rather than document-oriented.

### Learn

- ASCII C0/C1 controls.
- ESC, CSI, OSC, DCS, and APC.
- DEC ANSI parser state machine.
- Parameters and intermediate bytes.
- UTF-8 mixed with control bytes.
- Standards versus xterm and other de facto behavior.
- Parser/executor separation.

### Do

- Step through an interactive parser.
- Implement ground, escape, and CSI states.
- Feed fragmented and malformed input.
- Generate parser traces.
- Add a toy CSI command and tests.
- Compare behavior with Ghostty and xterm.

### Ghostty trail

- `src/terminal/Parser.zig`
- `src/terminal/parse_table.zig`
- `src/terminal/stream.zig`
- `src/terminal/stream_terminal.zig`
- `src/terminal/csi.zig`
- `src/terminal/osc.zig`
- `src/terminal/dcs.zig`
- `src/terminal/apc.zig`
- `src/simd/vt.zig`

## Day 4 — Terminal state, grids, scrollback, and selection

### Learn

- Parser output versus terminal mutation.
- Primary and alternate screens.
- Cells, styles, cursor, wrapping, and margins.
- Wide characters and grapheme clusters.
- Pages, page lists, pins, and scrollback.
- Dirty tracking and render snapshots.
- Selection across mutable history.
- Compression and memory limits.

### Do

- Implement a small 2D terminal grid.
- Add movement, SGR color, wrapping, and scrolling.
- Visualize a wide glyph across two cells.
- Add an alternate screen.
- Walk terminal state through libghostty-vt in C.
- Use the existing render-state API example.

### Ghostty trail

- `src/terminal/Terminal.zig`
- `src/terminal/ScreenSet.zig`
- `src/terminal/Screen.zig`
- `src/terminal/PageList.zig`
- `src/terminal/page.zig`
- `src/terminal/style.zig`
- `src/terminal/render.zig`
- `src/terminal/Selection.zig`
- `src/terminal/compress/`
- `example/c-vt-render/`

### Explain back

Trace `ESC [ 31 m A` from parser input to a styled cell.

## Day 5 — Concurrency and the output path

### Learn

- A surface as a concurrency unit.
- Application, IO, and renderer threads.
- Mailboxes and asynchronous wakeups.
- Shared terminal state and mutex ownership.
- Fairness and renderer starvation.
- Resize coalescing and synchronized output.
- Lifecycle, shutdown, and errors.

### Do

- Build a three-thread miniature pipeline.
- Inject sustained parser load.
- Observe renderer starvation.
- Add explicit handoff behavior.
- Visualize mailbox traffic and lock ownership.
- Trace one PTY read to one presented frame.

### Ghostty trail

- `src/Surface.zig`
- `src/termio/Thread.zig`
- `src/termio/Termio.zig`
- `src/termio/stream_handler.zig`
- `src/termio/message.zig`
- `src/renderer/State.zig`
- `src/renderer/Thread.zig`
- `src/renderer/message.zig`
- `src/App.zig`

### Explain back

Why does renderer state need explicit demand/handoff behavior in addition to a mutex?

## Day 6 — Unicode, shaping, fonts, and glyph atlases

### Learn

- Code points, graphemes, cells, and glyphs.
- East Asian width and emoji presentation.
- Font discovery and fallback.
- HarfBuzz shaping.
- FreeType and CoreText rasterization.
- Terminal-constrained shaping.
- Font metrics.
- Glyph atlas allocation and caching.
- Sprite and Nerd Font handling.

### Do

- Visualize code point, grapheme, and glyph differences.
- Shape ligatures and combining sequences.
- Rasterize glyphs to bitmaps.
- Build a small texture atlas.
- Trigger fallback.
- Trace an emoji and combining sequence through Ghostty.

### Ghostty trail

- `src/unicode/`
- `src/font/main.zig`
- `src/font/shape.zig`
- `src/font/Metrics.zig`
- `src/font/Atlas.zig`
- `src/font/SharedGrid.zig`
- `src/font/CodepointResolver.zig`
- `src/font/face/`
- `src/font/shaper/`
- `src/font/sprite/`

## Day 7 — GPU rendering from first principles

### Story

Compare the terminal renderer to a browser paint/compositing pipeline: terminal state resembles the engine's renderable model, cell buffers resemble paint data, and OpenGL/Metal submit work to the GPU. Explain the stricter grid model and specialized passes.

### Learn

- Buffers, textures, samplers, shaders, and pipelines.
- Vertex and fragment shaders.
- Instanced cell rendering.
- Foreground/background/image passes.
- Alpha blending and color spaces.
- Swap chains and frame lifetimes.
- OpenGL context ownership.
- Metal command buffers and render passes.
- Custom shaders and animation.

### Do

- Render a colored triangle.
- Render a terminal grid as quads.
- Sample a glyph atlas.
- Add backgrounds, text, cursor, and selection.
- Compare frame captures around dirty updates.
- Read the matching GLSL.
- Map the same abstractions to Metal.

### Ghostty trail

- `src/renderer/generic.zig`
- `src/renderer/OpenGL.zig`
- `src/renderer/Metal.zig`
- `src/renderer/opengl/`
- `src/renderer/metal/`
- `src/renderer/shaders/glsl/`
- `src/renderer/shaders/shaders.metal`
- `src/renderer/cell.zig`
- `src/renderer/image.zig`

### Explain back

Distinguish updating terminal render state, rebuilding cell buffers, submitting a frame, and presentation.

## Day 8 — Input stack and application runtimes

### Learn

- Physical key, logical key, text, modifiers, and IME.
- Keybindings versus terminal encoding.
- Kitty keyboard protocol.
- Mouse capture and reporting.
- Clipboard security.
- Preedit rendering.
- The `apprt` compile-time contract.
- Core actions crossing into native UI.

### Do

- Trace a normal key, keybinding, dead key, and paste.
- Encode keys and mouse events through libghostty-vt.
- Implement a tiny mock application runtime.
- Visualize input decision branches.
- Exercise dead-key and CJK scenarios from `HACKING.md`.

### Ghostty trail

- `src/input/`
- `src/input/key_encode.zig`
- `src/input/kitty.zig`
- `src/input/mouse_encode.zig`
- `src/Surface.zig`
- `src/apprt/action.zig`
- `src/apprt/runtime.zig`
- `src/apprt/surface.zig`
- `src/renderer/State.zig`

## Day 9 — Native platforms

### Shared architecture

- Core Zig `App` and `Surface`.
- Runtime implementations.
- Native ownership of windows, tabs, and splits.
- Actions and callbacks.
- Creation and destruction.
- C ABI boundary on macOS.

### Linux/GTK primary track

Learn GObject, Blueprint UI, signals, actions, lifecycle, Wayland/X11, IME, clipboard, DBus, portals, systemd, and cgroups.

Source trail:

- `src/apprt/gtk.zig`
- `src/apprt/gtk/App.zig`
- `src/apprt/gtk/Surface.zig`
- `src/apprt/gtk/class/application.zig`
- `src/apprt/gtk/class/window.zig`
- `src/apprt/gtk/class/surface.zig`
- `src/apprt/gtk/class/split_tree.zig`
- `src/apprt/gtk/ui/`
- `src/apprt/gtk/winproto/`
- `src/apprt/gtk/ipc/`

### macOS survey/elective

Learn Swift/SwiftUI essentials, AppKit integration, GhosttyKit C API, callback/userdata ownership, MetalView, tabs, splits, windows, and restoration.

Source trail:

- `src/main_c.zig`
- `macos/Sources/Ghostty/Ghostty.App.swift`
- `macos/Sources/Ghostty/Ghostty.Surface.swift`
- `macos/Sources/Helpers/MetalView.swift`
- `macos/Sources/Terminal/`
- `macos/Sources/Splits/`

### Explain back

Draw ownership and destruction for one GTK surface and one macOS surface.

## Day 10 — Maintainer workflow and capstone

### Learn

- Test organization and targeted filters.
- Benchmarks and regressions.
- Fuzzing malformed protocol input.
- Logging, inspector, crash reports, and Valgrind.
- Build options and packaging.
- Compatibility and de facto standards.
- Issue archaeology and change-risk analysis.
- Contribution and vouch workflow.

### Do

Diagnose seeded bugs in:

1. parser/terminal state;
2. threading/resize;
3. rendering or platform runtime.

For each: reproduce, hypothesize, add a regression test, fix, run focused checks, and explain the root cause.

### Ghostty trail

- `src/benchmark/`
- `test/`
- `.github/workflows/test.yml`
- `src/inspector/`
- `src/crash/`
- `HACKING.md`
- `CONTRIBUTING.md`
- `AI_POLICY.md`

## Core final assessments

### Architecture checkpoint

Draw and explain UI runtime, core app/surface, PTY/child, IO/parser, terminal state, renderer snapshot, font system, GPU backend, threads, and mailboxes.

### Byte to pixel

Trace:

```console
printf '\033[1;31mA\033[0m\n'
```

Include PTY bytes, parser transitions, SGR state, cell creation, render snapshot, font resolution, shaping, atlas, GPU buffers/shaders, and presentation.

### Pixel to byte

Trace a modified key press from native UI through input representation, binding resolution, mode-dependent encoding, mailbox, PTY write, and child application.

## Advanced electives

- Kitty graphics.
- OSC clipboard and hyperlinks.
- Search thread and viewport matching.
- Scrollback compression.
- SIMD parser and Unicode paths.
- Shell integration and command notifications.
- Configuration and generated documentation.
- Split-tree structures.
- Inspector and ImGui.
- Terminfo.
- WASM/browser runtime.
- libghostty-vt C ABI design.
- Crash reporting.
- Distribution, Flatpak, Snap, and Nix.
- Accessibility and IME deep dives.

## Post-camp maintainer ascent

Use an eight-week rotation:

| Week | Focus |
|---|---|
| 1 | Parser and terminal state |
| 2 | Unicode, fonts, and shaping |
| 3 | Renderer and GPU |
| 4 | Input, IME, mouse, clipboard |
| 5 | GTK runtime |
| 6 | macOS runtime and C ABI |
| 7 | Performance, fuzzing, crash diagnosis |
| 8 | Recent changes across all subsystems |

For each rotation:

1. Read five relevant commits.
2. Reconstruct one bug from its regression test.
3. Review one change before reading maintainer feedback.
4. Fix one seeded defect.
5. Write a subsystem architecture note.
6. Update the personal source map.
