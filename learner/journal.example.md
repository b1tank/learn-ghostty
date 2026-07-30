# Current learning state

## Where I stopped

CSI parser parameter accumulation.

## What I can explain

- Ground and escape states.
- Exit, transition, and entry actions.
- Difference between parser output actions and terminal mutation.

## Current confusion

- Why `Parser.next` can return three actions.
- Lifetime of slices inside CSI actions.

## Next action

Implement semicolon-separated parameters in the toy parser.
