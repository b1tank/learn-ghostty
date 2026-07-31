# UI/UX theme and quality audit plan

## Objective

Make the learning cockpit feel intentional and dependable in dark, light, and system-following modes, then establish a repeatable audit that catches theme, responsive, accessibility, and interaction regressions before they are pushed.

This document began as the pre-fix audit and now records the completed remediation and post-fix evidence.

## Remediation status

All five planned phases are complete:

- [x] Semantic light and dark theme architecture.
- [x] Explicit System / Light / Dark control with live system following.
- [x] Responsive layout, focus visibility, and practical hit targets.
- [x] Idempotent checkpoints and exact-section resume.
- [x] Interaction accessibility, recovery states, offline typography, and repeatable browser audit.

## Quality principles

1. **Theme is a product feature, not a CSS afterthought.** Every surface, state, and interaction must be designed in both light and dark palettes.
2. **System means live system following.** Selecting System must react when the OS preference changes, persist as System, and remain selectable after a manual override.
3. **A real person must be able to see, point, tap, tab, understand, recover, and resume.** Screenshot similarity alone is insufficient.
4. **Semantic tokens over raw colors.** Components describe roles such as surface, text, border, accent, code, success, and warning rather than embedding dark-theme values.
5. **The audit is executable.** Viewport overflow, theme state, contrast-sensitive tokens, focus visibility, target sizing, page availability, and critical interactions receive automated checks plus visual human-style verification.

## Pre-fix verification method

### Human-style visual inspection

Deskpal launched real Chrome windows against the running local server and inspected:

- dashboard at 1400×950;
- dashboard at a 420 px content viewport;
- Lesson 00 at desktop and mobile widths;
- manual use of the visible appearance toggle.

### Browser behavior inspection

A real Chromium engine was driven at 390, 420, 768, 1024, and 1440 px widths to inspect layout bounds, computed styles, theme persistence, accessible controls, focus rendering, and interaction results.

### Interaction walkthrough

The audit exercised:

- dashboard → Lesson 00 navigation;
- prediction reveal;
- architecture layer selection;
- animated byte journey;
- allowlisted local source-check lab;
- route navigation and theme persistence;
- keyboard tab traversal;
- system light and system dark media preferences.

## Findings before remediation

### P0 — Light mode is functionally broken

The VitePress appearance control changes its icon and removes the document's `dark` class, but the page remains visually dark. Computed values after selecting Light are still:

```text
body background    rgb(7, 17, 15)
body text          rgb(242, 246, 237)
cockpit background rgb(7, 17, 15)
nav background     rgba(7, 17, 15, 0.88)
```

Root cause: dark colors are assigned unconditionally under `:root`, while many components also embed literal dark backgrounds and light foreground assumptions. There is no light semantic palette.

### P0 — System mode cannot be explicitly restored

VitePress correctly chooses the initial mode from `prefers-color-scheme` when storage is `auto`; this was verified for both emulated system light and system dark. However, the visible control is a two-way light/dark switch. After a manual selection, the UI offers no clear way to return to System.

A static dark `<meta name="theme-color">` also remains wrong for light mode.

### P0 — Keyboard focus is not reliably visible

Custom controls inherit the browser's dark/black default outline. On dark surfaces this can be effectively invisible. The interaction audit showed black focus outlines on source buttons, links, checkpoints, and anchors. There is no consistent `:focus-visible` treatment matching the visual language.

### P1 — Several lesson controls have undersized hit targets

The byte-journey stage buttons measure approximately 152×12 px at desktop. Their text can be clicked, but the vertical target is far below a comfortable pointer/touch target. Some text links are around 21 px high. Interactive visual controls need a 40–44 px practical target or an equivalent padded clickable region.

### P1 — Navigation overflows around the tablet breakpoint

At a 768 px viewport, the document width becomes 794 px. The VitePress overflow/extra navigation extends 26 px beyond the viewport. Widths 390, 1024, and 1440 did not show page-level horizontal overflow. The nav breakpoint and custom title/search footprint need adjustment.

### P1 — Theme-sensitive values are scattered

The stylesheet contains many literal dark fills and dark-mode alpha colors. `ProgressRing.vue` also defaults directly to `#b9ff4b`. This makes visual review incomplete and future theme changes risky.

