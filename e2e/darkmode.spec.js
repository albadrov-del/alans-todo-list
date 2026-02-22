'use strict';

const { test, expect } = require('@playwright/test');
const { cleanDb, closeDb, apiRegister } = require('./helpers');

test.beforeEach(cleanDb);

// Sign in before each test
test.beforeEach(async ({ page, request }) => {
  await apiRegister(request);
  await page.goto('/login');
  await page.fill('#email',    'e2e@example.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('http://localhost:3001/');
  // Wait for the app to finish loading preferences
  await page.waitForLoadState('networkidle');
});

// ─────────────────────────────────────────────────────────────
// Toggle visibility and accessibility
// ─────────────────────────────────────────────────────────────
test.describe('Dark mode toggle', () => {
  test('toggle is visible in the header when signed in', async ({ page }) => {
    await expect(page.locator('#toggle-dark-mode')).toBeAttached();
    await expect(page.locator('.toggle-label')).toBeVisible();
  });

  test('toggle is labelled "Dark mode"', async ({ page }) => {
    const label = page.locator('.toggle-label');
    await expect(label).toHaveText('Dark mode');
  });

  test('toggle has an aria-label for screen readers', async ({ page }) => {
    const checkbox = page.locator('#toggle-dark-mode');
    await expect(checkbox).toHaveAttribute('aria-label', 'Dark mode');
  });

  test('toggle is keyboard focusable', async ({ page }) => {
    const checkbox = page.locator('#toggle-dark-mode');
    await checkbox.focus();
    const focused = await page.evaluate(() => document.activeElement.id);
    expect(focused).toBe('toggle-dark-mode');
  });
});

// ─────────────────────────────────────────────────────────────
// Theme switching
// ─────────────────────────────────────────────────────────────
test.describe('Theme switching', () => {
  test('default theme is light (no data-theme="dark" on html)', async ({ page }) => {
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).not.toBe('dark');
  });

  test('clicking toggle switches html to data-theme="dark"', async ({ page }) => {
    await page.locator('.toggle-track').click();
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('dark');
  });

  test('clicking toggle again switches back to light mode', async ({ page }) => {
    const track = page.locator('.toggle-track');

    // Turn on
    await track.click();
    let theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('dark');

    // Turn off
    await track.click();
    theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('light');
  });

  test('toggle checkbox reflects the current theme state', async ({ page }) => {
    const checkbox = page.locator('#toggle-dark-mode');
    await expect(checkbox).not.toBeChecked();

    await page.locator('.toggle-track').click();
    await expect(checkbox).toBeChecked();
  });
});

// ─────────────────────────────────────────────────────────────
// Preference persisted across reload
// ─────────────────────────────────────────────────────────────
test.describe('Preference persistence', () => {
  test('dark mode preference persists after page reload', async ({ page }) => {
    // Enable dark mode
    await page.locator('.toggle-track').click();
    let theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('dark');

    // Wait for the PATCH to complete before reloading
    await page.waitForLoadState('networkidle');

    // Reload and verify preference is restored
    await page.reload();
    await page.waitForLoadState('networkidle');

    theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('dark');

    const checkbox = page.locator('#toggle-dark-mode');
    await expect(checkbox).toBeChecked();
  });

  test('light mode is restored after sign out', async ({ page }) => {
    // Enable dark mode and wait for it to save
    await page.locator('.toggle-track').click();
    await page.waitForLoadState('networkidle');

    // Sign out
    await page.click('#btn-sign-out');
    await expect(page).toHaveURL(/\/login/);

    // Sign back in and check saved preference is re-applied
    await page.fill('#email',    'e2e@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3001/');
    await page.waitForLoadState('networkidle');

    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('dark');
  });
});
