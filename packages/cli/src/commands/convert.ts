import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { DEFAULT_BUNDLE_TIMEOUT_MS } from '../bundle.ts';
import { DEFAULT_DETAIL, DetailLevel, filterByDetail } from '../detail.ts';
import { ExitCode } from '../exit-codes.ts';
import { DEFAULT_FORMAT, Format } from '../format.ts';
import { formatHtml } from '../formatters/html.ts';
import { formatJson } from '../formatters/json.ts';
import { formatMarkdown } from '../formatters/markdown.ts';
import { formatPretty } from '../formatters/pretty.ts';
import { formatSarif } from '../formatters/sarif.ts';
import { isExistingFile, isScorecardShape, isURL } from '../input.ts';
import { writeReport } from '../output.ts';
import { ScorecardResult } from '../result.ts';

export interface ConvertOptions {
  detail?: DetailLevel;
  format?: Format;
  output?: string;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new Error(`fetch timed out after ${Math.round(timeoutMs / 1000)}s`));
  }, timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (controller.signal.aborted) {
      throw controller.signal.reason instanceof Error
        ? controller.signal.reason
        : new Error(String(controller.signal.reason));
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function runConvert(input: string, options: ConvertOptions): Promise<number> {
  let raw: string;

  if (isURL(input)) {
    try {
      const response = await fetchWithTimeout(input, DEFAULT_BUNDLE_TIMEOUT_MS);
      if (!response.ok) {
        process.stderr.write(
          `error: failed to fetch '${input}': ${response.status} ${response.statusText}\n`,
        );
        return ExitCode.GENERIC_ERROR;
      }
      raw = await response.text();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      process.stderr.write(`error: failed to fetch '${input}': ${message}\n`);
      return ExitCode.GENERIC_ERROR;
    }
  } else if (isExistingFile(input)) {
    try {
      raw = readFileSync(resolve(input), 'utf-8');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      process.stderr.write(`error: cannot read '${input}': ${message}\n`);
      return ExitCode.GENERIC_ERROR;
    }
  } else {
    process.stderr.write(
      `error: input '${input}' is neither an http(s):// URL nor an existing file.\n`,
    );
    return ExitCode.GENERIC_ERROR;
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    process.stderr.write(`error: '${input}' is not valid JSON.\n`);
    return ExitCode.GENERIC_ERROR;
  }

  if (!isScorecardShape(value)) {
    process.stderr.write(
      `error: '${input}' does not look like a scorecard JSON file.\n` +
        `  Produce one with: jentic-api-scorecard score … --format json --detail diagnostics -o report.json\n`,
    );
    return ExitCode.GENERIC_ERROR;
  }

  const parsed: ScorecardResult = value;

  const detail = options.detail ?? DEFAULT_DETAIL;
  const format = options.format ?? DEFAULT_FORMAT;

  const filtered = filterByDetail(parsed, detail);
  const output =
    format === Format.HTML
      ? formatHtml(filtered)
      : format === Format.JSON
        ? formatJson(filtered)
        : format === Format.MARKDOWN
          ? formatMarkdown(filtered, { detail })
          : format === Format.SARIF
            ? formatSarif(parsed)
            : formatPretty(filtered, input, { detail });

  if (options.output !== undefined) {
    try {
      writeReport(output, options.output, format);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      process.stderr.write(`error: ${message}\n`);
      return ExitCode.GENERIC_ERROR;
    }
  } else {
    process.stdout.write(output);
  }

  return ExitCode.SUCCESS;
}
