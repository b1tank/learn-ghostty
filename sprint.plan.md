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

- [x] Build the reusable Starlight `SyntaxBridge` component with C-first tabs, optional TS/Python, line focus, and memory flow.
- [x] Add an accessible plain-Markdown representation for Copy for AI and no-JavaScript use.
- [x] Chapter 00: imports, `pub fn`, `!void`, tuples, formatting, process stack.
- [x] Chapter 01: `@This`, `*App`, allocator create/destroy, `self.*`, `defer`/`errdefer`, heap versus stack.
- [x] Chapter 02: comptime switch, module imports, exported function aliases.
- [x] Chapter 03: optional values, runtime/core types, stable Surface pointers, teardown order.
- [x] Chapter 04: slices, owned buffers, tagged unions, process capabilities.
- [x] Chapter 05: extern structs, C imports, file descriptors, fork/exec, pointer casts.
- [x] Chapter 06: fixed buffers, slices, incremental reads, mutable state.
- [x] Chapter 07: tagged unions, state machines, optionals, switch expressions.
- [x] Chapter 08: nested arrays, cell values, cursor mutation, enum style state.
- [x] Chapter 09: opaque C types, extern functions, callback ABI, native ownership.
- [x] Chapter 10: C shim, GL callbacks, coordinate systems, context/resource lifetime.
- [x] Add responsive and keyboard browser assertions for every chapter.
- [x] Run course validation, build, AI Markdown checks, and full UI audit.

## Hiccups & Notes

- TypeScript/Python explanations are intentionally absent when they would imply GC semantics equivalent to explicit allocation, raw pointers, fork safety, C ABI, or graphics-context ownership.
- Every published reconstruction chapter now has one first-appearance bridge. C is always selected first; TypeScript or Python appears only for output effects, export aliases, discriminated unions, or no-copy typed-array views that can be qualified accurately.
- Each bridge is server-rendered, keyboard-operable, container-responsive, and paired with an authored `Text version` paragraph retained by AI-clean Markdown.
- The browser audit covers all eleven bridges at 390, 768, and 1440 pixels in both themes, plus ArrowRight behavior and explicit language-omission reasons. The final audit passed 979 assertions.
- Visual spot checks covered Chapter 00 at 1280×900 and Chapter 06 at 390×844; code uses local horizontal scrolling while explanations and memory flow reflow to one column.
