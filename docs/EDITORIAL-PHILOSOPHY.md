# Teaching and editorial philosophy

## 1. Write to a student

The learner is experienced, but the material must not assume familiarity with terminal, graphics, Zig, GTK, or Swift jargon. Seniority is not permission to write opaque prose.

Use:

- direct, conversational language;
- short sections;
- concrete examples before abstractions;
- visuals before implementation detail;
- progressive disclosure;
- precise language after intuition is established.

Avoid:

- unexplained acronyms;
- walls of internal terminology;
- source dumps without motivation;
- report-like prose;
- definitions that merely replace one unknown term with three others;
- pretending an analogy is exact.

## 2. Required teaching sequence

Use this pattern whenever possible:

```text
Problem → historical context → intuitive analogy → precise term
→ visual model → miniature implementation → Ghostty implementation
```

Example PTY introduction:

> An old terminal was a separate physical device connected by wires. Programs wrote characters to that device and received keystrokes from it. When terminals became software, Unix still needed something that looked like those old wires. A PTY is that software replacement: one end belongs to the terminal emulator, while the other behaves like a terminal connection to the child program.

Only then introduce master/slave endpoints, sessions, process groups, controlling terminals, and line discipline.

## 3. Every layer answers six questions

1. What problem does this layer solve?
2. Why was the previous layer insufficient?
3. Who talks to this layer?
4. What form does data take at each boundary?
5. Where does this live in Ghostty?
6. What breaks if it is wrong?

A persistent system stack keeps the lesson oriented:

```text
Human
  ↓ keyboard, mouse, clipboard
Native UI — GTK / SwiftUI
  ↓ structured input events
Ghostty Surface and input system
  ↓ encoded bytes
PTY
  ↓ byte stream
Shell or terminal application

Terminal application
  ↓ text and control bytes
PTY
  ↓ byte stream
VT parser
  ↓ semantic actions
Terminal state/grid
  ↓ cells, styles, images
Text and GPU renderer
  ↓ pixels
Human
```

The active layer is highlighted while the others remain visible.

## 4. History explains modern oddities

History belongs directly beside the mechanism it explains, not only in an isolated history chapter. Cover:

- teletypes and physical terminals;
- ASCII control characters;
- why carriage return and line feed differ;
- serial connections and terminal capabilities;
- DEC VT terminals and ANSI/ECMA control sequences;
- Unix TTY drivers and line discipline;
- PTYs and software terminal emulators;
- `TERM` and terminfo;
- xterm as a de facto standard;
- Unicode and shaping;
- modern keyboard, hyperlink, clipboard, and graphics protocols;
- GPU acceleration and native desktop integration.

Each historical passage should end by showing the surviving modern constraint.

## 5. Browser and web comparisons

Terminals and browsers are both local interactive portals that transform incoming data into rendered output while carrying user input back to an application. Use this familiar comparison throughout where it helps.

| Terminal ecosystem | Browser ecosystem |
|---|---|
| Terminal byte stream | HTML/CSS/JS or network byte stream |
| VT parser | HTML tokenizer/parser |
| Terminal state/grid | DOM/layout state |
| Escape sequences | Markup, CSS, and browser APIs |
| Terminal application | Web application |
| Terminal emulator | Browser engine plus browser shell |
| PTY | Local bidirectional transport boundary, loosely comparable to a connection |
| Terminal modes | Page-controlled capabilities and state |
| Font shaping | Browser text shaping |
| Cell renderer | Layout, paint, and compositing |
| OpenGL/Metal renderer | Browser GPU compositor |
| GTK/SwiftUI application | Browser chrome/native shell |
| Terminfo | Capability detection and compatibility data |
| Kitty protocols | Browser or vendor API extensions |

Always state where an analogy stops working. For example:

> A VT parser resembles an HTML parser because both turn encoded input into meaningful operations. But terminal streams are mostly imperative—move the cursor, change color, erase a line—while HTML is mainly declarative. The comparison gives orientation, not equivalence.

## 6. Introduce vocabulary progressively

For each important term:

1. Everyday explanation.
2. Analogy or picture.
3. Formal name and exact meaning.

The visual glossary stores:

- plain-language meaning;
- formal definition;
- historical origin;
- neighboring concepts;
- Ghostty source locations;
- browser analogy when useful;
- common misconceptions.

## 7. Reference ladder

Every major topic offers three depths.

### Course explanation

The friendly visual explanation, read first.

### Official material

Cross-reference relevant official Ghostty resources, including when applicable:

- Ghostty website documentation;
- the pinned `README.md`;
- `HACKING.md`;
- `CONTRIBUTING.md`;
- `AI_POLICY.md`;
- libghostty Doxygen documentation;
- examples under `example/`;
- authoritative standards and design posts.

### Production source

Provide ordered source trails with:

- local browser source view;
- exact symbol and line context;
- “Open in VS Code” action;
- immutable GitHub link pinned to the taught commit;
- relevant tests and examples.

Do not list a bag of files when an execution-ordered trail is possible.

## 8. Required lesson loop

```text
See it → predict it → build a miniature version → run it
→ trace Ghostty → mutate and test → explain it back → transfer it
```

A standard lesson includes:

1. Outcome.
2. Position in the whole system.
3. Historical motivation.
4. Visual mental model.
5. Vocabulary.
6. Five-minute experiment.
7. Build-it-yourself lab.
8. Ghostty source trail.
9. Debugger or trace exercise.
10. Common wrong mental models.
11. Challenge and transfer question.
12. Explain-back.
13. Official references and further source trails.

## 9. Completion quality bar

A lesson is not ready merely because it is technically correct. Verify:

- Can the learner explain why the component exists?
- Is every important term introduced before use?
- Is there a useful analogy and are its limits clear?
- Is the component shown in the whole architecture?
- Does history explain strange behavior where relevant?
- Is there a concrete experiment before deep source reading?
- Are official references, tests, examples, and source links present?
- Does the prose sound like a patient teacher rather than an API manual?
- Does the learner have to demonstrate understanding rather than only click through?
