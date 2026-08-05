# Historical reconstruction method

Ghostty's current architecture is the accumulated answer to problems encountered over time. Learn Ghostty therefore teaches a subsystem through its source history as well as its present form.

## Required chapter spine

Every published reconstruction chapter answers four questions:

1. **Before:** What code and behavior existed before this responsibility appeared?
2. **Pressure:** What concrete behavior, limitation, or platform need made the next change useful?
3. **Then:** Which earliest relevant commit introduced the responsibility, and what did that implementation actually own?
4. **Now:** How does the pinned current implementation differ, and which later constraints explain the added structure?

The learner's reconstruction sits between **then** and **now**. It may stop earlier than Ghostty historically did when doing so exposes an otherwise hidden boundary.

## Research procedure

Use the local pinned Ghostty repository rather than memory:

```console
git log --reverse -- <path>
git log -S'<symbol or behavior>' --all -- <path>
git log -G'<structural pattern>' --all -- <path>
git show <commit>:<path>
git blame <commit> -- <path>
```

Follow renames and inspect neighboring commits when a change only makes sense as part of a short sequence. Read commit messages as evidence of author intent, not infallible specification.

## Evidence rules

A historical reference includes:

- the full 40-character commit ID in chapter metadata;
- date, path, and exact line range;
- an immutable repository URL;
- what responsibility appeared;
- the surrounding pressure or limitation;
- a distinction between verified facts and interpretation.

Do not claim a commit is "the first" until repository history supports that statement. Do not describe modern abstractions as if the original author already intended their final shape.

## Presentation

Use a compact **then → reconstruction → now** comparison before detailed source reading. Keep each stage focused on ownership and observable behavior, not code volume.

Historical code is not automatically the recommended design. Current code is not automatically appropriate for the current reconstruction frontier. The chapter explains why each version has the size it does.

## Validation

`npm run check` verifies that every published reconstruction chapter has at least one historical reference and that each commit/path/range exists in the pinned Ghostty repository. CI runs `npm run fetch:history` first, fetching only referenced commits that are absent from its shallow submodule checkout.
