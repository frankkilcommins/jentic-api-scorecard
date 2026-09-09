import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect } from 'chai';

import { isExistingFile, isScorecardShape, isURL } from '../src/input.ts';

const fixturePath = fileURLToPath(new URL('./fixtures/scorecard.sample.json', import.meta.url));

describe('isURL', function () {
  it('accepts http:// URLs', function () {
    expect(isURL('http://example.com/report.json')).to.equal(true);
  });

  it('accepts https:// URLs', function () {
    expect(isURL('https://example.com/report.json')).to.equal(true);
  });

  it('is case-insensitive on the scheme', function () {
    expect(isURL('HTTP://example.com')).to.equal(true);
    expect(isURL('HTTPS://example.com')).to.equal(true);
  });

  it('rejects a local file path', function () {
    expect(isURL('/path/to/report.json')).to.equal(false);
  });

  it('rejects a relative path', function () {
    expect(isURL('./report.json')).to.equal(false);
  });

  it('rejects a bare hostname', function () {
    expect(isURL('example.com/report.json')).to.equal(false);
  });
});

describe('isExistingFile', function () {
  let tmpDir: string;

  beforeEach(function () {
    tmpDir = mkdtempSync(join(tmpdir(), 'input-test-'));
  });

  afterEach(function () {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns true for an existing file', function () {
    expect(isExistingFile(fixturePath)).to.equal(true);
  });

  it('returns false for a non-existent path', function () {
    expect(isExistingFile('/no/such/file.json')).to.equal(false);
  });

  it('returns false for a directory', function () {
    expect(isExistingFile(tmpDir)).to.equal(false);
  });

  it('returns false for an empty string', function () {
    expect(isExistingFile('')).to.equal(false);
  });

  it('returns true for a newly created file', function () {
    const p = join(tmpDir, 'file.json');
    writeFileSync(p, '{}');
    expect(isExistingFile(p)).to.equal(true);
  });
});

describe('isScorecardShape', function () {
  const validSummary = { score: 68.62, level: 'ai-aware', grade: 'B' };

  it('accepts a minimal valid scorecard shape', function () {
    expect(isScorecardShape({ summary: validSummary })).to.equal(true);
  });

  it('accepts extra fields beyond summary', function () {
    expect(isScorecardShape({ summary: validSummary, apiMetadata: {}, details: [] })).to.equal(
      true,
    );
  });

  it('rejects null', function () {
    expect(isScorecardShape(null)).to.equal(false);
  });

  it('rejects a primitive', function () {
    expect(isScorecardShape(42)).to.equal(false);
    expect(isScorecardShape('string')).to.equal(false);
  });

  it('rejects an array', function () {
    expect(isScorecardShape([])).to.equal(false);
  });

  it('rejects an object missing summary', function () {
    expect(isScorecardShape({ summary_typo: validSummary })).to.equal(false);
  });

  it('rejects summary as a non-object', function () {
    expect(isScorecardShape({ summary: 'oops' })).to.equal(false);
    expect(isScorecardShape({ summary: [] })).to.equal(false);
  });

  it('rejects summary missing score', function () {
    expect(isScorecardShape({ summary: { level: 'ai-aware', grade: 'B' } })).to.equal(false);
  });

  it('rejects summary missing level', function () {
    expect(isScorecardShape({ summary: { score: 68, grade: 'B' } })).to.equal(false);
  });

  it('rejects summary missing grade', function () {
    expect(isScorecardShape({ summary: { score: 68, level: 'ai-aware' } })).to.equal(false);
  });

  it('rejects summary with wrong types', function () {
    expect(isScorecardShape({ summary: { score: '68', level: 'ai-aware', grade: 'B' } })).to.equal(
      false,
    );
    expect(isScorecardShape({ summary: { score: 68, level: 1, grade: 'B' } })).to.equal(false);
    expect(isScorecardShape({ summary: { score: 68, level: 'ai-aware', grade: null } })).to.equal(
      false,
    );
  });

  it('accepts the real fixture file shape', async function () {
    const { readFileSync } = await import('node:fs');
    const raw = readFileSync(fixturePath, 'utf8');
    expect(isScorecardShape(JSON.parse(raw))).to.equal(true);
  });
});
