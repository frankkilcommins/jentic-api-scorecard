# Phase 25 Plan — Export SummaryCard and DimensionCard from `./react` Entry

## Group 1 — Extract ApiMetadataCard

1. Create `packages/formatter-html/src/app/components/ApiMetadataCard.tsx`:
   - Move the `StatItem` helper function from `SummaryCard.tsx` into this new file (private, not exported).
   - Define and export `ApiMetadataCardProps { apiMetadata: ApiMetadata }`.
   - The component renders the stats bar: five `StatItem` rows for `operationCount`, `schemaCount`, `tagCount`, `securitySchemeCount`, and `securitySchemeTypes?.length`. Match the existing layout and Tailwind classes exactly.
2. In `packages/formatter-html/src/app/components/SummaryCard.tsx`:
   - Remove the inline `StatItem` helper and the stats bar JSX (now in `ApiMetadataCard`).
   - Import `ApiMetadataCard` from `./ApiMetadataCard.tsx`.
   - Add `showApiMetadata?: boolean` to `SummaryCardProps` (optional, no default in the interface — the component default is `true`).
   - Replace the stats bar section with `{showApiMetadata !== false && <ApiMetadataCard apiMetadata={apiMetadata} />}`.

## Group 2 — Export Prop Interfaces and Re-export from react.ts

3. In `packages/formatter-html/src/app/components/SummaryCard.tsx`: ensure `interface SummaryCardProps` is `export interface SummaryCardProps` (make it exported).
4. In `packages/formatter-html/src/app/components/DimensionCard.tsx` (line 7): change `interface DimensionCardProps` to `export interface DimensionCardProps`.
5. In `packages/formatter-html/src/app/components/DiagnosticsSection.tsx` (line 44): change `interface DiagnosticsSectionProps` to `export interface DiagnosticsSectionProps`.
6. In `packages/formatter-html/src/app/components/CircularProgress.tsx` (line 3): change `interface CircularProgressProps` to `export interface CircularProgressProps`.
7. In `packages/formatter-html/src/app/components/GradeBadge.tsx` (line 10): change `interface GradeBadgeProps` to `export interface GradeBadgeProps`.
8. In `packages/formatter-html/src/app/react.ts`: add component re-exports following the existing `export { default as Scorecard }` pattern:
   ```
   export { default as SummaryCard } from './components/SummaryCard.tsx';
   export { default as DimensionCard } from './components/DimensionCard.tsx';
   export { default as DiagnosticsSection } from './components/DiagnosticsSection.tsx';
   export { default as CircularProgress } from './components/CircularProgress.tsx';
   export { default as GradeBadge } from './components/GradeBadge.tsx';
   export { default as ApiMetadataCard } from './components/ApiMetadataCard.tsx';
   ```
9. In `packages/formatter-html/src/app/react.ts`: add type re-exports:
   ```
   export type { SummaryCardProps } from './components/SummaryCard.tsx';
   export type { DimensionCardProps } from './components/DimensionCard.tsx';
   export type { DiagnosticsSectionProps } from './components/DiagnosticsSection.tsx';
   export type { CircularProgressProps } from './components/CircularProgress.tsx';
   export type { GradeBadgeProps } from './components/GradeBadge.tsx';
   export type { ApiMetadataCardProps } from './components/ApiMetadataCard.tsx';
   ```
10. In `packages/formatter-html/src/app/react.ts`: update the comment about unexported building blocks to reflect that these six components are now public API; note that `SignalCard`, `CircularProgress`'s color helpers, `DiagnosticItem`, `FilterButton`, and signal-metadata panels remain unexported.

## Group 3 — SSR Smoke Tests

11. Create `packages/formatter-html/test/components.test.tsx` with mocha test cases using `renderToStaticMarkup` + `createElement` (following the pattern in `app.test.tsx`). Import each component from `../src/app/react.ts` (the public entry) to validate the re-export chain. Assert the rendered string is non-empty and does not contain the literal text `undefined`:
    - `SummaryCard` with minimal valid props: `apiMetadata: { name: 'Test', operationCount: 0, schemaCount: 0, tagCount: 0, securitySchemeCount: 0 }`, `summary: { score: 50, level: 'ai-aware', grade: 'B' }`.
    - `SummaryCard` with `showApiMetadata: false` — assert the rendered HTML does not contain the text `OPERATIONS` (the stat label).
    - `DimensionCard` with minimal props: `dimension: { kind: 'FC', name: 'Foundational', score: 70, grade: 'A-' }`.
    - `DiagnosticsSection` with a minimal diagnostics array: `[{ code: 'C001', message: 'test', severity: 1, source: 'spectral' }]`.
    - `CircularProgress` with `score: 75`.
    - `GradeBadge` with `grade: 'B+'`.
    - `ApiMetadataCard` with minimal `apiMetadata`: `{ name: 'Test', operationCount: 3, schemaCount: 5, tagCount: 2, securitySchemeCount: 1 }` — assert the rendered HTML contains `OPERATIONS`.

## Group 4 — Docs and Lifecycle

12. Update `packages/formatter-html/README.md`: document all six exported components and their prop interfaces in the "React components" section. Include the `showApiMetadata` prop on `SummaryCard`, and note that `ApiMetadataCard` can be used independently to place the API stats anywhere in a custom layout.
13. Update `.claude/CLAUDE.md` in the `packages/formatter-html/` bullet: change the sentence about building blocks staying unexported to name `SummaryCard`, `DimensionCard`, `DiagnosticsSection`, `CircularProgress`, `GradeBadge`, and `ApiMetadataCard` as the public `./react` surface; note that `SignalCard` and below remain unexported.
14. Append ` ✅` (a single space followed by U+2705) to the `## Phase 25 — Export SummaryCard and DimensionCard from \`./react\` Entry` heading in `specs/roadmap.md`. Leave the rest of the block untouched.

## Group 5 — Verify

15. `npm run build:react -w @jentic/api-scorecard-formatter-html` exits 0.
16. `grep 'SummaryCard' packages/formatter-html/dist/react/react.d.ts` exits 0.
17. `grep 'ApiMetadataCard' packages/formatter-html/dist/react/react.d.ts` exits 0.
18. `grep 'CircularProgress' packages/formatter-html/dist/react/react.d.ts` exits 0.
19. `grep 'GradeBadge' packages/formatter-html/dist/react/react.d.ts` exits 0.
20. `grep -E 'SignalCard|DiagnosticItem|FilterButton' packages/formatter-html/src/app/react.ts` exits non-zero (no matches).
21. `npm test -w @jentic/api-scorecard-formatter-html` exits 0 — all existing and new SSR smoke tests pass.
22. `npm run lint -w @jentic/api-scorecard-formatter-html` exits 0.
23. `grep -F " ✅" specs/roadmap.md | grep -F "Phase 25"` exits 0.
