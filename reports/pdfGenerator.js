'use strict';

const PDFDocument = require('pdfkit');
const fs          = require('fs');

// ─── Colour palette (matches the app's dark-navy theme) ──────────────────────
const NAVY        = '#1e293b';
const SLATE       = '#64748b';
const LIGHT_SLATE = '#94a3b8';
const SUMMARY_BG  = '#f1f5f9';
const GREEN       = '#16a34a';
const GREEN_BG    = '#dcfce7';
const RED_TEXT    = '#dc2626';
const RED_BG      = '#fee2e2';
const GRAY_BG     = '#e2e8f0';
const BLUE_RULE   = '#3b82f6';
const TEXT_DARK   = '#1e293b';
const TEXT_MED    = '#334155';

// ─── Page geometry (A4 at 72 dpi) ────────────────────────────────────────────
const PAGE_W    = 595;
const PAGE_H    = 842;
const MARGIN    = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;   // 495 pts

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a PDF report and write it to outputPath.
 *
 * @param {object} opts
 * @param {string} opts.title       - Large heading (app name)
 * @param {string} opts.subtitle    - Smaller subheading (report type)
 * @param {string} opts.timestamp   - Human-readable timestamp string
 * @param {Array}  opts.sections    - [{heading, tests:[{name,description,passed,duration}]}]
 * @param {object} opts.summary     - {total, passed, failed, duration}
 * @param {string} opts.outputPath  - Absolute path where the PDF will be saved
 * @returns {Promise<void>}
 */
function generatePdf({ title, subtitle, timestamp, sections, summary, outputPath }) {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    let y = drawHeader(doc, title, subtitle, timestamp);
    y = drawSummary(doc, summary, y);
    drawSections(doc, sections, y);

    stream.on('finish', resolve);
    stream.on('error', reject);
    doc.end();
  });
}

/**
 * Format a duration in milliseconds as a human-readable string.
 * @param {number} ms
 * @returns {string}
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

module.exports = { generatePdf, formatDuration };

// ─────────────────────────────────────────────────────────────────────────────
// Private drawing helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Dark-navy header banner. Returns the y coordinate of the content below it. */
function drawHeader(doc, title, subtitle, timestamp) {
  const HEADER_H = 110;

  // Navy background
  doc.rect(0, 0, PAGE_W, HEADER_H).fill(NAVY);

  // App name
  doc.font('Helvetica-Bold').fontSize(22).fillColor('#ffffff')
     .text(title, MARGIN, 20, { width: CONTENT_W, lineBreak: false });

  // Report type
  doc.font('Helvetica').fontSize(13).fillColor(LIGHT_SLATE)
     .text(subtitle, MARGIN, 52, { width: CONTENT_W, lineBreak: false });

  // Timestamp
  doc.font('Helvetica').fontSize(9).fillColor(SLATE)
     .text('Generated: ' + timestamp, MARGIN, 76, { width: CONTENT_W, lineBreak: false });

  // Thin divider line near bottom of header
  doc.rect(MARGIN, 97, CONTENT_W, 1).fill('#334155');

  return HEADER_H + 18;   // first content starts at y ≈ 128
}

/** Three-box summary bar (Total / Passed / Failed) + duration. Returns next y. */
function drawSummary(doc, summary, startY) {
  const BAR_PAD = 14;
  const BOX_H   = 64;
  const BAR_H   = BOX_H + BAR_PAD * 2;                          // 92
  const BOX_GAP = 10;
  const BOX_W   = Math.floor((CONTENT_W - BOX_GAP * 2) / 3);   // ~158

  // Light-grey background strip spanning full page width
  doc.rect(0, startY, PAGE_W, BAR_H).fill(SUMMARY_BG);

  const boxes = [
    {
      label:    'Total Tests',
      value:    summary.total,
      bg:       GRAY_BG,
      valColor: NAVY,
      lblColor: SLATE,
    },
    {
      label:    'Passed',
      value:    summary.passed,
      bg:       GREEN_BG,
      valColor: GREEN,
      lblColor: SLATE,
    },
    {
      label:    'Failed',
      value:    summary.failed,
      bg:       summary.failed > 0 ? RED_BG   : GRAY_BG,
      valColor: summary.failed > 0 ? RED_TEXT : SLATE,
      lblColor: SLATE,
    },
  ];

  boxes.forEach((box, i) => {
    const bx = MARGIN + i * (BOX_W + BOX_GAP);
    const by = startY + BAR_PAD;

    // Rounded box background
    doc.roundedRect(bx, by, BOX_W, BOX_H, 6).fill(box.bg);

    // Large number
    doc.font('Helvetica-Bold').fontSize(26).fillColor(box.valColor)
       .text(String(box.value), bx, by + 8, { width: BOX_W, align: 'center', lineBreak: false });

    // Label
    doc.font('Helvetica').fontSize(10).fillColor(box.lblColor)
       .text(box.label, bx, by + 43, { width: BOX_W, align: 'center', lineBreak: false });
  });

  // Duration — small text bottom-right of the bar
  doc.font('Helvetica').fontSize(9).fillColor(SLATE)
     .text('Duration: ' + summary.duration,
           MARGIN, startY + BAR_H - 16,
           { width: CONTENT_W, align: 'right', lineBreak: false });

  return startY + BAR_H + 22;
}

/** Render all test sections. Each section has a heading and a list of tests. */
function drawSections(doc, sections, startY) {
  let y = startY;

  sections.forEach(section => {
    // Ensure there's room for at least the heading + one test row
    y = ensureSpace(doc, y, 70);

    // Blue left rule
    doc.rect(MARGIN, y, 4, 20).fill(BLUE_RULE);

    // Section heading
    doc.font('Helvetica-Bold').fontSize(12).fillColor(TEXT_DARK)
       .text(section.heading, MARGIN + 12, y + 4,
             { width: CONTENT_W - 12, lineBreak: false });

    y += 30;

    section.tests.forEach(test => {
      const BADGE_W  = 44;
      const BADGE_H  = 16;
      const TEXT_X   = MARGIN + BADGE_W + 8;
      const TEXT_W   = CONTENT_W - BADGE_W - 8;

      // Pre-calculate description height so we know whether a page break is needed
      doc.font('Helvetica').fontSize(10);
      const descH = doc.heightOfString(test.description, { width: TEXT_W });
      const rowH  = Math.max(BADGE_H + 8, descH + 6);

      y = ensureSpace(doc, y, rowH + 4);

      const badgeColor = test.passed ? GREEN   : RED_TEXT;
      const badgeBg    = test.passed ? GREEN_BG : RED_BG;
      const badgeText  = test.passed ? 'PASS'  : 'FAIL';

      // Badge pill
      doc.roundedRect(MARGIN, y + 1, BADGE_W, BADGE_H, 3).fill(badgeBg);
      doc.font('Helvetica-Bold').fontSize(8).fillColor(badgeColor)
         .text(badgeText, MARGIN, y + 4,
               { width: BADGE_W, align: 'center', lineBreak: false });

      // Plain-English description (may wrap)
      doc.font('Helvetica').fontSize(10).fillColor(TEXT_MED)
         .text(test.description, TEXT_X, y + 2, { width: TEXT_W });

      y += rowH + 4;
    });

    y += 14;   // extra breathing room between sections
  });
}

/** If the next block won't fit on the current page, start a new page. */
function ensureSpace(doc, y, needed) {
  if (y + needed > PAGE_H - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}
