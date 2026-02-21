'use strict';

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir:  './e2e',
  timeout:  30_000,
  retries:  0,
  workers:  1,        // run serially — tests share a DB
  reporter: [
    ['list'],
    ['./reports/playwrightReporter.js'],
  ],

  use: {
    baseURL:    'http://localhost:3001',
    headless:   true,
    screenshot: 'only-on-failure',
  },

  // Spin up a dedicated test server before E2E tests start
  webServer: {
    command:             'cross-env NODE_ENV=test PORT=3001 node server.js',
    url:                 'http://localhost:3001',
    timeout:              10_000,
    reuseExistingServer: false,
  },
});
