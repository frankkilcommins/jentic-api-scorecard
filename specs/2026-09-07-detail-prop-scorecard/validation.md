# Phase 24 Validation — Add `detail` prop to `<Scorecard>` React component

## Definition of Done

All of the following must be true before this branch is merged.

### 1. `detail` prop gates rendering correctly at every level

```
npm test -w @jentic/api-scorecard-formatter-html
```

The `app.test.tsx` suite (SSR-based, against an inline fixture which includes `details` and
`diagnostics`) asserts:

- `<Scorecard data={fixture} detail="summary" />` — rendered HTML contains the summary card; does
  NOT contain the text "Overview".
- `<Scorecard data={fixture} detail="dimensions" />` — rendered HTML contains "Overview"; does NOT
  contain the diagnostics section.
- `<Scorecard data={fixture} detail="signals" />` — rendered HTML contains "Overview"; does NOT
  contain the diagnostics section.
- `<Scorecard data={fixture} detail="diagnostics" />` — rendered HTML contains all three sections.
- `<Scorecard data={fixture} />` (prop omitted) — rendered HTML is identical to
  `detail="diagnostics"` (backward-compat).

### 2. `DetailLevel` is exported from the `./react` entry

```
npx tsc --noEmit -p packages/formatter-html/tsconfig.react.json
```

Exits 0. `import { Scorecard, DetailLevel, DETAIL_LEVELS } from
'@jentic/api-scorecard-formatter-html/react'` resolves without type errors in a consuming `.ts`
file.

### 3. Full test suite passes

```
npm test -w @jentic/api-scorecard-formatter-html
```

All existing tests in `format.test.ts`, `signals.test.tsx`, and `app.test.tsx` pass — no
regressions.

### 4. No breaking change to the `data` prop

An existing call site `<Scorecard data={myData} />` type-checks without edits. The `data` prop
shape (`ScorecardData`) is unchanged.

### 5. Lint clean

```
npm run lint -w @jentic/api-scorecard-formatter-html
```

Exits 0.

## Not Required

- Changes to `packages/cli/src/detail.ts` or the CLI's `--detail` flag
- Changes to the `"."` (Node `format()`) entry or the standalone HTML output
- Dark mode support or sub-component exports (`SummaryCard`, `DimensionCard`)
- E2E tests (the CLI's e2e suite is unaffected — no CLI surface changes)
