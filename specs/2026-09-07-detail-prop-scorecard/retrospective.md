# Phase 24 Retrospective — Add `detail` prop to `<Scorecard>` React component

## Spec deviations

1. **`plan.md` missing roadmap-completion task** — `plan.md` as scaffolded had no Group 4 (docs + lifecycle) to append `✅` to `specs/roadmap.md`. Detected in Phase 2 before implementation started; added Group 4 as a pre-implementation amendment (commit `17b5730`) so the plan remained the source of truth for ordering.

2. **`flatMap` parameter renamed** — `plan.md` described adding the `detail` prop without noting that the existing flatMap callback already used `detail` as its parameter name (`data.details.flatMap((detail) => ...)`). The new prop would shadow it; renamed the callback param to `d` (commit `c31d8e8`). Surgical, required — not cosmetic.

3. **Inline test fixture, not petstore fixture** — `plan.md` mentioned "petstore fixture" as the data source for the `detail` prop tests. An inline fixture was used instead for isolation (the petstore fixture is large and brings real engine data that would make the test assertions fragile if the engine output drifts). Equivalent coverage, more maintainable.

4. **`build:react` not called in `plan.md`** — The consuming-side type check required running `npm run build:react` to regenerate `dist/react/react.d.ts` (the pre-existing build was stale and lacked `DetailLevel`). This step was not in `plan.md`; surfaced during verification.

## Root cause placeholders

- [ ] Why was the roadmap-completion task missing from the scaffolded `plan.md`? (scaffolding template gap?)
- [ ] Should `plan.md` for react-entry changes always include a `build:react` step in Verify?

## Lessons (candidates for `specs/lessons.md`)

- When adding a prop that shares a name with an existing local variable or callback param in the component, the rename is load-bearing — `plan.md` should call it out explicitly.
- For dual-entry packages, `plan.md` Verify groups that touch the `./react` entry should include `npm run build:react` as an explicit step so the type check is against the rebuilt `.d.ts`.
