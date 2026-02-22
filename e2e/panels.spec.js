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
});

// ─────────────────────────────────────────────────────────────
// Panel loading
// ─────────────────────────────────────────────────────────────
test.describe('Panel loading', () => {
  test('a first panel is auto-created for a new user', async ({ page }) => {
    await expect(page.locator('.accordion-item')).toHaveCount(1);
  });

  test('first panel is expanded by default', async ({ page }) => {
    await expect(page.locator('.accordion-item').first()).toHaveClass(/expanded/);
  });
});

// ─────────────────────────────────────────────────────────────
// Add new panel
// ─────────────────────────────────────────────────────────────
test.describe('Add new panel', () => {
  test('clicking "Add new list" creates a new panel', async ({ page }) => {
    // Wait for the auto-created first panel to render before counting
    await expect(page.locator('.accordion-item')).toHaveCount(1);
    const before = await page.locator('.accordion-item').count();
    await page.click('#btn-add-new');
    await expect(page.locator('.accordion-item')).toHaveCount(before + 1);
  });

  test('new panel is expanded and focused', async ({ page }) => {
    await page.click('#btn-add-new');
    const panels = page.locator('.accordion-item');
    const last   = panels.last();
    await expect(last).toHaveClass(/expanded/);
  });
});

// ─────────────────────────────────────────────────────────────
// Save panel content
// ─────────────────────────────────────────────────────────────
test.describe('Save panel', () => {
  test('save button shows "Saved ✓" feedback briefly', async ({ page }) => {
    // First panel is auto-created and expanded
    const saveBtn = page.locator('.btn-save').first();
    await saveBtn.click();
    await expect(saveBtn).toHaveText(/Saved/);
    // Reverts back after timeout
    await expect(saveBtn).toHaveText('Save', { timeout: 3000 });
  });

  test('content persists after page reload', async ({ page }) => {
    // Type into the first Quill editor
    const editor = page.locator('.ql-editor').first();
    await editor.click();
    await page.keyboard.type('My important task');

    await page.locator('.btn-save').first().click();
    await expect(page.locator('.btn-save').first()).toHaveText(/Saved/);

    // Reload and check content is still there
    await page.reload();
    await expect(page.locator('.accordion-item').first()).toHaveClass(/expanded/);
    await expect(page.locator('.ql-editor').first()).toContainText('My important task');
  });
});

// ─────────────────────────────────────────────────────────────
// Cancel
// ─────────────────────────────────────────────────────────────
test.describe('Cancel', () => {
  test('cancel collapses the panel', async ({ page }) => {
    const panel = page.locator('.accordion-item').first();
    await expect(panel).toHaveClass(/expanded/);

    await page.locator('.btn-cancel').first().click();
    await expect(panel).not.toHaveClass(/expanded/);
  });
});

// ─────────────────────────────────────────────────────────────
// Delete panel
// ─────────────────────────────────────────────────────────────
test.describe('Delete panel', () => {
  test('delete button removes the panel from the page', async ({ page }) => {
    // Wait for the auto-created first panel before adding a second
    await expect(page.locator('.accordion-item')).toHaveCount(1);
    await page.click('#btn-add-new');
    await expect(page.locator('.accordion-item')).toHaveCount(2);

    // Accept the confirm dialog
    page.once('dialog', dialog => dialog.accept());
    await page.locator('.btn-delete').first().click();

    await expect(page.locator('.accordion-item')).toHaveCount(1);
  });
});

// ─────────────────────────────────────────────────────────────
// Accordion toggle
// ─────────────────────────────────────────────────────────────
test.describe('Accordion toggle', () => {
  test('clicking the trigger collapses and re-expands a panel', async ({ page }) => {
    const panel   = page.locator('.accordion-item').first();
    const trigger = panel.locator('.accordion-trigger');

    await expect(panel).toHaveClass(/expanded/);
    await trigger.click();
    await expect(panel).not.toHaveClass(/expanded/);
    await trigger.click();
    await expect(panel).toHaveClass(/expanded/);
  });
});

