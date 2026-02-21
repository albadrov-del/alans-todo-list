'use strict';

/**
 * Generates:  Tutorials/Starting_Jest_Playwright.pdf
 * Run with:   node generateTutorial.js
 */

const PDFDocument = require('pdfkit');
const fs   = require('fs');
const path = require('path');

const OUTPUT_DIR  = path.join(__dirname, 'Tutorials');
const ts          = new Date().toISOString().replace('T', '_').replace(/:/g, '-').slice(0, 19);
const OUTPUT_PATH = path.join(OUTPUT_DIR, `Starting_Jest_Playwright_${ts}.pdf`);

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ── Colours ───────────────────────────────────────────────────────────────────
const NAVY          = '#1e293b';
const SLATE         = '#64748b';
const LIGHT_SLATE   = '#94a3b8';
const TEXT_DARK     = '#1e293b';
const TEXT_MED      = '#475569';
const TEXT_LIGHT    = '#64748b';
const JEST_GREEN    = '#16a34a';
const JEST_BG       = '#f0fdf4';
const JEST_LIGHT    = '#dcfce7';
const PW_PURPLE     = '#7c3aed';
const PW_BG         = '#f5f3ff';
const PW_LIGHT      = '#ede9fe';
const WARN_BG       = '#fffbeb';
const WARN_BORDER   = '#f59e0b';
const WARN_TEXT     = '#78350f';
const CODE_BG       = '#0f172a';

// ── Page geometry ─────────────────────────────────────────────────────────────
const PAGE_W    = 595;
const PAGE_H    = 842;
const MARGIN    = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;   // 495

// ── Build the document ────────────────────────────────────────────────────────
const doc    = new PDFDocument({ size: 'A4', margin: 0 });
const stream = fs.createWriteStream(OUTPUT_PATH);
doc.pipe(stream);

drawCoverPage(doc);
doc.addPage();
drawTestPage(doc, 'jest');
doc.addPage();
drawTestPage(doc, 'playwright');
doc.addPage();
drawRunAllPage(doc);

stream.on('finish', () => {
  console.log('\n✅  Tutorial PDF saved to:\n    ' + OUTPUT_PATH + '\n');
});
doc.end();

// =============================================================================
// COVER PAGE
// =============================================================================
function drawCoverPage(doc) {
  // ── Header band ──────────────────────────────────────────────────────────
  doc.rect(0, 0, PAGE_W, 145).fill(NAVY);

  doc.font('Helvetica-Bold').fontSize(28).fillColor('#ffffff')
     .text("Alan's To Do List", MARGIN, 28, { width: CONTENT_W, lineBreak: false });

  doc.font('Helvetica').fontSize(15).fillColor(LIGHT_SLATE)
     .text('Test Suite Tutorial', MARGIN, 70, { width: CONTENT_W, lineBreak: false });

  doc.rect(MARGIN, 96, CONTENT_W, 1).fill('#334155');

  doc.font('Helvetica-Oblique').fontSize(10.5).fillColor(SLATE)
     .text('A practical guide to running automated tests', MARGIN, 110, { width: CONTENT_W, lineBreak: false });

  // ── Body ─────────────────────────────────────────────────────────────────
  let y = 175;

  doc.font('Helvetica-Bold').fontSize(13).fillColor(TEXT_DARK)
     .text('What are automated tests?', MARGIN, y);
  y = doc.y + 8;

  doc.font('Helvetica').fontSize(10.5).fillColor(TEXT_MED)
     .text(
       'Automated tests are programs that check your app is working correctly — without you having to click through ' +
       'it manually every time you make a change. They run in seconds, catch problems the moment they appear, ' +
       'and give you confidence that nothing has accidentally broken.',
       MARGIN, y, { width: CONTENT_W, lineGap: 3 }
     );
  y = doc.y + 22;

  doc.font('Helvetica-Bold').fontSize(13).fillColor(TEXT_DARK)
     .text("Alan's To Do List has two test suites", MARGIN, y);
  y = doc.y + 8;

  doc.font('Helvetica').fontSize(10.5).fillColor(TEXT_MED)
     .text(
       'Each suite checks a different part of the app. Together they give full coverage — from the server logic ' +
       'all the way to the buttons on screen. Use the pages that follow to understand what each one does and how to run it.',
       MARGIN, y, { width: CONTENT_W, lineGap: 3 }
     );
  y = doc.y + 26;

  // ── Jest overview box ─────────────────────────────────────────────────────
  y = coverBox(doc, y, {
    accentColor: JEST_GREEN,
    bg:          JEST_BG,
    badge:       'JEST',
    title:       'API Tests',
    desc:        'Checks server logic — accounts, login, security, to-do list data — without a browser.',
    command:     'npm test',
    stats:       '35 tests  •  ~25 seconds  •  Page 2',
  });

  y += 14;

  // ── Playwright overview box ───────────────────────────────────────────────
  y = coverBox(doc, y, {
    accentColor: PW_PURPLE,
    bg:          PW_BG,
    badge:       'PLAYWRIGHT',
    title:       'Browser Tests',
    desc:        'Runs a real browser end-to-end, testing the full user journey from sign-up to sign-out.',
    command:     'npm run test:e2e',
    stats:       '21 tests  •  ~30 seconds  •  Page 3',
  });

  y += 22;

  // ── Footer note ───────────────────────────────────────────────────────────
  doc.rect(MARGIN, y, CONTENT_W, 1).fill('#e2e8f0');
  y += 12;

  doc.font('Helvetica').fontSize(9.5).fillColor(TEXT_LIGHT)
     .text(
       'ℹ  The app server does not need to be running before you start the tests — ' +
       'each tool starts and manages its own test environment automatically.',
       MARGIN, y, { width: CONTENT_W, lineGap: 2 }
     );

  // Page number
  doc.font('Helvetica').fontSize(8).fillColor('#cbd5e1')
     .text('1 / 4', 0, PAGE_H - 28, { width: PAGE_W, align: 'center', lineBreak: false });
}

