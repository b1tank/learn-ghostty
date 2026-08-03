# Learn Ghostty

A self-contained, scenario-driven course for understanding how Ghostty carries data from user input and terminal applications through PTYs, parsing, state, fonts, GPUs, native platforms, and back again.

Open **https://b1tank.github.io/learn-ghostty/**. No clone, server, CLI, account, or AI is required.

## Who it is for

Experienced engineers who are new to terminal internals, including real humans preparing to contribute responsibly to Ghostty, libghostty, GTK/macOS integrations, renderers, terminal protocols, testing, examples, or the surrounding ecosystem.

## Published scenarios

- Open Ghostty and run colored `ls` and ordinary `cat`
- Run Codex as a long-lived terminal UI
- Run tmux with panes and persistent sessions
- SSH to a remote shell and add remote tmux

Each starts with what the user does, labels data at every boundary, introduces jargon only when needed, uses analogies with explicit limits, and links narrow pinned source excerpts.

## Optional AI

Every lesson has Copy for AI. It copies the current section as clean Markdown with URL, progress, pinned source, `~/learn-ghostty`, `~/ghostty`, and an empty question field. It works with any LLM or agent. AI is never required.

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
