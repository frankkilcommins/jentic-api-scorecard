import { existsSync, statSync } from 'node:fs';

import { ScorecardResult } from './result.ts';

export function isScorecardShape(value: unknown): value is ScorecardResult {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  if (!('summary' in value)) {
    return false;
  }
  const summary = (value as { summary: unknown }).summary;
  if (typeof summary !== 'object' || summary === null || Array.isArray(summary)) {
    return false;
  }
  const s = summary as { score?: unknown; level?: unknown; grade?: unknown };
  return typeof s.score === 'number' && typeof s.level === 'string' && typeof s.grade === 'string';
}

export function isURL(input: string): boolean {
  return /^https?:\/\//i.test(input);
}

export function isExistingFile(input: string): boolean {
  try {
    return existsSync(input) && statSync(input).isFile();
  } catch {
    return false;
  }
}