/** Draws one of the two overview boxes on the cover page. Returns next y. */
function coverBox(doc, y, { accentColor, bg, badge, title, desc, command, stats }) {
  const BOX_H  = 90;
  const IX     = MARGIN + 16;       // inner X (after left accent bar)
  const IW     = CONTENT_W - 20;    // inner width

  // Background + left accent strip
  doc.rect(MARGIN, y, CONTENT_W, BOX_H).fill(bg);
  doc.rect(MARGIN, y, 5, BOX_H).fill(accentColor);

  // Badge pill
  const bw = badge.length * 6 + 18;
  doc.roundedRect(IX, y + 15, bw, 17, 3).fill(accentColor);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#ffffff')
     .text(badge, IX, y + 19, { width: bw, align: 'center', lineBreak: false });

  // Title
  doc.font('Helvetica-Bold').fontSize(14).fillColor(accentColor)
     .text(title, IX + bw + 10, y + 13, { lineBreak: false });

  // Description
  doc.font('Helvetica').fontSize(10).fillColor(TEXT_MED)
     .text(desc, IX, y + 40, { width: IW - 6, lineBreak: false });

  // Command box + stats
  const cw = command.length * 7 + 22;
  doc.roundedRect(IX, y + 62, cw, 17, 3).fill(NAVY);
  doc.font('Courier').fontSize(9.5).fillColor('#e2e8f0')
     .text(command, IX, y + 66, { width: cw, align: 'center', lineBreak: false });

  doc.font('Helvetica').fontSize(9).fillColor(TEXT_LIGHT)
     .text(stats, IX + cw + 12, y + 66, { lineBreak: false });

  return y + BOX_H;
}

