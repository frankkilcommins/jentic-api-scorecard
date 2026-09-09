export const DetailLevel = {
  SUMMARY: 'summary',
  DIMENSIONS: 'dimensions',
  SIGNALS: 'signals',
  DIAGNOSTICS: 'diagnostics',
} as const;

export type DetailLevel = (typeof DetailLevel)[keyof typeof DetailLevel];

export const DETAIL_LEVELS: readonly DetailLevel[] = [
  DetailLevel.SUMMARY,
  DetailLevel.DIMENSIONS,
  DetailLevel.SIGNALS,
  DetailLevel.DIAGNOSTICS,
];

// Component default: render everything present — preserves backward compatibility
// for consumers who pass a full scorecard object without specifying detail.
// Distinct from the CLI's DEFAULT_DETAIL ('dimensions').
export const DEFAULT_DETAIL: DetailLevel = DetailLevel.DIAGNOSTICS;
