# Learn Ghostty

A self-contained Astro Starlight workshop for reconstructing Ghostty one observable subsystem at a time.

Open **https://b1tank.github.io/learn-ghostty/**. Reading requires no clone, server, account, CLI, or AI. The companion `ghostty-from-scratch` repository holds the real implementation checkpoints and visual evidence.

## Learning method

Each chapter starts with a visible result, builds only the code required to reach it, explains every introduced boundary, and compares the reconstruction with historical and current Ghostty source. Files are labeled exact, adapted, temporary, or deliberately redesigned.

The published path currently begins with Chapter 00: one Zig executable and one line of output. Later chapters are written only after the previous checkpoint is learned and validated.

The existing `ls`, Codex, tmux, and SSH scenarios remain available as optional Field Guides rather than the primary curriculum.

## Optional AI

Every published chapter and field guide has Copy for AI. It copies clean current-section Markdown with page, progress, local paths, pinned source, and an empty question field. It works with any LLM or agent and is never required.

## Contributor setup

```console
git submodule update --init
npm install
npm run dev
```

Checks:

```console
npm run check
npm run audit:ui
npm run build
```

## Current design docs

- [Architecture](docs/ARCHITECTURE.md)
- [Content guide](docs/CONTENT-GUIDE.md)
- [Roadmap](docs/ROADMAP.md)
- [Follow-ups](docs/FOLLOW-UPS.md)
