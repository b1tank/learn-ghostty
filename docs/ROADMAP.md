# Reconstruction roadmap

Chapters 00–10 are published and were replayed from their implementation tags during the current pause debrief. A chapter becomes public after its code checkpoint, exact command, observable result, provenance, historical and current source comparisons, and responsive review is complete. Passing a chapter proves that fixture, not production or platform support.

**Chapter 10 passed its renderer-readiness gate locally: GTK Surface ownership, capture-only close, C shim, OpenGL capability evidence, native CI configuration, and pixel-region verification are present.**

1. **A process exists** — one Zig executable and one visible line *(published)*
2. **App lifecycle** — stable allocation, initialization, temporary run, cleanup, and destruction *(published)*
3. **Entrypoint routing** — typed build configuration and Ghostty-shaped entry selection *(published)*
4. **Runtime and Surface** — shared core versus a temporary headless platform runtime *(published)*
5. **Child process through pipes** — launch succeeds while all standard streams report non-terminal semantics *(published)*
6. **PTY** — terminal device, session, process group, and fixed window size *(published)*
7. **Termio** — finite interactive PTY child, incremental reads, writes, exit, and teardown *(published)*
8. **Parser** — chunk-invariant printable, control, and SGR actions *(published)*
9. **Terminal state** — cells, styles, cursor, and deterministic debug rendering *(published)*
10. **First native window** — opt-in GTK4 runtime, blank surface, and real screenshot *(published)*
11. **First GPU rectangle** — runtime Surface owns GtkGLArea; OpenGL capabilities recorded; one known rectangle; regional pixel verification *(published)*
12. **Fonts, input, and production architecture** — first glyph, resize, keyboard input, threads, and mailboxes

The roadmap describes dependency order, not prewritten content. Build only the next chapter after using and auditing the current frontier.

Pending product decisions use these recommended defaults unless the learner chooses otherwise:

- Linux-first GTK4/GtkGLArea/OpenGL 4.3 track;
- Xvfb/llvmpipe as deterministic CI evidence plus native Wayland evidence before a general GTK support claim;
- completed chapters remain narrow teaching checkpoints, with limitations fixed at the earliest gate they invalidate rather than retrofitted wholesale.

## Field guides

The `ls`/`cat`, Codex, tmux, and SSH walkthroughs remain published as optional integration references. They do not advance reconstruction progress.
