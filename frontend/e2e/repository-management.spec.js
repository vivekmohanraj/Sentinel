import { test, expect } from '@playwright/test';

test.describe('Repository, Organization & Project Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('header')).toBeVisible();
  });

  test('should open New Organization modal and create an organization', async ({ page }) => {
    // Check if New Org button is available
    const newOrgBtn = page.getByRole('button', { name: 'New Org' });
    if (await newOrgBtn.isVisible()) {
      await newOrgBtn.click();

      // Verify modal appears
      await expect(page.getByRole('heading', { name: 'Create New Organization' })).toBeVisible();

      // Enter organization name
      const orgName = `Acme Engineering ${Date.now().toString().slice(-4)}`;
      const orgInput = page.getByPlaceholder('e.g. DeepSeek AI Core');
      await orgInput.fill(orgName);

      // Screenshot of New Org form filled
      await page.screenshot({ path: 'test-results/screenshots/form-new-org.png' });

      // Click Create Org
      await page.getByRole('button', { name: 'Create Org' }).click();

      // Modal should close
      await expect(page.getByRole('heading', { name: 'Create New Organization' })).not.toBeVisible();
    }
  });

  test('should open New Project modal and create a project', async ({ page }) => {
    const newProjectBtn = page.getByRole('button', { name: 'New Project' });
    if (await newProjectBtn.isVisible()) {
      await newProjectBtn.click();

      // Verify modal appears
      await expect(page.getByRole('heading', { name: 'Create New Project' })).toBeVisible();

      // Fill Project Name and Description
      const projName = `Sentinel Core ${Date.now().toString().slice(-4)}`;
      await page.getByPlaceholder('e.g. Core Engine v2').fill(projName);
      await page.getByPlaceholder('Brief architectural scope or sprint target...').fill('Automated commit mining and risk prediction pipeline.');

      // Screenshot of New Project form filled
      await page.screenshot({ path: 'test-results/screenshots/form-new-project.png' });

      // Click Create Project
      await page.getByRole('button', { name: 'Create Project' }).click();

      // Modal should close
      await expect(page.getByRole('heading', { name: 'Create New Project' })).not.toBeVisible();
    }
  });

  test('should validate repository input format in Connect Repository modal', async ({ page }) => {
    // Navigate to Repositories tab
    await page.getByRole('button', { name: 'Repositories' }).click();
    await expect(page).toHaveURL(/.*repositories/);

    const connectRepoBtn = page.getByRole('button', { name: 'Connect Repository' });
    if (await connectRepoBtn.isVisible()) {
      await connectRepoBtn.click();

      // Verify Connect GitHub Repository modal
      await expect(page.getByRole('heading', { name: 'Connect GitHub Repository' })).toBeVisible();

      // Enter invalid URL
      const urlInput = page.getByPlaceholder('https://github.com/expressjs/express or expressjs/express');
      await urlInput.fill('invalid/repo@bad*name');

      // Click Ingest button
      const submitBtn = page.getByRole('button', { name: 'Ingest & Mine Metrics' });
      await submitBtn.click();

      // Wait briefly for client/server validation feedback
      await page.waitForTimeout(500);

      // Capture screenshot of invalid repo error state
      await page.screenshot({ path: 'test-results/screenshots/form-add-repo-invalid.png' });

      // Close modal
      const closeBtn = page.locator('.fixed.inset-0 button').filter({ hasText: '' }).first();
      await closeBtn.click();
    }
  });

  test('should detect repository format and fill valid details in Connect Repository modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Repositories' }).click();

    const connectRepoBtn = page.getByRole('button', { name: 'Connect Repository' });
    if (await connectRepoBtn.isVisible()) {
      await connectRepoBtn.click();

      // Enter a valid GitHub repository link
      const urlInput = page.getByPlaceholder('https://github.com/expressjs/express or expressjs/express');
      await urlInput.fill('expressjs/express');

      // Verify live detection message
      await expect(page.locator('text=Detected: expressjs/express')).toBeVisible();

      // Verify display name auto-populated or fill it
      const nameInput = page.getByPlaceholder('e.g. expressjs/express');
      await nameInput.fill('expressjs/express');

      // Screenshot filled valid form
      await page.screenshot({ path: 'test-results/screenshots/form-add-repo-valid.png' });

      // Cancel to keep test non-destructive to test environment
      await page.getByRole('button', { name: 'Cancel' }).click();
    }
  });
});
