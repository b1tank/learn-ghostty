# Reconstruction roadmap

Chapters 00–06 are published. A chapter becomes public after its code checkpoint, exact command, observable result, provenance, historical and current source comparisons, and responsive browser audit are complete.

1. **A process exists** — one Zig executable and one visible line *(published)*
2. **App lifecycle** — stable allocation, initialization, temporary run, cleanup, and destruction *(published)*
3. **Entrypoint routing** — typed build configuration and Ghostty-shaped entry selection *(published)*
4. **Runtime and Surface** — shared core versus a temporary headless platform runtime *(published)*
5. **Child process through pipes** — launch succeeds while all standard streams report non-terminal semantics *(published)*
6. **PTY** — terminal device, session, process group, and fixed window size *(published)*
7. **Termio** — live PTY child, incremental reads, writes, exit, and teardown *(published)*
8. **Parser** — chunk-invariant printable, control, and VT actions
9. **Terminal state** — cells, styles, cursor, modes, screens, deterministic debug rendering
10. **First native window and GPU frame** — GTK, blank surface, first rectangle
11. **Fonts, input, and production architecture** — first glyph, resize, keyboard input, threads, and mailboxes

The roadmap describes dependency order, not prewritten content. Build only the next chapter after using the current one.

## Field guides

The `ls`/`cat`, Codex, tmux, and SSH walkthroughs remain published as optional integration references. They do not advance reconstruction progress.
