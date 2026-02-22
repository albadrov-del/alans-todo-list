'use strict';

/**
 * Generates four documentation files:
 *   Tutorials/User_Guide.pdf
 *   Tutorials/User_Guide.docx
 *   Tutorials/Developer_Tutorial.pdf
 *   Tutorials/Developer_Tutorial.docx
 *
 * Run with:  node generateDocs.js
 */

const PDFDocument = require('pdfkit');
const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } = require('docx');
const fs   = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'Tutorials');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ── Colour tokens ──────────────────────────────────────────────────────────
const NAVY        = '#1e293b';
const SLATE       = '#64748b';
const LIGHT_SLATE = '#94a3b8';
const TEXT_DARK   = '#1e293b';
const TEXT_MED    = '#475569';
const TEXT_LIGHT  = '#64748b';
const BLUE        = '#2563eb';
const BLUE_BG     = '#eff6ff';
const GREEN       = '#16a34a';
const GREEN_BG    = '#f0fdf4';
const PURPLE      = '#7c3aed';
const PURPLE_BG   = '#f5f3ff';
const CODE_BG     = '#0f172a';
const WARN_BG     = '#fffbeb';
const WARN_BORDER = '#f59e0b';
const WARN_TEXT   = '#78350f';

// ── PDF page geometry ──────────────────────────────────────────────────────
const PAGE_W    = 595;
const PAGE_H    = 842;
const MARGIN    = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

// ===========================================================================
// CONTENT DATA — USER GUIDE
// ===========================================================================

const USER_GUIDE_SECTIONS = [
  {
    title:      'Getting Started',
    brief:      'Create your account and sign in',
    badge:      'STEP 1',
    badgeColor: BLUE,
    body: [
      { type: 'heading', text: 'Creating your account' },
      { type: 'para',    text: 'Before you can use the app, you need a free account. It takes less than a minute.' },
      { type: 'steps',   items: [
        'Open the app in your browser. If you are not signed in, you are taken straight to the Sign In page.',
        'Click "Create an account" to go to the registration page (/register).',
        'Enter a username (at least 2 characters), your email address, and a password (at least 8 characters).',
        'Retype your password in the "Confirm password" field.',
        'Click Create account — you are taken to the Sign In page.',
      ]},
      { type: 'info',    text: 'Your email and username must be unique. If an account with that email or username already exists, you will see a clear error message — simply try a different one.' },
      { type: 'heading', text: 'Signing in' },
      { type: 'steps',   items: [
        'Go to the Sign In page (/login).',
        'Enter your email address and password.',
        'Click Sign in — you are taken straight to your to-do lists.',
      ]},
      { type: 'tip',     text: 'For security, the sign-in form gives the same error message whether the email does not exist or the password is wrong — this prevents others from finding out which email addresses have accounts.' },
    ],
  },
  {
    title:      'Managing Your To-Do Lists',
    brief:      'Create, edit, save, and delete lists',
    badge:      'LISTS',
    badgeColor: GREEN,
    body: [
      { type: 'heading', text: 'Your lists panel' },
      { type: 'para',    text: 'After signing in you see the main app page. If this is your first visit, a default list called "To Do List" is created for you automatically — you can start typing straight away.' },
      { type: 'heading', text: 'Creating a new list' },
      { type: 'steps',   items: [
        'Click the "Add new list" button at the top of the page.',
        'A new list panel appears, already expanded and focused.',
        'Type your content in the rich-text area. Use the toolbar for bold, italic, bullet points, and more.',
        'Optionally type a title in the panel\'s name field (defaults to "To Do List").',
        'Click Save to store your list.',
      ]},
      { type: 'heading', text: 'Editing and saving a list' },
      { type: 'steps',   items: [
        'Click the list title (the accordion header) to expand the list if it is collapsed.',
        'Edit the content in the text area.',
        'Click Save. The button briefly shows "Saved ✓" to confirm your changes are stored.',
        'Click Cancel to close the panel without saving any changes.',
      ]},
      { type: 'heading', text: 'Deleting a list' },
      { type: 'steps',   items: [
        'Expand the list you want to remove.',
        'Click the Delete button.',
        'Confirm the action — the list is permanently removed.',
      ]},
      { type: 'info',    text: 'Your to-do lists are completely private — only you can see them. Other users cannot access, view, or edit your lists under any circumstances.' },
    ],
  },
  {
    title:      'Dark Mode',
    brief:      'Switch between light and dark themes',
    badge:      'THEME',
    badgeColor: PURPLE,
    body: [
      { type: 'heading', text: 'What is dark mode?' },
      { type: 'para',    text: 'Dark mode switches the app to a dark background with light text — easier on the eyes in low-light environments and popular for reducing eye strain during long sessions.' },
      { type: 'heading', text: 'Enabling or disabling dark mode' },
      { type: 'steps',   items: [
        'Look for the "Dark mode" toggle in the top-right area of the header (only visible when signed in).',
        'Click the toggle once to switch to dark mode — the entire app changes instantly.',
        'Click it again to return to light mode.',
      ]},
      { type: 'heading', text: 'Your preference is saved automatically' },
      { type: 'para',    text: 'Your dark mode choice is saved to your account. This means:' },
      { type: 'bullets', items: [
        'Refreshing the page restores your saved theme — no need to toggle again.',
        'Signing out and back in also re-applies your saved preference.',
        'Your preference is tied to your account, not to a specific browser or device.',
      ]},
      { type: 'info',    text: 'The toggle is fully accessible: it has an aria-label for screen readers and can be activated using the keyboard (Tab to focus, Space to toggle).' },
    ],
  },
  {
    title:      'Signing Out & Your Privacy',
    brief:      'End your session and understand how your data is stored',
    badge:      'PRIVACY',
    badgeColor: SLATE,
    body: [
      { type: 'heading', text: 'Signing out' },
      { type: 'para',    text: 'Always sign out when you are finished — especially on shared or public computers.' },
      { type: 'steps',   items: [
        'Click the "Sign out" button in the page header.',
        'Your session ends immediately and you are taken to the Sign In page.',
        'The app cannot be accessed again without signing in.',
      ]},
      { type: 'heading', text: 'How your data is stored' },
      { type: 'bullets', items: [
        'Your password is never stored in plain text — it is hashed using bcrypt before saving to the database.',
        'Your login session is held in a secure httpOnly cookie that cannot be read by JavaScript, protecting you from certain attack types.',
        'Your to-do list content is saved in a PostgreSQL database, associated only with your account.',
        'Your dark mode preference is stored per account in the database.',
        'No tracking, analytics, or advertising data is collected.',
      ]},
      { type: 'heading', text: 'Your account security tips' },
      { type: 'bullets', items: [
        'Use a strong, unique password (at least 8 characters — longer is better).',
        'Always sign out on shared or public devices.',
        'Your to-do lists are completely private — other users cannot see or edit them.',
      ]},
    ],
  },
];