### P1 — Checkpoint state is not hydrated into controls

A checkpoint writes durable progress, but after refresh each checkpoint component initially looks unsaved and can produce duplicate activity events. The dashboard knows durable state; individual lesson checkpoints do not read it.

### P1 — “Resume” does not resume the exact section

The dashboard displays a durable step such as `welcome`, but the lesson link opens at the top rather than mapping the step to an anchor and scrolling to the exact checkpoint.

### P2 — Dynamic feedback needs stronger accessibility semantics

Prediction reveals, journey animation, lab completion, source notices, and checkpoint saves update visually but generally lack `aria-live`, `aria-expanded`, selected-tab semantics, or reduced-motion handling.

### P2 — Error and loading recovery is thin

The dashboard and source viewer explain that the server may be unavailable, but do not provide a retry action. Lab and progress errors do not consistently expose durable, actionable recovery states.

### P2 — Offline typography does not match the local-first promise

The design imports Google Fonts. System fallbacks work if unavailable, but the polished typography is network-dependent. Font assets should be local or the promise should be narrowed.

### Passed observations

- System preference detection itself works for initial `auto` state.
- Dashboard and Lesson 00 are visually strong in dark mode at desktop.
- Mobile dashboard and lesson layouts avoid document-level horizontal overflow at 390/420 px; the intentionally off-canvas VitePress sidebar does not enlarge scroll width.
- 1024 and 1440 px dashboard layouts do not overflow.
- Prediction, architecture selection, byte journey, and native lab interactions function.
- Source path traversal remains rejected.
- Main page heading order is understandable inside content, though VitePress sidebar headings appear earlier in raw DOM order.
- Buttons and source actions have textual names; the built-in icon theme control is the notable naming ambiguity found by the simple audit.

## Remediation plan

### Phase 1 — Theme architecture and zero-flash system behavior

1. Define a complete light palette on `:root` and a complete dark palette on `.dark`.
2. Introduce semantic Learn Ghostty tokens for page, navigation, panel, elevated panel, inset panel, code, text, muted text, border, accent, cyan, warning, success, on-accent, glow, and focus.
3. Replace theme-sensitive literal colors in all dashboard, lesson, source, and course-map components.
4. Keep the source-code canvas intentionally dark only if it is clearly framed as a code surface and passes contrast in both parent themes.
5. Replace the static browser theme color with a value synchronized to the effective palette.
6. Add an inline pre-paint initializer so stored/system theme is applied before first render.

### Phase 2 — Explicit System / Light / Dark control

1. Disable VitePress's two-state appearance switch.
2. Add a keyboard-accessible three-state appearance control to desktop and mobile navigation slots.
3. Persist `system`, `light`, or `dark` explicitly.
4. In System mode, subscribe to `matchMedia('(prefers-color-scheme: dark)')` changes and update live.
5. Make the control announce both selected preference and effective mode.
6. Verify mode persists across dashboard, lesson, course-map, source viewer, refresh, and a new tab.

### Phase 3 — Correct high-impact UX defects found by the audit

1. Add a high-contrast, consistent `:focus-visible` ring with sufficient offset on every custom interactive element.
2. Increase interactive journey, architecture, source, checkpoint, and navigation targets to a practical minimum size.
3. Remove the 768 px nav overflow and recheck neighboring widths from 700–900 px.
4. Give disabled/planned course stages semantic non-link markup rather than anchor elements without destinations.
5. Hydrate checkpoint components from durable course state and make writes idempotent.
6. Map durable step IDs to lesson anchors so Resume opens the exact section.

### Phase 4 — Interaction and accessibility hardening

1. Add `aria-live` feedback for saves, labs, source actions, and animated journey state.
2. Add `aria-expanded` to reveal controls and selected/tab semantics to architecture and journey controls.
3. Honor `prefers-reduced-motion` and provide an immediate/non-animated journey result.
4. Add visible retry controls to API-dependent error states.
5. Bundle or self-host the chosen fonts for offline consistency.

### Phase 5 — Repeatable audit tooling

Add a browser audit command that checks the following matrix:

