# Phase 24 Plan — Add `detail` prop to `<Scorecard>` React component

## Group 1 — Add DetailLevel to formatter-html

1. Create `packages/formatter-html/src/app/detail.ts` with `DetailLevel` const-map + type,
   `DETAIL_LEVELS` readonly array, and `DEFAULT_DETAIL = 'diagnostics'` (the component default,
   distinct from the CLI's `DEFAULT_DETAIL = 'dimensions'`).

2. Export `DetailLevel`, `DETAIL_LEVELS`, and `DEFAULT_DETAIL` from
   `packages/formatter-html/src/app/react.ts` alongside the existing `Scorecard` and type exports.

## Group 2 — Add `detail` prop to `<Scorecard>`

3. Import `DetailLevel` and `DEFAULT_DETAIL` into
   `packages/formatter-html/src/app/components/Scorecard.tsx`.

4. Extend `ScorecardProps` with `detail?: DetailLevel`.

5. Default the prop: `{ data, detail = DEFAULT_DETAIL }`.

6. Gate the dimensions section: keep the existing `allDimensions.length > 0` check **and** add
   `detail !== 'summary'` — the section is hidden at `summary` level regardless of data shape.

7. Gate the diagnostics section: keep the existing `data.diagnostics?.length > 0` check **and**
   add `detail === 'diagnostics'` — the section is hidden unless the consumer explicitly requests
   the diagnostics level.

## Group 3 — Tests

8. Add or update assertions in `packages/formatter-html/test/app.test.tsx` covering all five
   variants against the existing petstore fixture (which includes `details` and `diagnostics`):
   - `detail="summary"` → summary card present; Overview heading absent; diagnostics absent.
   - `detail="dimensions"` → summary card + Overview heading present; diagnostics absent.
   - `detail="signals"` → same visible sections as `dimensions` (signals live inside
     `details` — no separate render section).
   - `detail="diagnostics"` → all three sections present.
   - prop omitted → renders identically to `detail="diagnostics"` (backward-compat assertion).

## Group 4 — Docs + lifecycle

9. Append ` ✅` (a single space followed by the U+2705 checkmark) to the
   `## Phase 24 — Add \`detail\` prop to \`<Scorecard>\` React component` heading in
   `specs/roadmap.md`, leaving the rest of the block in place.

## Group 5 — Verify

10. `npm test -w @jentic/api-scorecard-formatter-html` exits 0 — all suites pass including the
    updated `app.test.tsx`.

11. `npm run lint -w @jentic/api-scorecard-formatter-html` exits 0.

12. `npx tsc --noEmit -p packages/formatter-html/tsconfig.react.json` exits 0 — confirms
    `DetailLevel` is reachable within the `src/app/` compile scope and the `detail` prop types
    check correctly.

13. Consuming-side type check: a scratch `import { Scorecard, DetailLevel } from
    '@jentic/api-scorecard-formatter-html/react'` in an isolated `.ts` file resolves without type
    errors, confirming the export is wired in the package `exports` map.