// ===========================================================================
// CONTENT DATA — DEVELOPER TUTORIAL
// ===========================================================================

const DEV_TUTORIAL_SECTIONS = [
  {
    title:      'Project Overview',
    brief:      'What the app is and how it is built',
    badge:      'OVERVIEW',
    badgeColor: BLUE,
    body: [
      { type: 'heading', text: "What is Alan's To Do List?" },
      { type: 'para',    text: "Alan's To Do List is a full-stack web application for creating and managing rich-text to-do panels. It demonstrates a complete, production-ready Node.js + PostgreSQL application with JWT authentication, dark mode, automated testing (Jest + Playwright), CI/CD via GitHub Actions, and cloud deployment on Railway." },
      { type: 'heading', text: 'Tech stack at a glance' },
      { type: 'bullets', items: [
        'Backend:    Node.js + Express — API routes, authentication, static file serving',
        'Database:   PostgreSQL 17 — users, to-do panels, user preferences',
        'Auth:       JWT in httpOnly cookies (7-day expiry)',
        'Passwords:  bcryptjs (saltRounds = 12)',
        'Rich text:  Quill.js (Delta stored as JSONB)',
        'Frontend:   Vanilla JS + HTML + CSS (no framework)',
        'API tests:  Jest + supertest — 46 tests',
        'E2E tests:  Playwright (Chromium) — 31 tests',
        'PDF reports: pdfkit (custom Jest + Playwright reporters)',
        'CI/CD:      GitHub Actions (push + PR to main)',
        'Hosting:    Railway (app + managed PostgreSQL)',
      ]},
    ],
  },
  {
    title:      'Setting Up Locally',
    brief:      'Prerequisites, installation, and environment configuration',
    badge:      'SETUP',
    badgeColor: GREEN,
    body: [
      { type: 'heading', text: 'Why this matters' },
      { type: 'para',    text: 'A working local environment is the foundation for all development. You must be able to run the app locally before writing code, running tests, or debugging.' },
      { type: 'heading', text: 'Prerequisites' },
      { type: 'bullets', items: [
        'Node.js 18 or higher — nodejs.org',
        'PostgreSQL 17 — postgresql.org  (note your port — 5432 by default, 5433 on some Windows installs)',
        'Git — to clone the repository',
        'A code editor — VS Code is recommended',
      ]},
      { type: 'heading', text: 'Installation steps' },
      { type: 'steps',   items: [
        'Clone the repo:    git clone https://github.com/albadrov-del/alans-todo-list.git',
        'Enter the folder:  cd alans-todo-list',
        'Install packages:  npm install',
        'Create .env:       copy .env.example .env  (Windows)  or  cp .env.example .env',
        'Edit .env and fill in your database password and a random JWT_SECRET string.',
        'Create the production DB:  createdb alans_todo',
        'Create the test DB:        createdb alans_todo_test',
        'Run the schema:            psql -d alans_todo -f setup.sql',
        'Start the server:          node server.js  (or double-click Start App.bat on Windows)',
        'Open http://localhost:3000 in your browser.',
      ]},
      { type: 'heading', text: 'Required .env variables' },
      { type: 'code',    text: 'DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/alans_todo\nTEST_DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/alans_todo_test\nJWT_SECRET=change_me_to_a_long_random_string\nPORT=3000' },
      { type: 'info',    text: 'Never commit your .env file — it is already in .gitignore. Generate a strong JWT_SECRET with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"' },
    ],
  },
  {
    title:      'Database Schema',
    brief:      'Tables, relationships, and migration strategy',
    badge:      'DATABASE',
    badgeColor: PURPLE,
    body: [
      { type: 'heading', text: 'Why PostgreSQL?' },
      { type: 'para',    text: 'PostgreSQL gives us referential integrity via foreign keys, efficient per-user queries, and native JSONB support for Quill Delta content — all without needing a separate NoSQL store.' },
      { type: 'heading', text: 'Tables' },
      { type: 'bullets', items: [
        'users — id, username (unique), email (unique), password_hash, created_at',
        'todo_panels — id, user_id (FK → users), panel_name, content (JSONB), panel_order, created_at',
        'user_preferences — id, user_id (UNIQUE FK → users), dark_mode (bool, default FALSE), created_at, updated_at',
      ]},
      { type: 'heading', text: 'Key design decisions' },
      { type: 'bullets', items: [
        'ON DELETE CASCADE on todo_panels and user_preferences — deleting a user removes all their data automatically.',
        'panel_order is per-user (not global) and auto-incremented on each new panel via MAX(panel_order) + 1.',
        'user_preferences uses ON CONFLICT (user_id) DO UPDATE for safe upsert — idempotent and crash-safe.',
        'All CREATE TABLE statements use IF NOT EXISTS — setup.sql is safe to re-run and is used directly by CI.',
      ]},
      { type: 'heading', text: 'Auto-migration on startup' },
      { type: 'para',    text: 'server.js calls migrate() before starting the HTTP listener. migrate() reads setup.sql and runs it against the database. New tables or columns are created on first start after a schema change — no manual migration step required.' },
      { type: 'code',    text: '// server.js\nasync function migrate() {\n  const sql = fs.readFileSync(path.join(__dirname, \'setup.sql\'), \'utf8\');\n  await pool.query(sql);\n}\nmigrate().then(() => app.listen(PORT)).catch(err => process.exit(1));' },
    ],
  },
  {
    title:      'Running the Tests',
    brief:      'Jest API tests, Playwright E2E tests, and PDF reports',
    badge:      'TESTING',
    badgeColor: GREEN,
    body: [
      { type: 'heading', text: 'Why automated tests?' },
      { type: 'para',    text: '77 automated tests verify every feature works correctly. A failing test tells you exactly what broke and where — instantly, without manual clicking.' },
      { type: 'heading', text: 'Jest — API tests (46 tests)' },
      { type: 'para',    text: 'Jest uses supertest to call the Express API directly — no browser. It covers registration, login, logout, the /me endpoint, all panel CRUD operations, and user preferences.' },
      { type: 'code',    text: 'npm test\n# PDF report → Alans_to_do_list_JestTest/' },
      { type: 'heading', text: 'Playwright — browser E2E tests (31 tests)' },
      { type: 'para',    text: 'Playwright controls a real Chromium browser. It clicks through registration, login, sign-out, panel create/save/cancel/delete, accordion toggle, dark mode toggle, theme switching, and preference persistence.' },
      { type: 'code',    text: 'npm run test:e2e\n# PDF report → Alans_to_do_list_PlaywrightTest/' },
      { type: 'heading', text: 'Run everything at once' },
      { type: 'code',    text: 'npm run test:all    # Jest first, then Playwright' },
      { type: 'heading', text: 'PDF reports' },
      { type: 'para',    text: 'Custom reporters in reports/jestReporter.js and reports/playwrightReporter.js auto-generate a PDF after each run. The PDF lists every test with a plain-English description and its pass/fail status.' },
      { type: 'info',    text: 'The test database (alans_todo_test) is wiped between runs using TRUNCATE ... CASCADE. Neither Jest nor Playwright requires the app server to be running — each manages its own environment.' },
    ],
  },
  {
    title:      'Architecture & API Routes',
    brief:      'Express app structure, auth middleware, and all endpoints',
    badge:      'ARCH',
    badgeColor: BLUE,
    body: [
      { type: 'heading', text: 'App structure' },
      { type: 'para',    text: 'server.js is the entry point — it imports app.js and starts the HTTP listener. app.js mounts middleware and all route files. Routes live in routes/ and are kept thin: they validate input, call the database, and return JSON.' },
      { type: 'heading', text: 'Auth middleware (middleware/auth.js)' },
      { type: 'para',    text: 'requireAuth reads the JWT from the httpOnly cookie, verifies it with JWT_SECRET, and attaches req.userId. All protected routes use this middleware. An invalid or missing token returns 401.' },
      { type: 'heading', text: 'API endpoints' },
      { type: 'bullets', items: [
        'POST /api/auth/register      — creates user + preferences row, returns 201',
        'POST /api/auth/login         — verifies credentials, sets JWT cookie, returns 200',
        'POST /api/auth/logout        — clears JWT cookie, returns 200',
        'GET  /api/auth/me      [auth] — returns { username, email } for the caller',
        'GET  /api/panels       [auth] — returns caller\'s panels ordered by panel_order asc',
        'POST /api/panels       [auth] — creates panel, auto-increments panel_order per user',
        'PUT  /api/panels/:id   [auth] — updates content/name (ownership-checked, 404 if not owner)',
        'DEL  /api/panels/:id   [auth] — deletes panel (ownership-checked, 404 if not owner)',
        'GET  /api/users/preferences  [auth] — returns { dark_mode: bool }',
        'PATCH /api/users/preferences [auth] — updates dark_mode (boolean only), upserts row',
      ]},
      { type: 'tip',     text: 'Panel routes return 404 (not 403) when a user tries to access another user\'s panel. This intentionally reveals nothing about whether the panel exists — protecting data privacy.' },
    ],
  },
  {
    title:      'Dark Mode Feature',
    brief:      'End-to-end walkthrough of the theme toggle implementation',
    badge:      'DARK MODE',
    badgeColor: PURPLE,
    body: [
      { type: 'heading', text: 'Why this is a useful reference' },
      { type: 'para',    text: 'Dark mode touches every layer of the stack: database column, API endpoint, frontend JS, CSS custom properties, and Playwright tests. Understanding it end-to-end is a good model for any full-stack feature.' },
      { type: 'heading', text: 'Backend (database + API)' },
      { type: 'bullets', items: [
        'user_preferences.dark_mode: BOOLEAN DEFAULT FALSE — one row per user, auto-created at registration.',
        'GET /api/users/preferences returns { dark_mode: bool }.',
        'PATCH /api/users/preferences: validates that dark_mode is a boolean, then upserts with ON CONFLICT.',
      ]},
      { type: 'heading', text: 'Frontend — public/app.js' },
      { type: 'bullets', items: [
        'On DOMContentLoaded: fetch GET /api/users/preferences → call applyTheme(dark_mode) before rendering panels.',
        'applyTheme(bool): sets document.documentElement.setAttribute(\'data-theme\', dark ? \'dark\' : \'light\') and syncs the checkbox.',
        'Toggle change event: calls PATCH /api/users/preferences with { dark_mode: checked }.',
        'Sign-out handler: calls applyTheme(false) to reset the theme before redirecting.',
      ]},
      { type: 'heading', text: 'CSS — public/styles.css' },
      { type: 'bullets', items: [
        ':root defines all light-mode custom properties (--bg, --text, --panel-bg, --border, etc.).',
        '[data-theme="dark"] overrides those properties with dark-mode values.',
        'body, .panel, .accordion-item have transition: background-color 250ms ease, color 250ms ease for smooth switching.',
      ]},
      { type: 'info',    text: 'Playwright gotcha: click .toggle-track (the label), never checkbox.check(). The label covers the hidden checkbox and intercepts pointer events. Also: use waitForLoadState(\'networkidle\') in beforeEach to let the preferences fetch complete before test interactions.' },
    ],
  },
  {
    title:      'CI/CD with GitHub Actions',
    brief:      'Automated testing on every push and PR',
    badge:      'CI/CD',
    badgeColor: GREEN,
    body: [
      { type: 'heading', text: 'Why CI matters' },
      { type: 'para',    text: 'The CI pipeline runs all 77 tests automatically on every push and pull request to main. Bugs are caught before they reach production, and the main branch is always in a known-good state.' },
      { type: 'heading', text: 'Workflow: .github/workflows/ci.yml' },
      { type: 'bullets', items: [
        'Trigger: push or pull_request targeting main',
        'Runner: ubuntu-latest',
        'Service: postgres:17  (password=postgres, db=alans_todo_test, port 5432, health-checked)',
        'Steps: checkout → Node.js 20 → npm ci → playwright install chromium → psql setup.sql → npm test → npm run test:e2e',
        'Artifacts: Jest PDF + Playwright PDF (uploaded even on failure, kept 30 days)',
      ]},
      { type: 'heading', text: 'Required GitHub Secrets' },
      { type: 'bullets', items: [
        'TEST_DATABASE_URL = postgresql://postgres:postgres@localhost:5432/alans_todo_test',
        'JWT_SECRET = any long random string (does not need to match your local .env)',
      ]},
      { type: 'heading', text: 'Branch protection' },
      { type: 'para',    text: 'The "Protect main" ruleset requires the "test" CI check to pass before any PR can be merged. Force pushes to main are also blocked.' },
      { type: 'tip',     text: 'Always work on a feature branch, open a PR, and merge only after CI passes. This is enforced by branch protection — direct pushes to main are blocked.' },
    ],
  },
  {
    title:      'Deploying to Railway',
    brief:      'Getting the app live on the internet',
    badge:      'DEPLOY',
    badgeColor: BLUE,
    body: [
      { type: 'heading', text: 'Why Railway?' },
      { type: 'para',    text: 'Railway auto-detects Node.js, builds with Nixpacks, and provides a managed PostgreSQL database with a single click. You get an HTTPS URL and zero server management — ideal for side projects.' },
      { type: 'heading', text: 'Setup steps' },
      { type: 'steps',   items: [
        'Create a free account at railway.app and connect your GitHub account.',
        'Create a new project → "Deploy from GitHub repo" → select your repository.',
        'Railway detects Node.js and uses the startCommand from railway.toml (node server.js).',
        'Add PostgreSQL: click "+ New" → "Database" → "Add PostgreSQL".',
        'In your app service Variables tab, add DATABASE_URL = ${{Postgres.DATABASE_URL}} — this references the managed plugin.',
        'Add JWT_SECRET (a long random string) and NODE_ENV=production.',
        'Railway auto-deploys. Note your public HTTPS URL.',
      ]},
      { type: 'heading', text: 'railway.toml' },
      { type: 'code',    text: '[build]\nbuilder = "nixpacks"\n\n[deploy]\nstartCommand = "node server.js"\nrestartPolicyType = "on_failure"\nrestartPolicyMaxRetries = 3' },
      { type: 'heading', text: 'SSL and auto-migration' },
      { type: 'para',    text: 'In production, PostgreSQL requires SSL. db.js detects NODE_ENV=production and sets ssl: { rejectUnauthorized: false }. The auto-migration in server.js runs setup.sql on every start — all tables are created the first time the app boots on Railway.' },
      { type: 'tip',     text: 'If the deployment crashes, check Railway logs first. The most common issue is a wrong DATABASE_URL — make sure you used ${{Postgres.DATABASE_URL}} (with double braces), not a hardcoded string.' },
    ],
  },
];

