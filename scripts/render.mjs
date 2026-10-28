import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const kb = path.resolve(process.argv[2] ?? '.');
const outputRoot = kb;
const src = path.join(kb, 'src');
const dependencyRoot = process.argv[3] ?? process.env.S01E03_DEPENDENCIES;
assert.ok(dependencyRoot, 'Pass a toolchain root as argument 2 or set S01E03_DEPENDENCIES.');
const dependencies = path.resolve(dependencyRoot);
const nodeModules = path.join(dependencies, 'node_modules');
const { createServer } = await import(pathToFileURL(path.join(nodeModules, 'vite/dist/node/index.js')));
const { svelte } = await import(pathToFileURL(path.join(nodeModules, '@sveltejs/vite-plugin-svelte/src/index.js')));
const { mdsvex } = await import(pathToFileURL(path.join(nodeModules, 'mdsvex/dist/main.js')));

const pages = {
  index: path.join(src, 'routes/kb/+page.svx'),
  triage: path.join(src, 'routes/kb/triage/dedupe/+page.svx'),
  decision: path.join(src, 'routes/kb/decisions/0001-dedupe-by-subject/+page.svx'),
  incident: path.join(src, 'routes/kb/incidents/4471/+page.svx'),
  review: path.join(src, 'routes/kb/incidents/4471-review/+page.svx'),
};

const server = await createServer({
  configFile: false,
  root: kb,
  appType: 'custom',
  logLevel: 'error',
  resolve: {
    alias: [
      { find: '#lib', replacement: path.join(src, 'lib') },
      { find: /^svelte\/internal\/server$/, replacement: path.join(nodeModules, 'svelte/src/internal/server/index.js') },
      { find: /^svelte\/server$/, replacement: path.join(nodeModules, 'svelte/src/server/index.js') },
      { find: /^svelte$/, replacement: path.join(nodeModules, 'svelte/src/index-server.js') },
      { find: /^esm-env\/browser$/, replacement: path.join(nodeModules, 'esm-env/false.js') },
      { find: /^esm-env\/development$/, replacement: path.join(nodeModules, 'esm-env/true.js') },
      { find: /^esm-env\/node$/, replacement: path.join(nodeModules, 'esm-env/true.js') },
      { find: /^esm-env$/, replacement: path.join(nodeModules, 'esm-env/index.js') },
    ],
  },
  plugins: [
    svelte({
      configFile: false,
      extensions: ['.svelte', '.svx'],
      compilerOptions: { css: 'injected' },
      preprocess: mdsvex({
        extensions: ['.svx'],
        layout: { runbook: path.join(src, 'lib/layouts/runbook.svelte') },
      }),
    }),
  ],
  server: { middlewareMode: true, watch: null, fs: { allow: [dependencies, kb] } },
});

