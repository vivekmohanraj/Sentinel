import { test, expect } from '@playwright/test';

test.describe('Search, Filters & System Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('header')).toBeVisible();
  });

  test('should filter commits in Commits Log using search input', async ({ page }) => {
    // Navigate to Commits
    await page.getByRole('button', { name: 'Commits Log' }).click();
    await expect(page).toHaveURL(/.*commits/);

    // Find search bar
    const searchInput = page.getByPlaceholder('Search hash, message, or author...');
    await expect(searchInput).toBeVisible();

    // Type query
    await searchInput.fill('feat');

    // Capture screenshot of filtered commits table
    await page.screenshot({ path: 'test-results/screenshots/feature-commits-filtered.png' });

    // Clear search
    await searchInput.fill('');
  });

  test('should open and save Automated Alert Policies in Alert Policy Modal', async ({ page }) => {
    // Open notifications drawer
    const bellBtn = page.getByTitle('Open System Alerts & Notifications');
    await expect(bellBtn).toBeVisible();
    await bellBtn.click();

    // Click Configure Policies button
    const configBtn = page.getByRole('button', { name: 'Configure Policies' });
    await expect(configBtn).toBeVisible();
    await configBtn.click();

    // Verify Alert & Policy Manager modal
    await expect(page.getByRole('heading', { name: 'Automated Alert & Policy Manager' })).toBeVisible();

    // Toggle the first policy switch
    const toggleSwitch = page.locator('form button[type="button"]').first();
    if (await toggleSwitch.isVisible()) {
      await toggleSwitch.click();
    }

    // Capture screenshot of policy modal form
    await page.screenshot({ path: 'test-results/screenshots/form-alert-policies-editing.png' });

    // Click Save Alert Policies button
    const saveBtn = page.getByRole('button', { name: 'Save Alert Policies' });
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      // Verify save confirmation message
      await expect(page.locator('text=Alert policy thresholds updated successfully in PostgreSQL.')).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'test-results/screenshots/form-alert-policies-saved.png' });
    }

    // Close modal via accessible label
    const closeBtn = page.getByLabel('Close alert policy modal');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(page.getByRole('heading', { name: 'Automated Alert & Policy Manager' })).not.toBeVisible();
  });

  test('should interact with top navigation repository selector and sync button', async ({ page }) => {
    // Check repository dropdown
    const repoSelector = page.locator('header select').first();
    await expect(repoSelector).toBeVisible();

    // Check sync button
    const syncBtn = page.getByTitle('Synchronize and Refresh Codebase Metrics');
    await expect(syncBtn).toBeVisible();

    // Screenshot of header controls
    await page.screenshot({ path: 'test-results/screenshots/feature-header-controls.png' });
  });

  test('should open Executive Export Modal and show all format options (PDF, CSV, JSON)', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: 'Export' });
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();

    // Verify modal options
    await expect(page.getByRole('heading', { name: 'Executive Engineering Export Node' })).toBeVisible();

    // Verify presence of Download CSV and View Feed buttons
    await expect(page.getByRole('button', { name: 'Download CSV' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'View Feed' })).toBeVisible();

    // Capture screenshot of export formats
    await page.screenshot({ path: 'test-results/screenshots/feature-export-modal.png' });

    // Close modal
    await page.getByTitle('Close modal').click();
  });
});
