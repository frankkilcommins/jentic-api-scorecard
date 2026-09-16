# Phase 26 Retrospective — Dark Mode Support for Formatter HTML

## Deviations from the spec

- **`plan.md` task 19 — `injectDarkMode` export**: plan described adding the function
  without specifying its visibility; it was initially exported, then un-exported in a
  fix-up commit after the pre-push review found no consumer use-case for a public API
  on the `"."` entry.

- **`plan.md` task 18 — signal component coverage gap**: four components were not
  fully covered by the explicit list in task 18: `SpecValidityMetadata` (border class),
  `LintResultsMetadata` (severity count spans), and the success boxes in
  `StructuralIntegrityMetadata` and `DescriptiveRichnessMetadata` retained hard-coded
  light-mode colour classes. Caught by the pre-push coverage reviewer.

- **`plan.md` task 19 — dark mode script robustness**: plan described the IIFE behaviour
  but did not specify error handling. `localStorage` calls gained try/catch guards
  (throws `SecurityError` in private browsing) and `matchMedia` got a `typeof` existence
  check after a robustness review during implementation.

- **`plan.md` task 22 — toggle button assertion**: spec said assert `id="dark-mode-toggle"`;
  the button is created dynamically via `btn.id = ...`, so the static HTML string
  `id="dark-mode-toggle"` never appears in the output. Assertion adjusted to
  `'dark-mode-toggle'` string presence.

- **`plan.md` task 23 — README variable table incomplete**: spec said document `--sc-*`
  variables; the `--score-color-*` variables (used by `CircularProgress`, `GradeBadge`,
  and signal border accents) were omitted. Added in the fix-up commit alongside Tailwind
  v4 `@custom-variant` guidance that the original README lacked.

## Root cause

<!-- Fill in after merging — why did the spec miss these? -->

## Lesson for future specs

- When a phase task says "apply dark mode to signal components", enumerate the full list
  of components explicitly in the plan rather than referencing a category. The coverage
  gap in this phase (four components partially missed) came from an implicit assumption
  that all components under `signals/` were covered when only the named subset was
  checked.

- When a plan task adds a new internal function, explicitly state whether it should be
  exported. The default instinct is to export for testability; the right answer depends
  on whether there is a genuine consumer use-case. Stating it in the plan avoids a
  fix-up commit.

- When speccing a `format.test.ts` assertion for dynamically-created DOM content, verify
  whether the content is static HTML (assertable as a string) or runtime JavaScript
  (assertable only as a script source substring). The two differ in what string to search
  for.

## Promotion candidate

No — these are empirical reminders for spec scaffolding, not load-bearing invariants for
`specs/tech-stack.md`.
