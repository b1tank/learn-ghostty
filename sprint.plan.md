# Sprint plan — simple website, roadmap resume, and Copy for AI

## Sprint goal

Refactor Learn Ghostty into the straightforward experience agreed with the learner: a self-contained website that explains itself immediately, shows the complete roadmap, resumes the last section automatically, and lets any lesson or section be copied as clean vendor-neutral context for any AI, LLM, or coding agent.

## Prioritized tasks

- [ ] **1. Simplify browser progress around lessons and sections**
  - Track last visited lesson and heading automatically.
  - Keep explicit, always-available “Mark lesson complete.”
  - Keep all published lessons freely accessible.
  - Add export and confirmed restart-from-scratch with backup action.
  - Preserve existing notebook evidence without making it the homepage vocabulary.

- [ ] **2. Replace the homepage with a clear first-visit and return experience**
  - Explain what Learn Ghostty is, who it serves, how to use it, and what it covers.
  - Explicitly call out experienced engineers new to terminals and real humans preparing to contribute responsibly to the Ghostty ecosystem.
  - Show one complete clickable roadmap directly on the homepage.
  - On revisit, show the exact lesson/section and one-click Resume.

- [ ] **3. Add predictable lesson navigation and automatic resume**
  - Add breadcrumbs, lesson position, current roadmap location, previous/next links, and Back to roadmap.
  - Track the most recently viewed section with IntersectionObserver.
  - Add Mark lesson complete without assessment gating.
  - Keep VitePress’s default sidebar, outline, search, and heading anchors.

- [ ] **4. Add a vendor-neutral Copy for AI menu inspired by Claude Docs**
  - Primary click copies the current section with URL, progress metadata, clean Markdown, source snapshot, local paths, and an empty question field.
  - Menu actions: current section, full lesson, current section plus notes, view Markdown, page URL, local course path.
  - Generate AI-clean Markdown at build/dev time without Vue imports or component markup.
  - Exclude notebook answers by default.

- [ ] **5. Improve source-reference actions**
  - Provide pinned remote GitHub source.
  - Copy `~/ghostty/...` local paths.
  - Copy a neutral source-context block for AI.
  - Remove dependence on local editor/source APIs from the default learner path.

- [ ] **6. Align optional AI and contributor guidance**
  - Make Pi, Claude, Codex, ChatGPT, Copilot, Cursor, and local agents equal optional consumers of copied context.
  - Teach local agents to resolve copied page URLs and paths in `~/learn-ghostty` and `~/ghostty`.
  - Reference official Ghostty docs, contribution guide, and AI policy at the point where contributor intent is introduced.

- [ ] **7. Audit the complete UX and publish**
  - Verify first visit, returning resume, section tracking, lesson completion, open roadmap links, reset/export flow, and all Copy for AI actions.
  - Verify public base path, dark/light, desktop/mobile, keyboard, static/no-API mode, source actions, and clean Markdown output.
  - Run full course, security, browser, production build, and dependency checks.

## Definition of done

- A new visitor understands the site and starts learning from the first viewport.
- A returning visitor resumes the exact section from the homepage.
- The complete roadmap is always visible and every published lesson is open.
- Any section can be copied into any AI without requiring filesystem or website access.
- Local agents receive useful `~/learn-ghostty` and `~/ghostty` paths.
- Reset offers export before destructive confirmation.
- No learner-facing instruction requires `camp`, a clone, a server, or Pi.

## Hiccups & Notes

_Record implementation blockers, workarounds, and final verification here._