// ===========================================================================
// SHARED PDF DRAWING HELPERS
// ===========================================================================

function pdfCoverPage(doc, { title, subtitle, tagline, color, sections }) {
  // Header band
  doc.rect(0, 0, PAGE_W, 155).fill(NAVY);
  doc.rect(0, 0, 8, 155).fill(color);

  doc.font('Helvetica-Bold').fontSize(28).fillColor('#ffffff')
     .text(title, MARGIN, 28, { width: CONTENT_W });

  doc.font('Helvetica').fontSize(16).fillColor(LIGHT_SLATE)
     .text(subtitle, MARGIN, 74, { width: CONTENT_W, lineBreak: false });

  doc.rect(MARGIN, 100, CONTENT_W, 1).fill('#334155');

  doc.font('Helvetica-Oblique').fontSize(10.5).fillColor(SLATE)
     .text(tagline, MARGIN, 116, { width: CONTENT_W, lineBreak: false });

  // Contents table
  let y = 188;
  doc.font('Helvetica-Bold').fontSize(12).fillColor(TEXT_DARK)
     .text('Contents', MARGIN, y);
  y = doc.y + 10;

  sections.forEach((s, i) => {
    const rowBg = i % 2 === 0 ? '#f8fafc' : '#ffffff';
    doc.rect(MARGIN, y, CONTENT_W, 34).fill(rowBg);
    doc.rect(MARGIN, y, 4, 34).fill(color);

    // Page number pill
    doc.roundedRect(MARGIN + 12, y + 8, 18, 18, 4).fill(color);
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff')
       .text(String(i + 2), MARGIN + 12, y + 12, { width: 18, align: 'center', lineBreak: false });

    doc.font('Helvetica-Bold').fontSize(11).fillColor(TEXT_DARK)
       .text(s.title, MARGIN + 38, y + 4, { lineBreak: false });
    doc.font('Helvetica').fontSize(9).fillColor(TEXT_LIGHT)
       .text(s.brief, MARGIN + 38, y + 19, { width: CONTENT_W - 42, lineBreak: false });
    y += 34;
  });

  // Footer
  const dateStr = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.font('Helvetica').fontSize(9).fillColor('#cbd5e1')
     .text("Alan's To Do List  ·  " + dateStr,
       0, PAGE_H - 28, { width: PAGE_W, align: 'center', lineBreak: false });
}

