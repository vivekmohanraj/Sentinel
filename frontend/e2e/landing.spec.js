import { test, expect } from '@playwright/test';

test.describe('Sentinel Landing Page & Authentication Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display Sentinel command branding and hero headline', async ({ page }) => {
    // Check navigation brand
    await expect(page.locator('nav')).toContainText('Sentinel');

    // Check hero headline
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText('Predict the future of your');
    await expect(heroHeading).toContainText('codebase.');

    // Check navigation links
    await expect(page.getByRole('link', { name: 'Intelligence' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Solutions' }).first()).toBeVisible();

    // Capture Landing Page Hero Screenshot
    await page.screenshot({ path: 'test-results/screenshots/01-landing-hero.png', fullPage: true });
  });

  test('should open and close the Sign In authentication modal', async ({ page }) => {
    // Click Sign In button in header
    const signInBtn = page.getByRole('button', { name: 'Sign In' });
    await expect(signInBtn).toBeVisible();
    await signInBtn.click();

    // Verify modal appears with role heading
    const modalHeading = page.getByRole('heading', { name: 'Log in to Sentinel' });
    await expect(modalHeading).toBeVisible();

    // Capture Sign In Modal Screenshot
    await page.screenshot({ path: 'test-results/screenshots/02-auth-signin-modal.png' });

    // Close the modal
    const closeBtn = page.getByLabel('Close authentication modal');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Modal should disappear
    await expect(modalHeading).not.toBeVisible();
  });

  test('should open Sign Up modal and switch between Sign In and Sign Up tabs', async ({ page }) => {
    // Click Get Started button in header
    const getStartedBtn = page.getByRole('button', { name: 'Get Started' });
    await expect(getStartedBtn).toBeVisible();
    await getStartedBtn.click();

    // Verify Create your Sentinel Account heading
    const signUpHeading = page.getByRole('heading', { name: 'Create your Sentinel Account' });
    await expect(signUpHeading).toBeVisible();

    // Capture Sign Up Modal Screenshot
    await page.screenshot({ path: 'test-results/screenshots/03-auth-signup-modal.png' });

    // Switch to Log In tab inside modal using exact name
    const logInTab = page.getByRole('button', { name: 'Log In', exact: true });
    await expect(logInTab).toBeVisible();
    await logInTab.click();

    // Verify Log In view is displayed
    const logInHeading = page.getByRole('heading', { name: 'Log in to Sentinel' });
    await expect(logInHeading).toBeVisible();

    // Switch back to Sign Up tab
    const signUpTab = page.getByRole('button', { name: 'Sign Up', exact: true });
    await expect(signUpTab).toBeVisible();
    await signUpTab.click();
    await expect(signUpHeading).toBeVisible();

    // Close modal
    await page.getByLabel('Close authentication modal').click();
    await expect(signUpHeading).not.toBeVisible();
  });

  test('should open and close the Start Forecasting modal', async ({ page }) => {
    const forecastBtn = page.getByRole('button', { name: 'Start Forecasting' });
    await expect(forecastBtn).toBeVisible();
    await forecastBtn.click();

    // Verify modal overlay or container
    const modalContainer = page.locator('.fixed.inset-0');
    await expect(modalContainer.first()).toBeVisible();

    // Capture Forecasting Modal Screenshot
    await page.screenshot({ path: 'test-results/screenshots/04-forecasting-modal.png' });

    // Press Escape or click close
    await page.keyboard.press('Escape');
  });
});
