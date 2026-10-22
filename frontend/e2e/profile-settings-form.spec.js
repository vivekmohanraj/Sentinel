import { test, expect } from '@playwright/test';

test.describe('User Profile & Workspace Settings Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('header')).toBeVisible();
  });

  test('should display Profile Details form with current values', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Profile Details' })).toBeVisible();

    // Verify presence of input fields
    const inputs = page.locator('form input');
    await expect(inputs.first()).toBeVisible();

    // Verify weekly reports and GitHub sync toggles
    await expect(page.getByLabel('Toggle weekly risk reports')).toBeVisible();
    await expect(page.getByLabel('Toggle GitHub synchronization')).toBeVisible();

    await page.screenshot({ path: 'test-results/screenshots/form-settings-loaded.png', fullPage: true });
  });

  test('should modify profile inputs, toggle preferences, and save to PostgreSQL', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Profile Details' })).toBeVisible();

    // Update First Name and Last Name
    const firstNameInput = page.locator('form input[type="text"]').nth(0);
    const lastNameInput = page.locator('form input[type="text"]').nth(1);

    await firstNameInput.fill('Sentinel');
    await lastNameInput.fill('Lead');

    // Toggle weekly reports toggle
    const weeklyToggle = page.getByLabel('Toggle weekly risk reports');
    await weeklyToggle.click();

    // Toggle GitHub synchronization toggle
    const syncToggle = page.getByLabel('Toggle GitHub synchronization');
    await syncToggle.click();

    // Take screenshot of modified form before submitting
    await page.screenshot({ path: 'test-results/screenshots/form-settings-editing.png' });

    // Click Save Changes button
    const saveBtn = page.getByRole('button', { name: 'Save Changes' });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Wait for the PostgreSQL update confirmation banner
    const successBanner = page.locator('text=Preferences saved successfully to PostgreSQL!');
    await expect(successBanner).toBeVisible({ timeout: 10000 });

    // Capture screenshot of successful database save confirmation
    await page.screenshot({ path: 'test-results/screenshots/form-settings-saved.png' });
  });
});