function pdfSectionPage(doc, { title, badge, badgeColor, body, pageNum, totalPages }) {
  // ── Header ──────────────────────────────────────────────────────────────
  doc.rect(0, 0, PAGE_W, 74).fill(NAVY);
  doc.rect(0, 0, 6, 74).fill(badgeColor);

  const bw = badge.length * 6 + 18;
  doc.roundedRect(MARGIN, 13, bw, 16, 3).fill(badgeColor);
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff')
     .text(badge, MARGIN, 17, { width: bw, align: 'center', lineBreak: false });

  doc.font('Helvetica-Bold').fontSize(20).fillColor('#ffffff')
     .text(title, MARGIN + bw + 10, 10, { lineBreak: false });

  // ── Body content ────────────────────────────────────────────────────────
  let y = 90;

  for (const item of body) {
    if (y > PAGE_H - 70) break;   // safety guard

    switch (item.type) {
      case 'heading':
        if (y > PAGE_H - 90) break;
        doc.rect(MARGIN, y, 4, 16).fill(badgeColor);
        doc.font('Helvetica-Bold').fontSize(11.5).fillColor(TEXT_DARK)
           .text(item.text, MARGIN + 12, y + 2, { width: CONTENT_W - 12, lineBreak: false });
        y += 24;
        break;

      case 'para': {
        const h = doc.font('Helvetica').fontSize(10.5)
                     .heightOfString(item.text, { width: CONTENT_W, lineGap: 3 });
        doc.font('Helvetica').fontSize(10.5).fillColor(TEXT_MED)
           .text(item.text, MARGIN, y, { width: CONTENT_W, lineGap: 3 });
        y = doc.y + 12;
        break;
      }

      case 'bullets':
        item.items.forEach(b => {
          if (y > PAGE_H - 70) return;
          const h = doc.font('Helvetica').fontSize(10)
                       .heightOfString(b, { width: CONTENT_W - 22, lineGap: 2 });
          doc.roundedRect(MARGIN + 3, y + 5, 5, 5, 1).fill(badgeColor);
          doc.font('Helvetica').fontSize(10).fillColor(TEXT_MED)
             .text(b, MARGIN + 16, y, { width: CONTENT_W - 16, lineGap: 2 });
          y += Math.max(15, h) + 6;
        });
        y += 4;
        break;

      case 'steps':
        item.items.forEach((s, i) => {
          if (y > PAGE_H - 70) return;
          doc.circle(MARGIN + 9, y + 9, 9).fill(badgeColor);
          doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff')
             .text(String(i + 1), MARGIN + 5, y + 5, { width: 9, align: 'center', lineBreak: false });
          const h = doc.font('Helvetica').fontSize(10)
                       .heightOfString(s, { width: CONTENT_W - 28, lineGap: 2 });
          doc.font('Helvetica').fontSize(10).fillColor(TEXT_MED)
             .text(s, MARGIN + 26, y, { width: CONTENT_W - 28, lineGap: 2 });
          y += Math.max(18, h) + 7;
        });
        y += 4;
        break;

      case 'code': {
        const lines = item.text.split('\n');
        const BOX_H = lines.length * 14 + 18;
        if (y + BOX_H > PAGE_H - 70) break;
        doc.rect(MARGIN, y, CONTENT_W, BOX_H).fill(CODE_BG);
        doc.font('Courier').fontSize(8.5).fillColor('#e2e8f0');
        lines.forEach((line, i) => {
          doc.text(line || ' ', MARGIN + 14, y + 9 + i * 14, { lineBreak: false });
        });
        y += BOX_H + 10;
        break;
      }

      case 'info': {
        const h = doc.font('Helvetica').fontSize(10)
                     .heightOfString(item.text, { width: CONTENT_W - 26, lineGap: 2 });
        const BOX_H = Math.max(34, h + 18);
        if (y + BOX_H > PAGE_H - 70) break;
        doc.rect(MARGIN, y, CONTENT_W, BOX_H).fill(BLUE_BG);
        doc.rect(MARGIN, y, 4, BOX_H).fill(BLUE);
        doc.font('Helvetica').fontSize(10).fillColor(TEXT_MED)
           .text(item.text, MARGIN + 14, y + 9, { width: CONTENT_W - 20, lineGap: 2 });
        y += BOX_H + 10;
        break;
      }

      case 'tip': {
        const h = doc.font('Helvetica').fontSize(10)
                     .heightOfString(item.text, { width: CONTENT_W - 26, lineGap: 2 });
        const BOX_H = Math.max(34, h + 18);
        if (y + BOX_H > PAGE_H - 70) break;
        doc.rect(MARGIN, y, CONTENT_W, BOX_H).fill(WARN_BG);
        doc.rect(MARGIN, y, 4, BOX_H).fill(WARN_BORDER);
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor(WARN_BORDER)
           .text('TIP', MARGIN + 14, y + 6, { lineBreak: false });
        doc.font('Helvetica').fontSize(10).fillColor(WARN_TEXT)
           .text(item.text, MARGIN + 14, y + 18, { width: CONTENT_W - 20, lineGap: 2 });
        y += BOX_H + 10;
        break;
      }
    }
  }

  // ── Page number ──────────────────────────────────────────────────────────
  doc.font('Helvetica').fontSize(8).fillColor('#cbd5e1')
     .text(`${pageNum} / ${totalPages}`,
       0, PAGE_H - 28, { width: PAGE_W, align: 'center', lineBreak: false });
}