try {
  const { render } = await server.ssrLoadModule('svelte/server');
  const reports = JSON.parse(await readFile(path.join(src, 'lib/data/reports-4471.json'), 'utf8'));
  const notes = JSON.parse(await readFile(path.join(src, 'lib/data/desk-notes.json'), 'utf8'));
  const causes = await server.ssrLoadModule(path.join(src, 'lib/kb/causes.ts'));
  const locales = await server.ssrLoadModule(path.join(src, 'lib/kb/locales.ts'));
  const cases = await server.ssrLoadModule(path.join(src, 'lib/kb/dedupe-cases.ts'));
  const deskRefs = await server.ssrLoadModule(path.join(src, 'lib/kb/desk-ref.ts'));
  const unique = causes.uniqueById(reports);
  const duplicates = reports.filter((report, index) => reports.findIndex(({ id }) => id === report.id) !== index);
  const structural = unique.map((report) => ({ report, cause: causes.causeOf(report, locales.tenantOf(report)) }));
  const temporal = new Set(notes.oneDayMove);
  const counts = {
    rows: reports.length,
    unique: unique.length,
    duplicateRows: duplicates.length,
    structuralParser: structural.filter(({ cause }) => cause === 'parser').length,
    parser: structural.filter(({ report, cause }) => cause === 'parser' && !temporal.has(report.id)).length,
    hint: structural.filter(({ cause }) => cause === 'hint').length,
    temporal: unique.filter(({ id }) => temporal.has(id)).length,
    tagMismatches: structural.filter(({ report, cause }) => cause !== report.meta.intakeTag).length,
    mergedJuly2: unique.filter(({ mergedAt }) => mergedAt?.startsWith('2026-07-02')).length,
  };
  const duplicateObjectsMatch = duplicates.every((duplicate) => {
    const first = reports.find(({ id }) => id === duplicate.id);
    return JSON.stringify(first) === JSON.stringify(duplicate);
  });
  const dedupeOutcomes = cases.DEDUPE_CASES.map(({ a, b }) =>
    causes.sameCause(a, locales.tenantOf(a), b, locales.tenantOf(b)),
  );

  assert.deepEqual(counts, {
    rows: 427,
    unique: 412,
    duplicateRows: 15,
    structuralParser: 379,
    parser: 374,
    hint: 33,
    temporal: 5,
    tagMismatches: 38,
    mergedJuly2: 184,
  });
  assert.equal(duplicateObjectsMatch, true);
  assert.equal(counts.parser + counts.hint + counts.temporal, counts.unique);
  assert.deepEqual(dedupeOutcomes, [true, false, false, true, false]);

  const renderedDir = path.join(outputRoot, 'rendered');
  await mkdir(renderedDir, { recursive: true });
  const htmlChecks = {};
  let expectedReviewRef;
  for (const [name, filename] of Object.entries(pages)) {
    const module = await server.ssrLoadModule(filename);
    const output = render(module.default);
    const head = output.head.replace(/\/\*# sourceMappingURL=data:[\s\S]*?\*\//g, '');
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${head}</head><body>${output.body}</body></html>`;
    assert.ok(output.body.length > 200, `${name} rendered an empty body`);
    assert.doesNotMatch(html, /sourceMappingURL|\/Users\//);
    await writeFile(path.join(renderedDir, `${name}.html`), html);
    htmlChecks[name] = { bytes: Buffer.byteLength(html), title: module.metadata?.title ?? null };
    if (name === 'review') expectedReviewRef = deskRefs.deskRef(module.metadata.signature);
  }

  const incidentHtml = await readFile(path.join(renderedDir, 'incident.html'), 'utf8');
  const reviewHtml = await readFile(path.join(renderedDir, 'review.html'), 'utf8');
  const triageHtml = await readFile(path.join(renderedDir, 'triage.html'), 'utf8');
  const decisionHtml = await readFile(path.join(renderedDir, 'decision.html'), 'utf8');
  assert.match(incidentHtml, /<code[^>]*>parser<\/code>[\s\S]*?<td[^>]*>379<\/td>/);
  assert.match(incidentHtml, /<code[^>]*>hint<\/code>[\s\S]*?<td[^>]*>33<\/td>/);
  assert.match(incidentHtml, /5 reports read as a one-day move/);
  assert.match(reviewHtml, /<td[^>]*>374<\/td>[\s\S]*?<td[^>]*>33<\/td>[\s\S]*?<td[^>]*>5<\/td>/);
  assert.match(reviewHtml, new RegExp(`desk ref <b[^>]*>${expectedReviewRef}<\\/b>`));
  assert.match(triageHtml, /\d+ days ago · stale/);
  assert.match(decisionHtml, /\d+ days ago · stale/);

  const verification = {
    counts,
    duplicateObjectsMatch,
    dedupeOutcomes,
    htmlChecks,
    semanticChecks: {
      incidentCauseTable: true,
      temporalFootnote: true,
      reviewPartition: true,
      signedReview: true,
      signatureMatchesFrontmatter: true,
      staleTriageAndDecision: true,
    },
  };
  await writeFile(path.join(outputRoot, 'verification.json'), `${JSON.stringify(verification, null, 2)}\n`);
  console.log(JSON.stringify(verification, null, 2));
} finally {
  await server.close();
}