// =============================================================================
// TEST PAGES  (shared template for Jest and Playwright)
// =============================================================================
function drawTestPage(doc, type) {
  const isJest = type === 'jest';

  // ── All copy defined here ─────────────────────────────────────────────────
  const C = isJest ? {
    accentColor:  JEST_GREEN,
    accentLight:  JEST_LIGHT,
    headerDark:   '#052e16',
    badge:        'API TESTS',
    title:        'Jest',
    subtitle:     'Automated checks for the server — no browser needed',
    command:      'npm test',
    pageNum:      '2 / 4',

    whatIsIt:
      'Jest is an automated testing framework that checks the app\'s server-side logic directly — ' +
      'no browser required. It sends requests to the server (register, log in, save a list, delete, etc.) ' +
      'and verifies that every response is exactly right: the correct data comes back, invalid inputs are ' +
      'rejected, and security rules hold firm.',

    bullets: [
      'Runs 35 test scenarios in about 25 seconds — an instant safety check every time you touch the code.',
      'Tests security rules automatically: wrong passwords are refused, users can only see their own lists.',
      'Catches validation gaps early — missing fields, passwords that are too short, duplicate email addresses.',
      'Acts as living documentation: every test describes exactly what the server is supposed to do.',
      'Gives you confidence to make changes, knowing the tests will flag it immediately if something breaks.',
    ],

    warnings: [
      { n: '1', t: 'A code change silently breaks the login system. Users cannot sign in — you only find out when someone complains.' },
      { n: '2', t: 'A bug allows registration with a duplicate email address. Two accounts share the same login, leading to data mix-ups or a privacy breach.' },
      { n: '3', t: 'A security flaw lets one user read or edit another user\'s private to-do lists, with no one noticing until damage is done.' },
      { n: '4', t: 'After tweaking password rules, 3-character passwords are accidentally accepted — making accounts trivially easy to guess.' },
      { n: '5', t: 'The logout endpoint stops clearing the session cookie. On a shared computer the next person walks straight into someone else\'s account.' },
    ],

    howToNotes: [
      'All 35 API tests run automatically (takes ~25 seconds)',
      'Results are printed in the terminal — green ✓ for passing, red ✗ for failing',
      "A PDF report is saved automatically to:  Alan's_to_do_list_JestTest\\",
      'The app server does not need to be running before you start',
    ],
  } : {
    accentColor:  PW_PURPLE,
    accentLight:  PW_LIGHT,
    headerDark:   '#2e1065',
    badge:        'BROWSER TESTS',
    title:        'Playwright',
    subtitle:     'Automated checks that control a real browser end-to-end',
    command:      'npm run test:e2e',
    pageNum:      '3 / 4',

    whatIsIt:
      'Playwright is an automated browser testing tool that controls a real Chromium browser and interacts ' +
      'with the app exactly as a real user would — filling in forms, clicking buttons, navigating between ' +
      'pages, and checking that the right things appear on screen. It tests the complete user experience ' +
      'from the very first visit all the way through to sign-out.',

    bullets: [
      'Tests the full user journey — registration, login, creating lists, saving content, and signing out — all automatically.',
      'Catches UI and navigation bugs that API tests cannot see: broken redirects, missing buttons, wrong page flows.',
      'Verifies that the frontend and backend work correctly together — not just each one in isolation.',
      'Replaces hours of manual browser clicking after every change: 21 scenarios run in about 30 seconds.',
      'Confirms the experience for a brand-new user — from the very first page load to the first saved list.',
    ],

    warnings: [
      { n: '1', t: 'The server API works fine (Jest confirms it), but after registering the user is never sent to the login page — they are left staring at a broken or blank screen.' },
      { n: '2', t: 'A JavaScript update removes the Sign Out button\'s click handler. Users cannot log out. The API still works — only the front-end connection is broken, which Jest would never catch.' },
      { n: '3', t: 'Content saves to the database correctly, but a frontend bug stops it reloading into the editor after a page refresh — users believe their work has disappeared.' },
      { n: '4', t: 'A CSS change collapses all accordion panels with no way to expand them. The lists exist in the database but are completely invisible on screen.' },
      { n: '5', t: 'The link between the login page and the registration page breaks. New visitors cannot find how to create an account and simply leave the app.' },
    ],

    howToNotes: [
      'A Chromium browser runs in the background and clicks through 21 scenarios (~30 seconds)',
      'Results are printed in the terminal as each test completes',
      "A PDF report is saved automatically to:  Alan's_to_do_list_PlaywrightTest\\",
      'The app server does not need to be running — Playwright starts its own on a separate port',
    ],
  };

  const { accentColor, accentLight, headerDark, badge, title, subtitle, command,
          pageNum, whatIsIt, bullets, warnings, howToNotes } = C;

  // ── Header ────────────────────────────────────────────────────────────────
  const HEADER_H = 90;
  doc.rect(0, 0, PAGE_W, HEADER_H).fill(NAVY);
  doc.rect(0, 0, 6, HEADER_H).fill(accentColor);

  const bw = badge.length * 6 + 18;
  doc.roundedRect(MARGIN, 16, bw, 18, 4).fill(accentColor);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#ffffff')
     .text(badge, MARGIN, 20, { width: bw, align: 'center', lineBreak: false });

  doc.font('Helvetica-Bold').fontSize(26).fillColor('#ffffff')
     .text(title, MARGIN + bw + 12, 12, { lineBreak: false });

  doc.font('Helvetica').fontSize(10).fillColor(LIGHT_SLATE)
     .text(subtitle, MARGIN, 48, { width: CONTENT_W, lineBreak: false });

  // Command badge — right side of header
  const cw = command.length * 7.5 + 22;
  const cx = PAGE_W - MARGIN - cw;
  doc.roundedRect(cx, 58, cw, 20, 4).fill(headerDark);
  doc.font('Courier-Bold').fontSize(10).fillColor(accentColor)
     .text(command, cx, 62, { width: cw, align: 'center', lineBreak: false });

  let y = HEADER_H + 20;

  // ── Section 1: What is it? ────────────────────────────────────────────────
  y = secHead(doc, y, 'What is it?', accentColor);

  doc.font('Helvetica').fontSize(10.5).fillColor(TEXT_MED)
     .text(whatIsIt, MARGIN, y, { width: CONTENT_W, lineGap: 3 });
  y = doc.y + 16;

  // ── Section 2: Why does it matter? ───────────────────────────────────────
  y = secHead(doc, y, 'Why does it matter?', accentColor);

  bullets.forEach(b => { y = bullet(doc, y, b, accentColor); });
  y += 4;

  // ── Section 3: What can go wrong without it? ──────────────────────────────
  y = secHead(doc, y, 'What can go wrong without it?', WARN_BORDER);
  y = warningList(doc, y, warnings);
  y += 4;

  // ── Section 4: How to run it ──────────────────────────────────────────────
  y = secHead(doc, y, 'How to run it', NAVY);
  y = commandBlock(doc, y, command, howToNotes, accentColor);

  // Page number
  doc.font('Helvetica').fontSize(8).fillColor('#cbd5e1')
     .text(pageNum, 0, PAGE_H - 28, { width: PAGE_W, align: 'center', lineBreak: false });
}