// ===========================================================================
// PDF GENERATION
// ===========================================================================

function generateUserGuidePDF() {
  const outPath = path.join(OUTPUT_DIR, 'User_Guide.pdf');
  const doc     = new PDFDocument({ size: 'A4', margin: 0 });
  const stream  = fs.createWriteStream(outPath);
  doc.pipe(stream);

  const total = USER_GUIDE_SECTIONS.length + 1;

  pdfCoverPage(doc, {
    title:    "Alan's To Do List",
    subtitle: 'User Guide',
    tagline:  'Everything you need to know to use the app',
    color:    BLUE,
    sections: USER_GUIDE_SECTIONS,
  });

  USER_GUIDE_SECTIONS.forEach((section, i) => {
    doc.addPage();
    pdfSectionPage(doc, { ...section, pageNum: i + 2, totalPages: total });
  });

  stream.on('finish', () => console.log('✅  User_Guide.pdf           → ' + outPath));
  doc.end();
}

function generateDeveloperTutorialPDF() {
  const outPath = path.join(OUTPUT_DIR, 'Developer_Tutorial.pdf');
  const doc     = new PDFDocument({ size: 'A4', margin: 0 });
  const stream  = fs.createWriteStream(outPath);
  doc.pipe(stream);

  const total = DEV_TUTORIAL_SECTIONS.length + 1;

  pdfCoverPage(doc, {
    title:    "Alan's To Do List",
    subtitle: 'Developer Tutorial',
    tagline:  'From local setup to live deployment — everything a developer needs to know',
    color:    GREEN,
    sections: DEV_TUTORIAL_SECTIONS,
  });

  DEV_TUTORIAL_SECTIONS.forEach((section, i) => {
    doc.addPage();
    pdfSectionPage(doc, { ...section, pageNum: i + 2, totalPages: total });
  });

  stream.on('finish', () => console.log('✅  Developer_Tutorial.pdf   → ' + outPath));
  doc.end();
}