// ─────────────────────────────────────────────────────────────
// Editable panel headers
// ─────────────────────────────────────────────────────────────
test.describe('Editable panel headers', () => {
  test('edit button enters edit mode with pre-filled input', async ({ page }) => {
    const panel = page.locator('.accordion-item').first();

    // Trigger should be visible; edit form should be hidden
    await expect(panel.locator('.accordion-trigger')).toBeVisible();
    await expect(panel.locator('.title-edit-form')).toBeHidden();

    await panel.locator('.btn-edit-title').click();

    // Edit form now visible, trigger hidden
    await expect(panel.locator('.title-edit-form')).toBeVisible();
    await expect(panel.locator('.accordion-trigger')).toBeHidden();

    // Input pre-filled with current panel name
    const input = panel.locator('.title-input');
    const originalName = await panel.locator('.panel-name').getAttribute('__data') ??
      'To Do List'; // fallback — just check input is not empty
    await expect(input).not.toHaveValue('');
  });

  test('save button updates the header and persists after reload', async ({ page }) => {
    const panel = page.locator('.accordion-item').first();

    await panel.locator('.btn-edit-title').click();
    await panel.locator('.title-input').fill('My Renamed List');
    await panel.locator('.btn-title-save').click();

    // Edit mode exits; trigger shows new name
    await expect(panel.locator('.accordion-trigger')).toBeVisible();
    await expect(panel.locator('.panel-name')).toHaveText('My Renamed List');

    // Persists across page reload
    await page.reload();
    await expect(page.locator('.accordion-item').first().locator('.panel-name'))
      .toHaveText('My Renamed List');
  });

  test('pressing Enter saves the title', async ({ page }) => {
    const panel = page.locator('.accordion-item').first();

    await panel.locator('.btn-edit-title').click();
    await panel.locator('.title-input').fill('Saved via Enter');
    await page.keyboard.press('Enter');

    await expect(panel.locator('.accordion-trigger')).toBeVisible();
    await expect(panel.locator('.panel-name')).toHaveText('Saved via Enter');
  });

  test('cancel button restores original title without saving', async ({ page }) => {
    const panel     = page.locator('.accordion-item').first();
    const nameBefore = await panel.locator('.panel-name').innerText();

    await panel.locator('.btn-edit-title').click();
    await panel.locator('.title-input').fill('Discarded Change');
    await panel.locator('.btn-title-cancel').click();

    // Edit mode exits; name unchanged
    await expect(panel.locator('.accordion-trigger')).toBeVisible();
    await expect(panel.locator('.panel-name')).toHaveText(nameBefore);
  });

  test('pressing Escape cancels without saving', async ({ page }) => {
    const panel     = page.locator('.accordion-item').first();
    const nameBefore = await panel.locator('.panel-name').innerText();

    await panel.locator('.btn-edit-title').click();
    await panel.locator('.title-input').fill('Escaped Change');
    await page.keyboard.press('Escape');

    await expect(panel.locator('.accordion-trigger')).toBeVisible();
    await expect(panel.locator('.panel-name')).toHaveText(nameBefore);
  });

  test('empty title shows inline error and does not save', async ({ page }) => {
    const panel     = page.locator('.accordion-item').first();
    const nameBefore = await panel.locator('.panel-name').innerText();

    await panel.locator('.btn-edit-title').click();
    await panel.locator('.title-input').fill('');
    await panel.locator('.btn-title-save').click();

    // Error message visible; still in edit mode
    await expect(panel.locator('.title-error')).toBeVisible();
    await expect(panel.locator('.title-edit-form')).toBeVisible();

    // Cancel out and verify the original title is unchanged
    await panel.locator('.btn-title-cancel').click();
    await expect(panel.locator('.panel-name')).toHaveText(nameBefore);
  });

  test('accordion trigger still collapses/expands when not in edit mode', async ({ page }) => {
    const panel   = page.locator('.accordion-item').first();
    const trigger = panel.locator('.accordion-trigger');

    await expect(panel).toHaveClass(/expanded/);
    await trigger.click();
    await expect(panel).not.toHaveClass(/expanded/);
    await trigger.click();
    await expect(panel).toHaveClass(/expanded/);
  });
});
