# Phase 25 Requirements — Export SummaryCard and DimensionCard from `./react` Entry

## Scope

This phase widens the `./react` entry of `@jentic/api-scorecard-formatter-html` to export six React components — `SummaryCard`, `DimensionCard`, `DiagnosticsSection`, `CircularProgress`, `GradeBadge`, and a new `ApiMetadataCard` — plus a prop interface for each. The work has two complementary parts.

**Part 1 — New component: `ApiMetadataCard`.** The stats bar currently embedded in `SummaryCard` (the Operations / Schemas / Tags / Security Schemes / Security Types count row) is extracted into its own exported `ApiMetadataCard` component. `SummaryCard` then uses `ApiMetadataCard` internally. A new `showApiMetadata` prop on `SummaryCard` (default `true`) controls whether the card is rendered. Consumers can suppress the stats row on the integrated `SummaryCard`, or import `ApiMetadataCard` directly and place it anywhere in their layout.

**Part 2 — Re-export from `react.ts`.** All six components and their prop interfaces are added to the `./react` public entry. `CircularProgress` and `GradeBadge` are pure UI primitives — `CircularProgress` takes a `score: number` and draws a color-coded SVG gauge; `GradeBadge` takes a `grade: string` and renders a colored pill — so they are safe to export as low-risk building blocks for custom summary displays.

## Out of Scope

- Components below this set remain unexported: `SignalCard`, `DiagnosticItem`, `FilterButton`, individual signal-metadata panels, and `scoreColors.ts` / its color-utility functions. Concrete consumer demand is the gate for future additions.
- No changes to `tsconfig.react.json` — it already covers `src/app/components/**/*`.
- No changes to the `"."` (CLI / `format()`) entry — `src/index.ts` is untouched.
- No changes to `package.json` exports map — all new exports are accessible through the existing `./react` entry.
- No version bump — managed by lerna at release time.

## Decisions

### `ApiMetadataCard` is a new file, not an inline refactor

The stats bar is extracted to `packages/formatter-html/src/app/components/ApiMetadataCard.tsx`. The private `StatItem` helper moves with it and stays private to that file. `SummaryCard` imports `ApiMetadataCard` from the new file. This gives consumers a named import they can use independently, and keeps `SummaryCard` focused on layout orchestration.

### `showApiMetadata` defaults to `true` for backward compatibility

`SummaryCard`'s existing behavior (always showing the stats bar) is preserved for all current consumers. Setting `showApiMetadata: false` hides `ApiMetadataCard`. The prop name mirrors the existing `apiMetadata` prop name, making the toggle discoverable.

### `DiagnosticsSection` is included alongside `SummaryCard` and `DimensionCard`

The three components together constitute the complete top-level visible structure of a scorecard. Exporting all three gives consumers full freedom to compose custom layouts.

### `CircularProgress` and `GradeBadge` are exported as primitives

Both have stable, minimal props (`score: number` and `grade: string` respectively). The color logic is internal — consumers get correct JAIRF color-coding automatically.

### Prop interface names are locked

`SummaryCardProps`, `DimensionCardProps`, `DiagnosticsSectionProps`, `CircularProgressProps`, `GradeBadgeProps`, `ApiMetadataCardProps`. These match the interface declarations in each source file.

### Consumer test is required

Beyond green CI and grep checks, a manual consumer import test verifying all six components are importable from the built `dist/react/react.js` is required before merge.

## Constraints

- **Adding exports is non-breaking; removing is not** (`react.ts` design principle, `specs/tech-stack.md`). All six components become permanent public API on merge.
- **`SummaryCard` API change must be backward-compatible.** The new `showApiMetadata` prop is optional with default `true`. Existing callers that do not pass it see no behavioral change.
- **Two isolated TS worlds** (`specs/tech-stack.md`, `CLAUDE.md`). Only the `tsconfig.react.json` world (`src/app/`) is touched.
- **React/react-dom stay optional peerDependencies.** No new runtime dependencies.
- **No mocks in tests** (`specs/tech-stack.md`). SSR smoke tests use real `renderToStaticMarkup` against real component imports.

## Context

Phase 14 shipped the `./react` entry with `Scorecard` as the sole exported component. Phase 24 added the `detail` prop and established the pattern for widening the entry incrementally. Phase 25 makes the building blocks directly accessible: consumers can now compose custom scorecards using the top-level structural components (`SummaryCard`, `DimensionCard`, `DiagnosticsSection`), control the stats bar's visibility or placement via `ApiMetadataCard` / `showApiMetadata`, and build novel score displays using the score-gauge and grade-badge primitives.

The `ApiMetadataCard` extraction is an internal refactor of `SummaryCard` that happens to produce an exported component. It does not change `SummaryCard`'s rendered output by default. See `docs/architecture.md` §4 for the dual-entry layout and the rationale for keeping `"."` and `"./react"` as isolated build targets.
