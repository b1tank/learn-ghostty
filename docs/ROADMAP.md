# Reconstruction roadmap

Chapters 00 and 01 are published. A chapter becomes public after its code checkpoint, exact command, observable result, provenance, historical and current source comparisons, and responsive browser audit are complete.

1. **A process exists** — one Zig executable and one visible line *(published)*
2. **App lifecycle** — stable allocation, initialization, temporary run, cleanup, and destruction *(published)*
3. **Entrypoint routing** — generated build configuration and Ghostty-shaped entry selection
4. **Runtime and Surface** — shared core versus a temporary headless platform runtime
5. **Child process and PTY** — first pipes, demonstrated limitation, terminal semantics
6. **Termio and parser** — I/O ownership and VT actions
7. **Terminal state** — cells, styles, cursor, modes, screens, deterministic debug rendering
8. **First native window and GPU frame** — GTK, blank surface, first rectangle
9. **Fonts, input, and production architecture** — first glyph, resize, keyboard input, threads, and mailboxes

The roadmap describes dependency order, not prewritten content. Build only the next chapter after using the current one.

## Field guides

The `ls`/`cat`, Codex, tmux, and SSH walkthroughs remain published as optional integration references. They do not advance reconstruction progress.
