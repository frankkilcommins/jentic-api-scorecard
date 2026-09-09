# Phase 25 Validation — Export SummaryCard and DimensionCard from `./react` Entry

## Definition of Done

All of the following must be true before this branch is merged.

### 1. `ApiMetadataCard` is a new file with an exported props interface

`packages/formatter-html/src/app/components/ApiMetadataCard.tsx` must exist and contain `export interface ApiMetadataCardProps` with an `apiMetadata: ApiMetadata` field. Structural check — read the file.

### 2. `SummaryCard` accepts `showApiMetadata` and hides the stats bar when false

```bash
grep 'showApiMetadata' packages/formatter-html/src/app/components/SummaryCard.tsx
grep 'ApiMetadataCard' packages/formatter-html/src/app/components/SummaryCard.tsx
```

Both must exit 0. Confirm `SummaryCard` no longer contains an inline `StatItem` function (that helper moved to `ApiMetadataCard.tsx`).

### 3. All six prop interfaces are exported from their source files

```bash
grep 'export interface SummaryCardProps' packages/formatter-html/src/app/components/SummaryCard.tsx
grep 'export interface DimensionCardProps' packages/formatter-html/src/app/components/DimensionCard.tsx
grep 'export interface DiagnosticsSectionProps' packages/formatter-html/src/app/components/DiagnosticsSection.tsx
grep 'export interface CircularProgressProps' packages/formatter-html/src/app/components/CircularProgress.tsx
grep 'export interface GradeBadgeProps' packages/formatter-html/src/app/components/GradeBadge.tsx
grep 'export interface ApiMetadataCardProps' packages/formatter-html/src/app/components/ApiMetadataCard.tsx
```

All six must exit 0.

### 4. `react.ts` exports all six components and their prop interfaces

Structural check — read `packages/formatter-html/src/app/react.ts` and confirm it contains:
- Six `export { default as … }` lines for the new components
- Six `export type { …Props }` lines for their interfaces
- No removal of the existing `Scorecard`, `DetailLevel`, `DETAIL_LEVELS`, `DEFAULT_DETAIL`, or type-model re-exports

### 5. Build succeeds and all new symbols appear in `dist/react/react.d.ts`

```bash
npm run build:react -w @jentic/api-scorecard-formatter-html
grep 'SummaryCard' packages/formatter-html/dist/react/react.d.ts
grep 'DimensionCard' packages/formatter-html/dist/react/react.d.ts
grep 'DiagnosticsSection' packages/formatter-html/dist/react/react.d.ts
grep 'CircularProgress' packages/formatter-html/dist/react/react.d.ts
grep 'GradeBadge' packages/formatter-html/dist/react/react.d.ts
grep 'ApiMetadataCard' packages/formatter-html/dist/react/react.d.ts
```

`build:react` exits 0; all six `grep` commands exit 0.

### 6. Sub-components remain unexported

```bash
grep -E 'SignalCard|DiagnosticItem|FilterButton|StatItem' packages/formatter-html/src/app/react.ts
```

Must exit non-zero (no matches).

### 7. `SummaryCard showApiMetadata: false` hides the stats bar

SSR smoke test in `components.test.tsx` renders `SummaryCard` with `showApiMetadata: false` and asserts the output does not contain the string `OPERATIONS`. This confirms the `ApiMetadataCard` is conditionally mounted, not hidden via CSS.

### 8. All SSR smoke tests pass

```bash
npm test -w @jentic/api-scorecard-formatter-html
```

Exits 0. `packages/formatter-html/test/components.test.tsx` must exist and include passing tests for: `SummaryCard` (default and `showApiMetadata: false`), `DimensionCard`, `DiagnosticsSection`, `CircularProgress`, `GradeBadge`, and `ApiMetadataCard`. Each test renders with minimal props via `renderToStaticMarkup` and asserts a non-empty, `undefined`-free string.

### 9. Existing tests still pass

```bash
npm test -w @jentic/api-scorecard-formatter-html
```

Exits 0. All pre-existing tests in `app.test.tsx`, `signals.test.tsx`, and `format.test.ts` pass without modification. In particular, the `SummaryCard` extraction must not break the `Scorecard` detail-prop tests in `app.test.tsx` (which render `Scorecard` wrapping `SummaryCard`).

### 10. Lint passes

```bash
npm run lint -w @jentic/api-scorecard-formatter-html
```

Exits 0 across all modified and new files.

### 11. `tsconfig.react.json` is unchanged

```bash
git diff packages/formatter-html/tsconfig.react.json
```

Must produce no output — the existing `include` already covers `src/app/components/**/*`.

### 12. README documents all six components

`packages/formatter-html/README.md` must mention `SummaryCard` (including `showApiMetadata` prop), `DimensionCard`, `DiagnosticsSection`, `CircularProgress`, `GradeBadge`, and `ApiMetadataCard` as available imports from `@jentic/api-scorecard-formatter-html/react`. Structural check — read the relevant section.

### 13. CLAUDE.md reflects the new export surface

`.claude/CLAUDE.md` must name the six exported components as the `./react` public surface and note that `SignalCard` and below remain unexported. Structural check — read the relevant paragraph.

### 14. Manual consumer import test

After running `npm run build -w @jentic/api-scorecard-formatter-html`, run from the repo root:

```bash
node --input-type=module <<'EOF'
import {
  SummaryCard, DimensionCard, DiagnosticsSection,
  CircularProgress, GradeBadge, ApiMetadataCard,
} from './packages/formatter-html/dist/react/react.js';
if (typeof SummaryCard !== 'function') throw new Error('SummaryCard');
if (typeof DimensionCard !== 'function') throw new Error('DimensionCard');
if (typeof DiagnosticsSection !== 'function') throw new Error('DiagnosticsSection');
if (typeof CircularProgress !== 'function') throw new Error('CircularProgress');
if (typeof GradeBadge !== 'function') throw new Error('GradeBadge');
if (typeof ApiMetadataCard !== 'function') throw new Error('ApiMetadataCard');
console.log('consumer import: OK');
EOF
```

Must print `consumer import: OK` and exit 0.

### 15. Roadmap ✅ marker is present

```bash
grep -F " ✅" specs/roadmap.md | grep -F "Phase 25"
```

Must exit 0.

## Not Required

- Python tests — no Python code is touched.
- E2E tests — the CLI `--format html` path uses the `"."` entry's `format()` function, which is unchanged.
- Docker image build — no container changes.
- `package.json` exports map changes — no new subpath entries needed.
- Breaking-change analysis — all changes are additive; `SummaryCard`'s new prop is optional with a backward-compatible default.
- Browser / interactive testing of `DiagnosticsSection` filter state — the SSR smoke test covers initial render only; interactive state is internal implementation detail.
