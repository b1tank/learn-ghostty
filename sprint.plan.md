# Zig for C programmers reference sprint

Goal: turn the existing chapter-local Zig syntax bridges into a permanent, cumulative reference for experienced C programmers without teaching syntax before it appears in the reconstruction.

## Prioritized tasks

- [ ] Add a dedicated, searchable `Zig for C programmers` reference page covering syntax introduced in Chapters 00–10, with C mental models, important semantic differences, and links back to first appearances.
- [ ] Add the reference to the Tools navigation and link every embedded Syntax Bridge to the relevant reference section.
- [ ] Extend course and browser checks to protect the reference route, version scope, chapter provenance links, and responsive bridge-to-reference navigation.
- [ ] Run `npm run check`, `npm run build`, and `npm run audit:ui`; record final results.
- [ ] Push the completed commits after the repository, branch, and authenticated GitHub identity are verified and the required immediate public-write confirmation is obtained.

## Design contract

- Write for an experienced C programmer, but describe C as a mental model rather than an exact translation.
- Scope claims to Zig `0.16.0`, the reconstruction's required version.
- Correct common traps explicitly: local type inference, binding versus pointee mutability, error unions versus errno conventions, `defer` scope-exit behavior, `pub` versus ABI export, and Zig pointer categories.
- Introduce only syntax already present in published Chapters 00–10.
- Keep chapter bridges contextual and the reference cumulative; avoid copying entire lesson explanations.
- Preserve static rendering, Pagefind searchability, keyboard access, responsive layout, and base-path-safe links.

## Hiccups & Notes

- The invocation input was `go`; the sprint goal is inferred from the immediately preceding accepted recommendation for a cumulative Zig-for-C reference backed by existing chapter Syntax Bridges.
- Public pushing is governed by the repository's confirmation policy. Local implementation and commits may proceed, but pushing requires identity verification and immediate confirmation of the exact remote write.
