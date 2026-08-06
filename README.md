# Learn Ghostty

A self-contained Astro Starlight workshop for reconstructing Ghostty one observable subsystem at a time.

Open **https://b1tank.github.io/learn-ghostty/**. Reading requires no clone, server, account, CLI, or AI. The companion `ghostty-from-scratch` repository holds the real implementation checkpoints and visual evidence.

## Learning method

Each chapter starts with a visible result, then talks the learner through the source in the order they would naturally read it: entrypoint, imported name, called function, owner, and cleanup. The voice is a teacher sitting beside a freshman C programmer, not a formal architecture report. Ghostty's Git history remains the causal spine. The learner sees the earliest relevant implementation, the reconstruction checkpoint, and the pinned current design as **then → reconstruction → now**. Files are labeled exact, adapted, temporary, or deliberately redesigned.

The published path now contains the first Zig process, App ownership, entry routing, runtime/Surface split, a measured ordinary-pipes limitation, the first Linux PTY session, a finite Termio ownership checkpoint, an incremental VT parser, fixed terminal state, the first real native GTK window, and a regionally verified OpenGL rectangle. These are narrow teaching checkpoints, not claims of ordinary-terminal or cross-platform support. Later chapters are written only after the previous checkpoint is learned and validated.

The existing `ls`, Codex, tmux, and SSH scenarios remain available as optional Field Guides rather than the primary curriculum.

## Optional AI

Every published chapter and field guide has Copy for AI. It copies clean current-section Markdown with page, progress, local paths, pinned source, and an empty question field. It works with any LLM or agent and is never required.

## Contributor setup

```console
git submodule update --init
npm install
npm run dev
```

Validate course data and build the static site:

```console
npm run check
npm run build
```

## Current design docs

- [Architecture](docs/ARCHITECTURE.md)
- [Content guide](docs/CONTENT-GUIDE.md)
- [Historical method](docs/HISTORICAL-METHOD.md)
- [Roadmap and current gate](docs/ROADMAP.md)