// ===========================================================================
// DOCX HELPERS
// ===========================================================================

function dHeading1(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 36, color: '1e293b' })],
    spacing:  { before: 400, after: 120 },
  });
}

function dHeading2(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, color: '2563eb' })],
    spacing:  { before: 280, after: 80 },
  });
}

function dPara(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, color: '475569' })],
    spacing:  { after: 120 },
  });
}

function dBullet(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, color: '475569' })],
    bullet:   { level: 0 },
    spacing:  { after: 60 },
  });
}

function dStep(n, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${n}.  `, bold: true, size: 22, color: '1e293b' }),
      new TextRun({ text, size: 22, color: '475569' }),
    ],
    spacing: { after: 80 },
    indent:  { left: 360 },
  });
}

function dCode(text) {
  return text.split('\n').map(line =>
    new Paragraph({
      children: [new TextRun({ text: line || ' ', font: 'Courier New', size: 18, color: '334155' })],
      spacing:  { after: 0 },
    })
  );
}

function dInfo(text) {
  return new Paragraph({
    children: [
      new TextRun({ text: 'ℹ  Note: ', bold: true, size: 20, color: '2563eb' }),
      new TextRun({ text, size: 20, italics: true, color: '334155' }),
    ],
    spacing: { before: 100, after: 100 },
    indent:  { left: 180, right: 180 },
  });
}

function dTip(text) {
  return new Paragraph({
    children: [
      new TextRun({ text: '💡 Tip: ', bold: true, size: 20, color: 'b45309' }),
      new TextRun({ text, size: 20, color: '78350f' }),
    ],
    spacing: { before: 100, after: 100 },
    indent:  { left: 180, right: 180 },
  });
}

function dSpacer() {
  return new Paragraph({ text: '', spacing: { after: 100 } });
}

function sectionToDocxParagraphs(section) {
  const paras = [dHeading1(section.title)];

  for (const item of section.body) {
    switch (item.type) {
      case 'heading':
        paras.push(dHeading2(item.text));
        break;
      case 'para':
        paras.push(dPara(item.text));
        break;
      case 'bullets':
        item.items.forEach(b => paras.push(dBullet(b)));
        paras.push(dSpacer());
        break;
      case 'steps':
        item.items.forEach((s, i) => paras.push(dStep(i + 1, s)));
        paras.push(dSpacer());
        break;
      case 'code':
        paras.push(...dCode(item.text));
        paras.push(dSpacer());
        break;
      case 'info':
        paras.push(dInfo(item.text));
        break;
      case 'tip':
        paras.push(dTip(item.text));
        break;
    }
  }

  // Page break after each section
  paras.push(new Paragraph({
    children: [new TextRun({ text: '', break: 1 })],
  }));

  return paras;
}

// ===========================================================================
// DOCX GENERATION
// ===========================================================================

async function generateUserGuideDocx() {
  const outPath = path.join(OUTPUT_DIR, 'User_Guide.docx');

  const children = [
    new Paragraph({
      children: [new TextRun({ text: "Alan's To Do List — User Guide", bold: true, size: 48, color: '1e293b' })],
      alignment: AlignmentType.CENTER,
      spacing:   { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Everything you need to know to use the app', size: 26, italics: true, color: '64748b' })],
      alignment: AlignmentType.CENTER,
      spacing:   { after: 600 },
    }),
    ...USER_GUIDE_SECTIONS.flatMap(s => sectionToDocxParagraphs(s)),
  ];

  const doc    = new Document({ sections: [{ properties: {}, children }] });
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);
  console.log('✅  User_Guide.docx          → ' + outPath);
}

async function generateDeveloperTutorialDocx() {
  const outPath = path.join(OUTPUT_DIR, 'Developer_Tutorial.docx');

  const children = [
    new Paragraph({
      children: [new TextRun({ text: "Alan's To Do List — Developer Tutorial", bold: true, size: 48, color: '1e293b' })],
      alignment: AlignmentType.CENTER,
      spacing:   { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'From local setup to live deployment', size: 26, italics: true, color: '64748b' })],
      alignment: AlignmentType.CENTER,
      spacing:   { after: 600 },
    }),
    ...DEV_TUTORIAL_SECTIONS.flatMap(s => sectionToDocxParagraphs(s)),
  ];

  const doc    = new Document({ sections: [{ properties: {}, children }] });
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);
  console.log('✅  Developer_Tutorial.docx  → ' + outPath);
}

// ===========================================================================
// MAIN
// ===========================================================================

async function main() {
  console.log('\n📄  Generating documentation...\n');
  generateUserGuidePDF();
  generateDeveloperTutorialPDF();
  await generateUserGuideDocx();
  await generateDeveloperTutorialDocx();
  console.log('\n🎉  All 4 documents saved to: ' + OUTPUT_DIR + '\n');
}

main().catch(err => { console.error(err); process.exit(1); });
