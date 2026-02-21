'use strict';

const path = require('path');
const fs   = require('fs');

const { generatePdf, formatDuration } = require('./pdfGenerator');
const { DESCRIPTIONS, SECTION_HEADINGS } = require('./descriptions');

const OUTPUT_DIR = path.join(__dirname, '..', 'Alans_to_do_list_PlaywrightTest');

/**
 * Custom Playwright reporter that generates a PDF report after every test run.
 *
 * Add to playwright.config.js:
 *   reporter: [['list'], ['./reports/playwrightReporter.js']]
 */
class PlaywrightPdfReporter {
  constructor() {
    this._tests     = [];
    this._startTime = new Date();
  }

  onBegin(_config, _suite) {
    this._startTime = new Date();
    this._tests     = [];
  }

  onTestEnd(test, result) {
    // test.parent.title = the innermost describe block title
    const sectionKey = (test.parent && test.parent.title) ? test.parent.title : 'General';
    const lookupKey  = `${sectionKey} > ${test.title}`;

    this._tests.push({
      sectionKey,
      name:        test.title,
      description: DESCRIPTIONS[lookupKey] || test.title,
      passed:      result.status === 'passed',
      duration:    result.duration || 0,
    });
  }

  async onEnd(result) {
    try {
      if (this._tests.length === 0) {
        console.log('\n⚠️  Playwright PDF reporter: no tests found — skipping PDF.\n');
        return;
      }

      // ── 1. Group tests by section ─────────────────────────────────────────
      const sectionMap = new Map();

      for (const t of this._tests) {
        if (!sectionMap.has(t.sectionKey)) sectionMap.set(t.sectionKey, []);
        sectionMap.get(t.sectionKey).push({
          name:        t.name,
          description: t.description,
          passed:      t.passed,
          duration:    t.duration,
        });
      }

      // ── 2. Build sections array ───────────────────────────────────────────
      const sections = [];
      for (const [key, tests] of sectionMap) {
        sections.push({
          heading: SECTION_HEADINGS[key] || key || 'General',
          tests,
        });
      }

      // ── 3. Build summary ──────────────────────────────────────────────────
      const total   = this._tests.length;
      const passed  = this._tests.filter(t => t.passed).length;
      const failed  = total - passed;
      // result.duration (ms) was introduced in Playwright 1.32; fall back just in case
      const elapsed = (typeof result.duration === 'number')
        ? result.duration
        : (Date.now() - this._startTime.getTime());

      const summary = { total, passed, failed, duration: formatDuration(elapsed) };

      // ── 4. Determine output path ──────────────────────────────────────────
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });

      const now      = new Date();
      const ts       = now.toISOString().replace('T', '_').replace(/:/g, '-').slice(0, 19);
      const fileName = `Alans_to_do_list_PlaywrightTest_${ts}.pdf`;
      const outputPath = path.join(OUTPUT_DIR, fileName);
      const timestamp  = now.toISOString().replace('T', ' ').slice(0, 19);

      // ── 5. Generate PDF ───────────────────────────────────────────────────
      await generatePdf({
        title:    "Alan's To Do List",
        subtitle: 'Browser (End-to-End) Test Report',
        timestamp,
        sections,
        summary,
        outputPath,
      });

      console.log(`\n📄 Playwright PDF report saved to:\n   ${outputPath}\n`);
    } catch (err) {
      console.error('\n❌ Playwright PDF reporter encountered an error:', err, '\n');
    }
  }
}

module.exports = PlaywrightPdfReporter;
