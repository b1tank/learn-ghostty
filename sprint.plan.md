# Sprint plan — consistent action rows and sequential cards

## Sprint goal

Make consecutive buttons, links, and cards align predictably across every Learn Ghostty page and component, while adding compact functional icons that make repeated actions easier to recognize. Validate the result at constrained article widths and deploy through the existing GitHub Pages workflow.

## Prioritized tasks

- [x] **1. Normalize consecutive control and card geometry**
  - Audit every component-owned action row and repeated card/grid sequence.
  - Give sibling controls one shared height, inline alignment, wrapping behavior, and icon-safe spacing.
  - Stretch cards within each grid row and keep card content anchored consistently without crushing text at narrow article widths.

- [x] **2. Add recognizable icons to repeated actions and navigation**
  - Add decorative, accessible SVG icons to source actions, lesson actions, chapter navigation, reconstruction resume actions, and data-flow previous/next controls.
  - Preserve visible labels and existing accessible names; icons supplement rather than replace text.
  - Keep icon sizing and alignment shared instead of introducing component-specific drift.

- [x] **3. Add regression coverage for alignment and icon affordances**
  - Extend the browser audit to check action-control heights, top alignment, repeated-card geometry, icon presence, and narrow-width wrapping on representative routes.
  - Cover desktop, constrained desktop article width, and mobile behavior.

- [x] **4. Run publication gates and deploy**
  - [x] Run `npm run check`, `npm run audit:ui`, and `npm run build`.
  - [x] Push the focused commits to the current branch so the existing GitHub Pages workflow deploys the update.

## Definition of done

- Consecutive controls share a stable height and vertical position unless intentionally stacked by a responsive layout.
- Repeated cards start and stretch consistently within each row at desktop and constrained article widths.
- Repeated actions have recognizable icons plus readable labels.
- Course validation, UI audit, and production build pass.
- The deployment commit is pushed to the current branch.

## Hiccups & Notes

- The first full browser audit exceeded the initial 180-second command timeout. Re-running with a 600-second allowance completed successfully; after rebasing onto concurrent upstream chapter work, the final audit passed 814 assertions across 19 routes, two themes, and three viewport widths.
- Shared control geometry now covers lesson, source, reconstruction, data-flow, and commit-history action rows. Grid cards explicitly stretch within rows and collapse to aligned single-column cards at narrow widths.
- Functional SVG icons supplement—rather than replace—visible labels in action rows, Copy for AI options, chapter navigation, roadmap states, and the homepage method cards.
- Final local publication gates pass: `npm run check`, `npm run audit:ui`, and `npm run build`.
- The first authorized push was safely rejected as non-fast-forward because three concurrent commits had reached `origin/main`. The sprint commits rebased cleanly onto those changes, all publication gates passed again, and the updated push received fresh confirmation.