// =============================================================================
// SHARED DRAWING HELPERS
// =============================================================================

/** Section heading with a coloured left bar. Returns next y. */
function secHead(doc, y, text, color) {
  doc.rect(MARGIN, y, 4, 18).fill(color);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(TEXT_DARK)
     .text(text, MARGIN + 12, y + 3, { width: CONTENT_W - 12, lineBreak: false });
  return y + 26;
}

/** Single bullet point. Returns next y. */
function bullet(doc, y, text, dotColor) {
  doc.font('Helvetica').fontSize(10.5);
  const h = doc.heightOfString(text, { width: CONTENT_W - 20, lineGap: 2 });

  doc.roundedRect(MARGIN + 3, y + 5, 6, 6, 2).fill(dotColor);
  doc.font('Helvetica').fontSize(10.5).fillColor(TEXT_MED)
     .text(text, MARGIN + 18, y, { width: CONTENT_W - 18, lineGap: 2 });

  return y + Math.max(16, h) + 5;
}

/** Orange warning list. Returns next y. */
function warningList(doc, y, items) {
  // Pre-calculate total box height before drawing
  doc.font('Helvetica').fontSize(10);
  let totalH = 14;
  items.forEach(item => {
    const h = doc.heightOfString(item.t, { width: CONTENT_W - 50, lineGap: 2 });
    totalH += Math.max(18, h) + 8;
  });

  doc.rect(MARGIN, y, CONTENT_W, totalH).fill(WARN_BG);
  doc.rect(MARGIN, y, 5, totalH).fill(WARN_BORDER);

  let iy = y + 10;
  items.forEach(item => {
    // Numbered circle
    doc.circle(MARGIN + 19, iy + 8, 8).fill(WARN_BORDER);
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff')
       .text(item.n, MARGIN + 15, iy + 4, { width: 9, align: 'center', lineBreak: false });

    // Text
    doc.font('Helvetica').fontSize(10).fillColor(WARN_TEXT)
       .text(item.t, MARGIN + 35, iy, { width: CONTENT_W - 45, lineGap: 2 });

    const h = doc.heightOfString(item.t, { width: CONTENT_W - 45, lineGap: 2 });
    iy += Math.max(18, h) + 8;
  });

  return y + totalH + 8;
}

