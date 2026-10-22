import { test, expect } from '@playwright/test';

test.describe('Sentinel Predictive Analytics Modals & Drawers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('header')).toBeVisible();
  });

  test('should open and close the Pull Request Automated Risk Scanner modal', async ({ page }) => {
    // Click PR Scan button in header
    const prScanBtn = page.getByRole('button', { name: 'PR Scan' });
    await expect(prScanBtn).toBeVisible();
    await prScanBtn.click();

    // Verify modal header appears
    const modalHeading = page.getByRole('heading', { name: 'Pull Request Automated Risk Scanner' });
    await expect(modalHeading).toBeVisible();

    // Verify pre-merge badge inside modal
    await expect(page.getByText('PRE-MERGE', { exact: true })).toBeVisible();

    // Capture PR Risk Scanner Modal Screenshot
    await page.screenshot({ path: 'test-results/screenshots/14-pr-scanner-modal.png' });

    // Close the modal
    const closeBtn = page.locator('.fixed.inset-0 button').filter({ hasText: '' }).first();
    await closeBtn.click();

    // Modal should close
    await expect(modalHeading).not.toBeVisible();
  });

  test('should open and close the Executive Export modal', async ({ page }) => {
    // Click Export button in header
    const exportBtn = page.getByRole('button', { name: 'Export' });
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();

    // Verify modal title
    const exportHeading = page.getByRole('heading', { name: 'Executive Engineering Export Node' });
    await expect(exportHeading).toBeVisible();

    // Capture Executive Export Modal Screenshot
    await page.screenshot({ path: 'test-results/screenshots/15-executive-export-modal.png' });

    // Close modal via Close modal button
    const closeBtn = page.getByTitle('Close modal');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Modal should close
    await expect(exportHeading).not.toBeVisible();
  });

  test('should open and close the System Alerts and Notifications drawer', async ({ page }) => {
    // Click notification bell
    const bellBtn = page.getByTitle('Open System Alerts & Notifications');
    await expect(bellBtn).toBeVisible();
    await bellBtn.click();

    // Verify drawer appears
    const drawerHeading = page.locator('text=System Alerts & Notifications');
    await expect(drawerHeading).toBeVisible();

    // Capture System Alerts Drawer Screenshot
    await page.screenshot({ path: 'test-results/screenshots/16-system-alerts-drawer.png' });

    // Close drawer using close button
    const closeDrawerBtn = page.locator('text=✕');
    await expect(closeDrawerBtn).toBeVisible();
    await closeDrawerBtn.click();

    // Drawer should close
    await expect(drawerHeading).not.toBeVisible();
  });
});