| Dimension | Coverage |
|---|---|
| Pages | Dashboard, Lesson 00 top/middle/end, Course map, Source viewer, 404 |
| Theme | Light, Dark, System→Light, System→Dark, live system change |
| Width | 390, 420, 768, 1024, 1440 |
| State | Loading, success, server error, progress 0%, progress partial, lab pass/fail |
| Input | Pointer, keyboard-only, touch-sized viewport, reduced motion |
| Persistence | Route change, reload, new tab |

Automated assertions:

- no unexpected document overflow;
- effective theme and stored preference agree;
- system media changes update only in System mode;
- theme-color metadata matches effective mode;
- no unnamed custom controls;
- focus-visible style has sufficient contrast;
- custom control target dimensions meet the chosen standard;
- available routes return content and planned routes are not clickable;
- core interactions produce expected state;
- source and progress API failures produce recoverable UI;
- production build passes.

Human-style visual verification:

- capture representative screenshots for every page in both palettes at desktop and mobile;
- inspect hierarchy, contrast, density, wrapping, clipping, hover/focus/pressed/disabled states;
- perform one complete Lesson 00 journey using pointer and one using keyboard only;
- test OS theme change while the page remains open.

## Post-fix verification results

### Automated browser audit

`npm run audit:ui` drives real Chromium and verifies more than 130 assertions across:

- Dashboard, Lesson 00, Course map, Source viewer, and 404 page.
- Light, Dark, System→Light, System→Dark, and live System changes.
- 390, 420, 768, 1024, and 1440 px viewports.
- Horizontal overflow, semantic theme state, metadata, palette contrast, control names, focus visibility, hit targets, reduced motion, key interactions, native lab success, and recoverable API error UI.
- Mobile navigation exposes all three theme modes with named, touch-sized controls.

### Human-style visual verification

Deskpal-controlled real Chrome verified:

- the dashboard in dark and light modes at 1400×950;
- Lesson 00 in light mode with sidebar and outline;
- the source viewer in light mode with an intentionally dark, legible code canvas;
- Lesson 00 at a mobile-sized display in dark mode;
- visible selection state for Auto, Light, and Dark;
- visual continuity while navigating between routes.

### Functional evidence

- System mode reacts live to a changed `prefers-color-scheme` value and remains stored as System.
- Light and Dark persist through route changes.
- Browser `theme-color` tracks the effective mode.
- A repeated checkpoint no longer duplicates activity.
- Checkpoint buttons hydrate as saved after refresh.
- Resume links include the durable lesson anchor and land at the correct section.
- Reduced-motion mode completes the byte journey immediately.
- Google Fonts network dependencies were removed; VitePress's bundled Inter and system monospace fonts are used.
- The 768–799 px navigation overflow is fixed.

### Hiccups and workarounds

- During the resume test, the shell changed into the browser-tools directory before restoring the learner-state fixture, so the first relative restore failed. The state was immediately restored using its absolute path and verified back at the untouched starting state.
- The first semantic-color conversion exposed three fractional-alpha translations (`.3`, `.1`, and `.035`) that needed explicit percentages. They were corrected to 30%, 10%, and 3.5%, and the automated contrast/visual checks now cover the resulting palette.
- The source-code canvas intentionally remains dark in both themes. It is framed as a distinct read-only code surface and uses dedicated contrast tokens rather than leaking dark assumptions into the surrounding light page.

## Acceptance gates before commit and push

- [x] Light mode is visually designed, not merely inverted.
- [x] Dark mode preserves the current identity without regressions.
- [x] System can always be selected and follows a live OS preference change.
- [x] No flash of the wrong theme on reload.
- [x] Theme choice persists across all routes and a new tab.
- [x] All audited pages pass at 390, 768, 1024, and 1440 px without unexpected horizontal scroll.
- [x] Focus is clearly visible and primary custom controls have practical hit targets.
- [x] Lesson checkpoints resume accurately and do not duplicate completion events.
- [x] Automated UI audit, course checks, security check, and production build pass.
- [x] Deskpal visual verification confirms desktop/mobile and light/dark/system behavior in real Chrome.

## Delivered commit structure

1. `refactor: introduce semantic light and dark palettes`
2. `feat: add system-aware appearance selector`
3. `fix: harden responsive and keyboard interactions`
4. `fix: make lesson resume state durable and exact`
5. `fix: improve interactive accessibility and recovery`
6. `test: add cross-theme UI audit`
7. `docs: record UI audit outcomes`
