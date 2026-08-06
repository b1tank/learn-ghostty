# C-first Zig syntax bridge sprint

Goal: add compact, first-appearance Zig explanations to every published reconstruction chapter for learners coming from C, with TypeScript/Python translations only where they clarify rather than distort the low-level model.

## Design contract

- C is always the default and most detailed explanation.
- First syntax appearances use an interactive line-focused explorer.
- Ownership, pointers, allocation, stack/heap, lifetimes, and concurrency add a memory/lifetime diagram.
- TypeScript and Python tabs are optional; omit them when GC/high-level semantics would create a misleading analogy.
- When omitted, say briefly why the low-level operation has no useful direct equivalent.
- Later appearances use compact reminders and link back to the first explanation.
- Components must remain responsive, keyboard accessible, reduced-motion safe, and AI-clean Markdown must retain a textual equivalent.

## Tasks

- [ ] Build the reusable Starlight `SyntaxBridge` component with C-first tabs, optional TS/Python, line focus, and memory flow.
- [ ] Add an accessible plain-Markdown representation for Copy for AI and no-JavaScript use.
- [ ] Chapter 00: imports, `pub fn`, `!void`, tuples, formatting, process stack.
- [ ] Chapter 01: `@This`, `*App`, allocator create/destroy, `self.*`, `defer`/`errdefer`, heap versus stack.
- [ ] Chapter 02: comptime switch, module imports, exported function aliases.
- [ ] Chapter 03: optional values, runtime/core types, stable Surface pointers, teardown order.
- [ ] Chapter 04: slices, owned buffers, tagged unions, process capabilities.
- [ ] Chapter 05: extern structs, C imports, file descriptors, fork/exec, pointer casts.
- [ ] Chapter 06: fixed buffers, slices, incremental reads, mutable state.
- [ ] Chapter 07: tagged unions, state machines, optionals, switch expressions.
- [ ] Chapter 08: nested arrays, cell values, cursor mutation, enum style state.
- [ ] Chapter 09: opaque C types, extern functions, callback ABI, native ownership.
- [ ] Chapter 10: C shim, GL callbacks, coordinate systems, context/resource lifetime.
- [ ] Add responsive and keyboard browser assertions for every chapter.
- [ ] Run course validation, build, AI Markdown checks, and full UI audit.

## Hiccups & Notes

- TypeScript/Python explanations are intentionally absent when they would imply GC semantics equivalent to explicit allocation, raw pointers, fork safety, C ABI, or graphics-context ownership.