/** Dark terminal-style command block with notes below. Returns next y. */
function commandBlock(doc, y, command, notes, accentColor) {
  const BOX_H = 48;

  // Terminal box
  doc.rect(MARGIN, y, CONTENT_W, BOX_H).fill(CODE_BG);

  // Green $ prompt
  doc.font('Courier').fontSize(12).fillColor('#4ade80')
     .text('$', MARGIN + 16, y + 14, { lineBreak: false });

  // Command text
  doc.font('Courier-Bold').fontSize(14).fillColor('#f1f5f9')
     .text(command, MARGIN + 30, y + 11, { lineBreak: false });

  y += BOX_H + 10;

  // Bullet notes
  notes.forEach(note => {
    doc.font('Helvetica').fontSize(10);
    const h = doc.heightOfString(note, { width: CONTENT_W - 18 });

    doc.roundedRect(MARGIN + 3, y + 5, 5, 5, 1).fill(LIGHT_SLATE);
    doc.font('Helvetica').fontSize(10).fillColor(TEXT_LIGHT)
       .text(note, MARGIN + 16, y, { width: CONTENT_W - 16 });

    y += Math.max(14, h) + 4;
  });

  return y + 4;
}

// =============================================================================
// PAGE 4 — RUN BOTH AT ONCE
// =============================================================================
function drawRunAllPage(doc) {
  const ACCENT   = '#0ea5e9';   // sky blue — neutral, covers both tools
  const ACCENT_BG = '#f0f9ff';
  const ACCENT_LIGHT = '#bae6fd';
  const HEADER_H = 90;

  // ── Header ────────────────────────────────────────────────────────────────
  doc.rect(0, 0, PAGE_W, HEADER_H).fill(NAVY);
  doc.rect(0, 0, 6, HEADER_H).fill(ACCENT);

  const badge  = 'FULL SUITE';
  const bw     = badge.length * 6 + 18;
  doc.roundedRect(MARGIN, 16, bw, 18, 4).fill(ACCENT);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#ffffff')
     .text(badge, MARGIN, 20, { width: bw, align: 'center', lineBreak: false });

  doc.font('Helvetica-Bold').fontSize(26).fillColor('#ffffff')
     .text('Run Both at Once', MARGIN + bw + 12, 12, { lineBreak: false });

  doc.font('Helvetica').fontSize(10).fillColor(LIGHT_SLATE)
     .text('Run Jest and Playwright back-to-back with a single command', MARGIN, 48, { width: CONTENT_W, lineBreak: false });

  // Command badge — right side of header
  const cmdText = 'npm run test:all';
  const cw = cmdText.length * 7.5 + 22;
  const cx = PAGE_W - MARGIN - cw;
  doc.roundedRect(cx, 58, cw, 20, 4).fill('#020617');
  doc.font('Courier-Bold').fontSize(10).fillColor(ACCENT)
     .text(cmdText, cx, 62, { width: cw, align: 'center', lineBreak: false });

  let y = HEADER_H + 20;

  // ── What it does ──────────────────────────────────────────────────────────
  y = secHead(doc, y, 'What it does', ACCENT);

  doc.font('Helvetica').fontSize(10.5).fillColor(TEXT_MED)
     .text(
       'npm run test:all runs both test suites in sequence with one command. Jest goes first and checks all ' +
       'the server logic. Once it finishes, Playwright takes over and clicks through the browser scenarios. ' +
       'Both PDF reports are generated automatically at the end.',
       MARGIN, y, { width: CONTENT_W, lineGap: 3 }
     );
  y = doc.y + 18;

  // ── The two stages ────────────────────────────────────────────────────────
  y = secHead(doc, y, 'What runs and in what order', ACCENT);

  // Stage 1 box — Jest
  const STAGE_H = 72;
  doc.rect(MARGIN, y, CONTENT_W, STAGE_H).fill(JEST_BG);
  doc.rect(MARGIN, y, 5, STAGE_H).fill(JEST_GREEN);

  doc.roundedRect(MARGIN + 16, y + 14, 44, 17, 3).fill(JEST_GREEN);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#ffffff')
     .text('STAGE 1', MARGIN + 16, y + 18, { width: 44, align: 'center', lineBreak: false });

  doc.font('Helvetica-Bold').fontSize(13).fillColor(JEST_GREEN)
     .text('Jest — API Tests', MARGIN + 68, y + 12, { lineBreak: false });
  doc.font('Helvetica').fontSize(10).fillColor(TEXT_MED)
     .text('35 tests · ~25 seconds · checks all server logic', MARGIN + 68, y + 32, { lineBreak: false });
  doc.font('Helvetica').fontSize(9).fillColor(TEXT_LIGHT)
     .text("Report saved to: Alan's_to_do_list_JestTest\\", MARGIN + 68, y + 50, { lineBreak: false });

  y += STAGE_H + 4;

  // Down arrow between stages
  doc.font('Helvetica').fontSize(16).fillColor(LIGHT_SLATE)
     .text('↓', 0, y, { width: PAGE_W, align: 'center', lineBreak: false });
  y += 22;

  // Stage 2 box — Playwright
  doc.rect(MARGIN, y, CONTENT_W, STAGE_H).fill(PW_BG);
  doc.rect(MARGIN, y, 5, STAGE_H).fill(PW_PURPLE);

  doc.roundedRect(MARGIN + 16, y + 14, 44, 17, 3).fill(PW_PURPLE);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#ffffff')
     .text('STAGE 2', MARGIN + 16, y + 18, { width: 44, align: 'center', lineBreak: false });

  doc.font('Helvetica-Bold').fontSize(13).fillColor(PW_PURPLE)
     .text('Playwright — Browser Tests', MARGIN + 68, y + 12, { lineBreak: false });
  doc.font('Helvetica').fontSize(10).fillColor(TEXT_MED)
     .text('21 tests · ~30 seconds · clicks through the app in a real browser', MARGIN + 68, y + 32, { lineBreak: false });
  doc.font('Helvetica').fontSize(9).fillColor(TEXT_LIGHT)
     .text("Report saved to: Alan's_to_do_list_PlaywrightTest\\", MARGIN + 68, y + 50, { lineBreak: false });

  y += STAGE_H + 20;

  // ── Totals summary bar ────────────────────────────────────────────────────
  y = secHead(doc, y, 'Total at a glance', ACCENT);

  const BAR_H  = 58;
  const BOX_W  = Math.floor((CONTENT_W - 20) / 3);
  const totals = [
    { label: 'Total Tests', value: '56',  color: NAVY,       bg: '#e2e8f0' },
    { label: 'Time',        value: '~55s', color: ACCENT,     bg: ACCENT_BG },
    { label: 'PDF Reports', value: '2',   color: '#059669',  bg: '#ecfdf5' },
  ];

  doc.rect(0, y, PAGE_W, BAR_H + 20).fill('#f8fafc');

  totals.forEach((t, i) => {
    const bx = MARGIN + i * (BOX_W + 10);
    const by = y + 10;
    doc.roundedRect(bx, by, BOX_W, BAR_H, 6).fill(t.bg);
    doc.font('Helvetica-Bold').fontSize(22).fillColor(t.color)
       .text(t.value, bx, by + 6, { width: BOX_W, align: 'center', lineBreak: false });
    doc.font('Helvetica').fontSize(10).fillColor(SLATE)
       .text(t.label, bx, by + 36, { width: BOX_W, align: 'center', lineBreak: false });
  });

  y += BAR_H + 30;

  // ── How to run it ─────────────────────────────────────────────────────────
  y = secHead(doc, y, 'How to run it', NAVY);
  y = commandBlock(doc, y, 'npm run test:all', [
    'Jest runs first and prints all 35 API test results',
    'Playwright runs second and prints all 21 browser test results',
    'Both PDF reports are saved automatically to their respective folders',
    'If Jest fails, Playwright still runs — you get both reports either way',
  ], ACCENT);

  // Page number
  doc.font('Helvetica').fontSize(8).fillColor('#cbd5e1')
     .text('4 / 4', 0, PAGE_H - 28, { width: PAGE_W, align: 'center', lineBreak: false });
}
