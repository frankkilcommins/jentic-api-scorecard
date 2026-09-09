import { createServer, Server } from 'node:http';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect } from 'chai';

import { runConvert } from '../../src/commands/convert.ts';
import { ExitCode } from '../../src/exit-codes.ts';
import { Format } from '../../src/format.ts';

const fixturePath = fileURLToPath(new URL('../fixtures/scorecard.sample.json', import.meta.url));
const fixtureRaw = readFileSync(fixturePath, 'utf8');

function captureStream(
  stream: NodeJS.WriteStream,
  fn: () => Promise<number>,
): Promise<{ exitCode: number; output: string }> {
  const original = stream.write.bind(stream);
  let captured = '';
  stream.write = ((chunk: string | Uint8Array): boolean => {
    captured += typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8');
    return true;
  }) as typeof stream.write;
  return fn()
    .then((exitCode) => ({ exitCode, output: captured }))
    .finally(() => {
      stream.write = original;
    });
}

describe('runConvert', function () {
  let tmpDir: string;

  beforeEach(function () {
    tmpDir = mkdtempSync(join(tmpdir(), 'convert-test-'));
  });

  afterEach(function () {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('local file input', function () {
    it('reformats a scorecard file to stdout as pretty by default', async function () {
      const { exitCode, output } = await captureStream(process.stdout, () =>
        runConvert(fixturePath, {}),
      );
      expect(exitCode).to.equal(ExitCode.SUCCESS);
      expect(output).to.include('Sample API');
    });

    it('reformats to JSON when --format json is given', async function () {
      const { exitCode, output } = await captureStream(process.stdout, () =>
        runConvert(fixturePath, { format: Format.JSON }),
      );
      expect(exitCode).to.equal(ExitCode.SUCCESS);
      const parsed = JSON.parse(output);
      expect(parsed.summary.score).to.equal(JSON.parse(fixtureRaw).summary.score);
    });

    it('uses the api name as the pretty source label', async function () {
      const { exitCode, output } = await captureStream(process.stdout, () =>
        runConvert(fixturePath, {}),
      );
      expect(exitCode).to.equal(ExitCode.SUCCESS);
      expect(output).to.include('Sample API');
      expect(output).to.not.include(fixturePath);
    });

    it('falls back to the file path when api name is empty', async function () {
      const fixture = JSON.parse(fixtureRaw);
      fixture.apiMetadata.name = '';
      const emptyNamePath = join(tmpDir, 'empty-name.json');
      writeFileSync(emptyNamePath, JSON.stringify(fixture));
      const { exitCode, output } = await captureStream(process.stdout, () =>
        runConvert(emptyNamePath, {}),
      );
      expect(exitCode).to.equal(ExitCode.SUCCESS);
      expect(output).to.include(emptyNamePath);
    });

    it('writes to -o instead of stdout', async function () {
      const outPath = join(tmpDir, 'out.json');
      const { exitCode, output } = await captureStream(process.stdout, () =>
        runConvert(fixturePath, { format: Format.JSON, output: outPath }),
      );
      expect(exitCode).to.equal(ExitCode.SUCCESS);
      expect(output).to.equal('');
      const written = JSON.parse(readFileSync(outPath, 'utf8'));
      expect(written.summary.score).to.equal(JSON.parse(fixtureRaw).summary.score);
    });
  });

  describe('URL input', function () {
    let server: Server;
    let baseUrl: string;

    beforeEach(function (done) {
      server = createServer((_req, res) => {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(fixtureRaw);
      });
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        if (address === null || typeof address === 'string') {
          throw new Error('expected an AddressInfo from server.listen');
        }
        baseUrl = `http://127.0.0.1:${address.port}`;
        done();
      });
    });

    afterEach(function (done) {
      server.close(() => done());
    });

    it('fetches and reformats a scorecard served over http', async function () {
      const { exitCode, output } = await captureStream(process.stdout, () =>
        runConvert(`${baseUrl}/report.json`, { format: Format.JSON }),
      );
      expect(exitCode).to.equal(ExitCode.SUCCESS);
      const parsed = JSON.parse(output);
      expect(parsed.summary.score).to.equal(JSON.parse(fixtureRaw).summary.score);
    });

    it('fails with GENERIC_ERROR when the URL 404s', async function () {
      server.close();
      server = createServer((_req, res) => {
        res.writeHead(404);
        res.end();
      });
      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
      const address = server.address();
      if (address === null || typeof address === 'string') {
        throw new Error('expected an AddressInfo from server.listen');
      }
      const { exitCode, output } = await captureStream(process.stderr, () =>
        runConvert(`http://127.0.0.1:${address.port}/missing.json`, {}),
      );
      expect(exitCode).to.equal(ExitCode.GENERIC_ERROR);
      expect(output).to.include('404');
    });
  });

  describe('invalid input', function () {
    it('fails with GENERIC_ERROR when input is neither a URL nor an existing file', async function () {
      const { exitCode, output } = await captureStream(process.stderr, () =>
        runConvert('/no/such/file.json', {}),
      );
      expect(exitCode).to.equal(ExitCode.GENERIC_ERROR);
      expect(output).to.include('neither an http(s):// URL nor an existing file');
    });

    it('fails with GENERIC_ERROR when the file is not valid JSON', async function () {
      const badPath = join(tmpDir, 'bad.json');
      writeFileSync(badPath, 'not json');
      const { exitCode, output } = await captureStream(process.stderr, () =>
        runConvert(badPath, {}),
      );
      expect(exitCode).to.equal(ExitCode.GENERIC_ERROR);
      expect(output).to.include('is not valid JSON');
    });

    it('fails with GENERIC_ERROR when the JSON is not a scorecard shape', async function () {
      const notScorecardPath = join(tmpDir, 'not-scorecard.json');
      writeFileSync(notScorecardPath, JSON.stringify({ hello: 'world' }));
      const { exitCode, output } = await captureStream(process.stderr, () =>
        runConvert(notScorecardPath, {}),
      );
      expect(exitCode).to.equal(ExitCode.GENERIC_ERROR);
      expect(output).to.include('does not look like a scorecard JSON file');
    });
  });
});
