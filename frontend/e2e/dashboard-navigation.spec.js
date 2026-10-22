import { test, expect } from '@playwright/test';

test.describe('Sentinel Dashboard Navigation & Analytics Views', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to dashboard
    await page.goto('/dashboard');
    // Ensure dashboard header is visible
    await expect(page.locator('header')).toBeVisible();
  });

  test('should display primary predictive metrics on main Dashboard tab', async ({ page }) => {
    // Check main title on Dashboard view
    await expect(page.locator('header h1')).toContainText('Predictive Command Center');

    // Verify key telemetry KPI labels
    await expect(page.locator('text=MINED COMMITS')).toBeVisible();
    await expect(page.locator('text=LINES ADDED')).toBeVisible();
    await expect(page.locator('text=LINES DELETED')).toBeVisible();
    await expect(page.locator('text=AVG COMPLEXITY')).toBeVisible();
    await expect(page.locator('text=DORA VELOCITY')).toBeVisible();

    // Capture main Dashboard view
    await page.screenshot({ path: 'test-results/screenshots/05-dashboard-command-center.png', fullPage: true });
  });

  test('should navigate to Repositories tab and display repository index', async ({ page }) => {
    await page.getByRole('button', { name: 'Repositories' }).click();
    await expect(page).toHaveURL(/.*repositories/);
    await expect(page.locator('header h1')).toContainText('Repository Graph Index');

    await page.screenshot({ path: 'test-results/screenshots/06-repositories-tab.png', fullPage: true });
  });

  test('should navigate to Commits Log tab and display commit records', async ({ page }) => {
    await page.getByRole('button', { name: 'Commits Log' }).click();
    await expect(page).toHaveURL(/.*commits/);
    await expect(page.locator('header h1')).toContainText('Commit Log & Developer Churn Activity');

    await page.screenshot({ path: 'test-results/screenshots/07-commits-log-tab.png', fullPage: true });
  });

  test('should navigate to Velocity & DORA tab and display delivery metrics', async ({ page }) => {
    await page.getByRole('button', { name: 'Velocity & DORA' }).click();
    await expect(page.locator('header h1')).toContainText('DevOps & Engineering Delivery Velocity (DORA)');

    await page.screenshot({ path: 'test-results/screenshots/08-dora-velocity-tab.png', fullPage: true });
  });

  test('should navigate to Contributors tab and display team analytics', async ({ page }) => {
    await page.getByRole('button', { name: 'Contributors' }).click();
    await expect(page.locator('header h1')).toContainText('Contributor Analytics & Bus Factor Analysis');

    await page.screenshot({ path: 'test-results/screenshots/09-contributors-tab.png', fullPage: true });
  });

  test('should navigate to Risk Radar tab and display telemetry matrix', async ({ page }) => {
    await page.getByRole('button', { name: 'Risk Radar' }).click();
    await expect(page).toHaveURL(/.*risk-radar/);
    await expect(page.locator('header h1')).toContainText('Real-Time Telemetry Matrix');

    await page.screenshot({ path: 'test-results/screenshots/10-risk-radar-tab.png', fullPage: true });
  });

  test('should navigate to Tech Debt tab and display architectural analysis', async ({ page }) => {
    await page.getByRole('button', { name: 'Tech Debt' }).click();
    await expect(page).toHaveURL(/.*tech-debt/);
    await expect(page.locator('header h1')).toContainText('Architectural Degradation Analysis');

    await page.screenshot({ path: 'test-results/screenshots/11-tech-debt-tab.png', fullPage: true });
  });

  test('should navigate to Knowledge Graph tab and display graph topology', async ({ page }) => {
    await page.getByRole('button', { name: 'Knowledge Graph' }).click();
    await expect(page).toHaveURL(/.*knowledge-graph/);
    await expect(page.locator('header h1')).toContainText('Engineering Knowledge Graph');

    await page.screenshot({ path: 'test-results/screenshots/12-knowledge-graph-tab.png', fullPage: true });
  });

  test('should navigate to Settings tab and display profile preferences', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page).toHaveURL(/.*settings/);
    await expect(page.locator('header h1')).toContainText('Profile & Workspace Preferences');

    await page.screenshot({ path: 'test-results/screenshots/13-settings-tab.png', fullPage: true });
  });
});
