import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const evidence = fileURLToPath(new URL('../evidence/', import.meta.url));
const before = JSON.parse(readFileSync(path.join(evidence, 'baseline/ui/playwright-ui-results.json'), 'utf8'));
const after = JSON.parse(readFileSync(path.join(evidence, 'after/ui/playwright-ui-results.json'), 'utf8'));
const comparisons = [];
function compare(id, actual, expected) {
  try {
    assert.deepEqual(actual, expected);
    comparisons.push({ id, equal: true });
  } catch (error) {
    comparisons.push({ id, equal: false, detail: error.message });
  }
}
compare('same-application-url', after.url, before.url);
compare('same-browser-version', after.browserVersion, before.browserVersion);
compare('same-test-ids', after.checks.map((check) => check.id), before.checks.map((check) => check.id));
compare('same-check-results', after.checks.map(({id,status}) => ({id,status})), before.checks.map(({id,status}) => ({id,status})));
for (const [id, state] of Object.entries(before.observableStates)) compare(`feedback-${id}`, after.observableStates[id], state);
compare('same-observable-state-ids', Object.keys(after.observableStates), Object.keys(before.observableStates));
compare('same-initial-booking-records', after.dataBefore, before.dataBefore);
compare('same-final-booking-records', after.dataAfter, before.dataAfter);
for (const id of ['UI04-DESKTOP', 'UI04-MOBILE', 'UI05']) {
  compare(`same-${id}-observations`, after.checks.find((check) => check.id === id), before.checks.find((check) => check.id === id));
}
compare('same-no-page-errors', after.consoleErrors, before.consoleErrors);
const screenshotComparisons = before.screenshots.map((name) => {
  const sha = (phase) => createHash('sha256').update(readFileSync(path.join(evidence, phase === 'before' ? 'baseline/ui' : 'after/ui', name))).digest('hex');
  const beforeSha256 = sha('before');
  const afterSha256 = sha('after');
  return { screenshot: name, beforeSha256, afterSha256, bytesIdentical: beforeSha256 === afterSha256 };
});
const report = {
  comparedAt: new Date().toISOString(),
  command: 'node practice10/tools/compare-ui.mjs',
  before: {startedAt:before.startedAt, gitHead:before.gitHead, sourceHashes:before.sourceHashes, total:before.total, passed:before.passed, failed:before.failed},
  after: {startedAt:after.startedAt, gitHead:after.gitHead, sourceHashes:after.sourceHashes, total:after.total, passed:after.passed, failed:after.failed},
  observableStateCount: Object.keys(before.observableStates).length,
  comparisons,
  screenshotComparisons,
  allBehaviourComparisonsEqual: comparisons.every((comparison) => comparison.equal),
  limitations: ['Recorded browser states cover the deterministic scenarios in tests/practice09-browser.mjs, not every possible user input.', 'Screenshot hashes compare exact PNG bytes; a difference alone would not establish a behaviour regression.'],
};
writeFileSync(path.join(evidence, 'ui-comparison.json'), JSON.stringify(report,null,2)+'\n');
const output = [report.command, ...comparisons.map(({id,equal}) => `${equal?'MATCH':'DIFFERENCE'} ${id}`), ...screenshotComparisons.map(({screenshot,bytesIdentical}) => `${bytesIdentical?'IDENTICAL PNG':'DIFFERENT PNG'} ${screenshot}`), `Behaviour comparisons: ${comparisons.filter((c)=>c.equal).length}/${comparisons.length} equal`, `Observable feedback states: ${report.observableStateCount}`, `UI before: ${before.passed}/${before.total} passed; after: ${after.passed}/${after.total} passed`].join('\n')+'\n';
writeFileSync(path.join(evidence,'ui-comparison.txt'), output);
console.log(output);
if (!report.allBehaviourComparisonsEqual || before.failed || after.failed) process.exitCode=1;
