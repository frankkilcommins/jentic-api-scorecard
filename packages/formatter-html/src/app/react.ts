// Public React entry (`@jentic/api-scorecard-formatter-html/react`).
// Consumers render <Scorecard data={result} /> with their own React; the components
// are styled with stock Tailwind utility classes, so a Tailwind pipeline must be
// present (a `<script src="https://cdn.tailwindcss.com"></script>` tag is enough).
export { default as Scorecard } from './components/Scorecard.tsx';
export { default as SummaryCard } from './components/SummaryCard.tsx';
export { default as DimensionCard } from './components/DimensionCard.tsx';
export { default as DiagnosticsSection } from './components/DiagnosticsSection.tsx';
export { default as CircularProgress } from './components/CircularProgress.tsx';
export { default as GradeBadge } from './components/GradeBadge.tsx';
export { default as ApiMetadataCard } from './components/ApiMetadataCard.tsx';
export { DetailLevel, DETAIL_LEVELS, DEFAULT_DETAIL } from './detail.ts';

export type {
  ScorecardData,
  ApiMetadata,
  EngineMetadata,
  Summary,
  SummaryDimension,
  DetailGroup,
  Dimension,
  Signal,
  Diagnostic,
  DiagnosticData,
  Provenance,
} from './types.ts';
