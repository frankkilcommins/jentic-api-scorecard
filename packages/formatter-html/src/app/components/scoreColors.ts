// Each band maps to a --score-color-* CSS custom property defined in index.css.
// The variables have both :root (light) and .dark values, so grade colours
// adapt to dark mode without any JS logic.
const BANDS = [
  { minScore: 70, letter: 'A', colorVar: 'var(--score-color-a)' }, // excellent — green
  { minScore: 60, letter: 'B', colorVar: 'var(--score-color-b)' }, // good — teal
  { minScore: 50, letter: 'C', colorVar: 'var(--score-color-c)' }, // fair — amber
  { minScore: 40, letter: 'D', colorVar: 'var(--score-color-d)' }, // poor — orange
  { minScore: 0, letter: 'F', colorVar: 'var(--score-color-f)' }, // failing — red
] as const;

const FAILING_COLOR_VAR = 'var(--score-color-f)';

export function getScoreColor(score: number): string {
  return BANDS.find((b) => score >= b.minScore)?.colorVar ?? FAILING_COLOR_VAR;
}

export function getGradeColor(grade: string): string {
  const letter = grade.charAt(0);
  return BANDS.find((b) => b.letter === letter)?.colorVar ?? FAILING_COLOR_VAR;
}
