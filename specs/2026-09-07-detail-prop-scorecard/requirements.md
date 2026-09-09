# Phase 24 Requirements — Add `detail` prop to `<Scorecard>` React component

## Scope

Add an optional `detail` prop to the `<Scorecard>` component in
`@jentic/api-scorecard-formatter-html/react` that controls rendering depth — `summary`,
`dimensions`, `signals`, or `diagnostics` — mirroring the CLI's `--detail` flag semantics.
Consumers embedding the scorecard in their own React app can choose what level to show without
manually stripping keys from the `data` prop before passing it.

Default is `diagnostics` (render everything present in `data`) to preserve backward compatibility
with all existing consumers. `DetailLevel` — the const-map type representing the four valid values
— is introduced in `packages/formatter-html/src/app/` and exported from the `./react` entry
alongside the `Scorecard` component. Refs #341.

## Out of Scope

- Moving or deduplicating `filterByDetail` from `packages/cli/src/detail.ts` — the CLI keeps its
  own copy; both packages own their filtering logic independently.
- Dark mode support — separate issue.
- Exporting `SummaryCard` / `DimensionCard` individually — separate issue.
- Changes to the `"."` (Node `format()`) entry or the standalone HTML report. The `format(result)`
  function already receives a pre-filtered result from the CLI's `filterByDetail()` call upstream —
  depth control for that path is a CLI concern, not a formatter-html concern.
- Changes to the CLI's `--detail` flag, its defaults, or its `filterByDetail` function.

## Decisions

### Default `detail` is `'diagnostics'`, not `'dimensions'`

The CLI defaults to `dimensions`, but the component today renders whatever keys are present in
`data` — effectively `diagnostics` level. Defaulting the prop to `diagnostics` keeps existing
call sites (`<Scorecard data={myData} />`) pixel-identical: if the consumer passes a full scorecard
object, all three sections still render. Defaulting to `dimensions` would silently hide the
diagnostics section for any consumer currently passing a full object — a breaking change with no
migration path.

### Filtering via render conditionals, not a pre-filter function

The component already gates each section behind data-presence checks (`allDimensions.length > 0`,
`data.diagnostics?.length > 0`). Adding `detail` as an extra gate on those same conditionals —
`detail !== 'summary'` for dimensions, `detail === 'diagnostics'` for diagnostics — is the minimal
surgical change. A new `filterByDetail` function inside the formatter-html package is unnecessary
and would duplicate logic that already lives in the CLI.

### `DetailLevel` is defined inside `formatter-html`, not imported from `cli`

The CLI and formatter are separate published packages. Importing
`@jentic/api-scorecard-cli/detail` inside the formatter would be a wrong-direction dependency.
The four string literals (`summary`, `dimensions`, `signals`, `diagnostics`) are simple enough to
define twice — one authoritative copy per package.

## Constraints

- **Backward compatibility** — omitting `detail` must produce output identical to the current
  behaviour; no change to the `data` prop shape.
- **No CSS shipped** — the `./react` entry continues to rely on the consumer's Tailwind pipeline;
  this change adds no inline styles.
- **Defensive rendering** — the component must continue to tolerate `data` shapes that lack
  `details` / `diagnostics` keys (the shapes produced by CLI `--detail summary` /
  `--detail dimensions`).
- **`tsconfig.react.json` scope** — `DetailLevel` must be visible to the `./react` transpile world
  (`src/app/`); it must NOT be included in `src/index.ts`'s strict NodeNext compile scope unless
  needed there (it is not).

## Context

The website's API detail pages want to embed the scorecard at `dimensions` level inline and link to
the full report separately. Without a `detail` prop the only option is to strip keys from the JSON
before passing to `<Scorecard>` — a documented phase-1 workaround. A typed `detail` prop
formalises this as a first-class API contract and removes the workaround.
