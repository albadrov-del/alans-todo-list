'use strict';

const path = require('path');
const fs   = require('fs');

const { generatePdf, formatDuration } = require('./pdfGenerator');
const { DESCRIPTIONS, SECTION_HEADINGS } = require('./descriptions');

const OUTPUT_DIR = path.join(__dirname, '..', 'Alans_to_do_list_JestTest');

/**
 * Custom Jest reporter that generates a PDF report after every test run.
 *
 * Add to jest.config.js:
 *   reporters: ['default', './reports/jestReporter.js']
 */
class JestPdfReporter {
  constructor(globalConfig, _options) {
    this._globalConfig = globalConfig;
  }

  // Called per test file — nothing to do here; we batch everything in onRunComplete
  onTestResult() {}

  async onRunComplete(_contexts, results) {
    try {
      // ── 1. Collect tests grouped by section (innermost describe block) ────
      const sectionMap = new Map();   // sectionKey (technical) → test[]

      for (const suite of results.testResults) {
        for (const tc of suite.testResults) {
          // ancestorTitles = ['Outer describe', 'Inner describe', ...]
          const sectionKey = tc.ancestorTitles[tc.ancestorTitles.length - 1] || 'General';
          const lookupKey  = `${sectionKey} > ${tc.title}`;

          if (!sectionMap.has(sectionKey)) sectionMap.set(sectionKey, []);

          sectionMap.get(sectionKey).push({
            name:        tc.title,
            description: DESCRIPTIONS[lookupKey] || tc.title,
            passed:      tc.status === 'passed',
            duration:    tc.duration || 0,
          });
        }
      }

      if (sectionMap.size === 0) {
        console.log('\n⚠️  Jest PDF reporter: no tests found — skipping PDF.\n');
        return;
      }

      // ── 2. Build sections array (preserves order of first appearance) ─────
      const sections = [];
      for (const [key, tests] of sectionMap) {
        sections.push({
          heading: SECTION_HEADINGS[key] || key,
          tests,
        });
      }

      // ── 3. Build summary ──────────────────────────────────────────────────
      const elapsed = Date.now() - results.startTime;
      const summary = {
        total:    results.numTotalTests,
        passed:   results.numPassedTests,
        failed:   results.numFailedTests,
        duration: formatDuration(elapsed),
      };

      // ── 4. Determine output path ──────────────────────────────────────────
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });

      const now      = new Date();
      const ts       = now.toISOString().replace('T', '_').replace(/:/g, '-').slice(0, 19);
      const fileName = `Alans_to_do_list_JestTest_${ts}.pdf`;
      const outputPath = path.join(OUTPUT_DIR, fileName);
      const timestamp  = now.toISOString().replace('T', ' ').slice(0, 19);

      // ── 5. Generate PDF ───────────────────────────────────────────────────
      await generatePdf({
        title:     "Alan's To Do List",
        subtitle:  'API Test Report',
        timestamp,
        sections,
        summary,
        outputPath,
      });

      console.log(`\n📄 Jest PDF report saved to:\n   ${outputPath}\n`);
    } catch (err) {
      console.error('\n❌ Jest PDF reporter encountered an error:', err, '\n');
    }
  }
}

module.exports = JestPdfReporter;
