import { expect } from 'chai';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import type { ApiMetadata, Diagnostic, Dimension, Summary } from '../src/app/types.ts';
import ApiMetadataCard from '../src/app/components/ApiMetadataCard.tsx';
import CircularProgress from '../src/app/components/CircularProgress.tsx';
import DimensionCard from '../src/app/components/DimensionCard.tsx';
import DiagnosticsSection from '../src/app/components/DiagnosticsSection.tsx';
import GradeBadge from '../src/app/components/GradeBadge.tsx';
import SummaryCard from '../src/app/components/SummaryCard.tsx';

import fixture from '../src/app/scorecard.fixture.json' with { type: 'json' };

const apiMetadata = fixture.apiMetadata as unknown as ApiMetadata;
const summary = fixture.summary as unknown as Summary;
const dimension = fixture.details[0] as unknown as Dimension;
const diagnostics = fixture.diagnostics as unknown as Diagnostic[];

describe('component SSR smoke tests', function () {
  it('SummaryCard renders API name and score', function () {
    const html = renderToStaticMarkup(createElement(SummaryCard, { apiMetadata, summary }));
    expect(html).to.include('Swagger Petstore');
    expect(html).to.include('69'); // Math.round(68.62)
  });

  it('SummaryCard hides stats bar when showApiMetadata=false', function () {
    const html = renderToStaticMarkup(
      createElement(SummaryCard, { apiMetadata, summary, showApiMetadata: false }),
    );
    expect(html).to.not.include('OPERATIONS');
  });

  it('SummaryCard shows stats bar by default', function () {
    const html = renderToStaticMarkup(createElement(SummaryCard, { apiMetadata, summary }));
    expect(html).to.include('OPERATIONS');
  });

  it('DimensionCard renders dimension name and grade', function () {
    const html = renderToStaticMarkup(createElement(DimensionCard, { dimension }));
    // renderToStaticMarkup escapes & to &amp; — assert on the encoded form
    expect(html).to.include('Foundational');
    expect(html).to.include(dimension.grade);
  });

  it('DiagnosticsSection renders diagnostics count', function () {
    const html = renderToStaticMarkup(createElement(DiagnosticsSection, { diagnostics }));
    expect(html).to.include('136 total');
  });

  it('CircularProgress renders score label', function () {
    const html = renderToStaticMarkup(createElement(CircularProgress, { score: 75 }));
    expect(html).to.include('75');
  });

  it('GradeBadge renders grade text', function () {
    const html = renderToStaticMarkup(createElement(GradeBadge, { grade: 'A+' }));
    expect(html).to.include('A+');
  });

  it('ApiMetadataCard renders operation count', function () {
    const html = renderToStaticMarkup(createElement(ApiMetadataCard, { apiMetadata }));
    expect(html).to.include('OPERATIONS');
    expect(html).to.include('19');
  });
});
