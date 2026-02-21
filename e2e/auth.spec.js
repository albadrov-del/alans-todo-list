'use strict';

const { test, expect } = require('@playwright/test');
const { cleanDb, apiRegister } = require('./helpers');

test.beforeEach(cleanDb);

// ─────────────────────────────────────────────────────────────
// Registration flow
// ─────────────────────────────────────────────────────────────
test.describe('Registration', () => {
  test('unauthenticated visit to / redirects to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('register page is accessible at /register', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h2')).toHaveText('Create account');
  });

  test('successful registration redirects to /login with no errors', async ({ page }) => {
    await page.goto('/register');

    await page.fill('#username', 'alantest');
    await page.fill('#email',    'alan@test.com');
    await page.fill('#password', 'password123');
    await page.fill('#confirm-password', 'password123');
    await page.click('button[type="submit"]');

    // Success banner appears
    await expect(page.locator('#auth-success')).toBeVisible();

    // Then redirects to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('shows an error when email is already registered', async ({ page, request }) => {
    await apiRegister(request, { username: 'existing', email: 'taken@test.com' });

    await page.goto('/register');
    await page.fill('#username', 'newuser');
    await page.fill('#email',    'taken@test.com');
    await page.fill('#password', 'password123');
    await page.fill('#confirm-password', 'password123');
    await page.click('button[type="submit"]');

    await expect(page.locator('#auth-error')).toBeVisible();
    await expect(page.locator('#auth-error')).toContainText(/email/i);
  });

  test('shows a client-side error when passwords do not match', async ({ page }) => {
    await page.goto('/register');
    await page.fill('#username', 'alantest');
    await page.fill('#email',    'alan@test.com');
    await page.fill('#password', 'password123');
    await page.fill('#confirm-password', 'different');
    await page.click('button[type="submit"]');

    await expect(page.locator('#confirm-error')).toBeVisible();
    await expect(page.locator('#confirm-error')).toContainText(/match/i);
  });
});

// ─────────────────────────────────────────────────────────────
// Login flow
// ─────────────────────────────────────────────────────────────
test.describe('Login', () => {
  test.beforeEach(async ({ request }) => {
    await apiRegister(request);
  });

  test('login page is accessible at /login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h2')).toHaveText('Sign in');
  });

  test('successful login redirects to the main app', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email',    'e2e@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:3001/', { timeout: 5000 });
    // The username appears in the header
    await expect(page.locator('#user-display')).toHaveText('e2euser');
  });

  test('shows a generic error for wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email',    'e2e@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('#auth-error')).toBeVisible();
    await expect(page.locator('#auth-error')).toContainText('Invalid email or password');
  });

  test('register page has a link to /login', async ({ page }) => {
    await page.goto('/register');
    await page.click('text=Sign in');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page has a link to /register', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Create one');
    await expect(page).toHaveURL(/\/register/);
  });
});

// ─────────────────────────────────────────────────────────────
// Sign out
// ─────────────────────────────────────────────────────────────
test.describe('Sign out', () => {
  test('sign out button redirects to /login', async ({ page, request }) => {
    await apiRegister(request);
    await page.goto('/login');
    await page.fill('#email',    'e2e@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:3001/');
    // Wait for the app JS to finish initialising (sets username after /api/auth/me resolves)
    await expect(page.locator('#user-display')).not.toBeEmpty();

    await page.click('#btn-sign-out');
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('visiting / after sign-out redirects to /login', async ({ page, request }) => {
    await apiRegister(request);
    await page.goto('/login');
    await page.fill('#email',    'e2e@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.locator('#user-display')).not.toBeEmpty(); // wait for JS init
    await page.click('#btn-sign-out');

    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });
});
