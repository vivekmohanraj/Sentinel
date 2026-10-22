import { test, expect } from '@playwright/test';

test.describe('Authentication Forms & Live Validations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should validate required fields on Log In form submission', async ({ page }) => {
    // Open Sign In modal
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('heading', { name: 'Log in to Sentinel' })).toBeVisible();

    // Click Log In button without filling any fields
    const submitBtn = page.locator('form button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify validation error messages
    await expect(page.locator('text=Email address or username is required.')).toBeVisible();
    await expect(page.locator('text=Password is required.')).toBeVisible();

    // Capture screenshot of login validation errors
    await page.screenshot({ path: 'test-results/screenshots/form-login-validation.png' });
  });

  test('should toggle password visibility in Log In form', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Enter sample password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('SecretSentinelPassword99!');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle visibility button
    const toggleBtn = page.getByLabel('Show password');
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    // Password input should now be type="text"
    const visiblePasswordInput = page.locator('input[value="SecretSentinelPassword99!"]');
    await expect(visiblePasswordInput).toHaveAttribute('type', 'text');

    // Click again to hide
    const hideBtn = page.getByLabel('Hide password');
    await hideBtn.click();
    await expect(visiblePasswordInput).toHaveAttribute('type', 'password');

    await page.screenshot({ path: 'test-results/screenshots/form-login-password-toggle.png' });
  });

  test('should perform live validation on Sign Up form for email, phone, and password mismatch', async ({ page }) => {
    // Open Sign Up modal
    await page.getByRole('button', { name: 'Get Started' }).click();
    await expect(page.getByRole('heading', { name: 'Create your Sentinel Account' })).toBeVisible();

    // Type invalid work email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('not-a-valid-email');
    await emailInput.blur();
    await expect(page.locator('text=Please enter a valid work email address')).toBeVisible();

    // Type invalid phone (not 10 digits or wrong prefix)
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('12345');
    await phoneInput.blur();
    await expect(page.locator('text=Phone number must be exactly 10 digits')).toBeVisible();

    // Type passwords that do not match
    const passwordInput = page.locator('input[type="password"]').first();
    const confirmPasswordInput = page.locator('input[type="password"]').nth(1);

    await passwordInput.fill('SecurePass123!');
    await confirmPasswordInput.fill('MismatchPass456!');
    await confirmPasswordInput.blur();

    await expect(page.locator('text=Passwords do not match.')).toBeVisible();

    // Capture screenshot of live validation errors
    await page.screenshot({ path: 'test-results/screenshots/form-signup-validation.png' });
  });

  test('should allow filling a complete valid registration form with role selection', async ({ page }) => {
    await page.getByRole('button', { name: 'Get Started' }).click();

    const timestamp = Date.now().toString().slice(-5);
    const validEmail = `engineer_${timestamp}@sentinel.internal`;
    const validUsername = `sentinel_${timestamp}`;

    // Fill valid form fields
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill('Sentinel'); // First Name
    await inputs.nth(1).fill('Auditor'); // Last Name

    await page.locator('input[type="email"]').fill(validEmail);
    await inputs.nth(2).fill(validUsername); // Username

    await page.locator('input[type="tel"]').fill('9876543210'); // Valid 10-digit Indian/international test phone

    const passwordInput = page.locator('input[type="password"]').first();
    const confirmPasswordInput = page.locator('input[type="password"]').nth(1);

    await passwordInput.fill('Sentinel2026!');
    await confirmPasswordInput.fill('Sentinel2026!');

    // Select role
    const roleSelect = page.locator('select');
    await roleSelect.selectOption('Software Engineer (Developer)');

    // Verify all validation checkmarks or no active error messages
    await expect(page.locator('text=Passwords do not match.')).not.toBeVisible();
    await expect(page.locator('text=Please enter a valid work email address')).not.toBeVisible();

    // Capture screenshot of perfectly filled registration form
    await page.screenshot({ path: 'test-results/screenshots/form-signup-filled.png' });

    // Submit registration form
    const submitBtn = page.getByRole('button', { name: 'Create Account' });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Allow time for Better Auth response / redirect or success notification
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'test-results/screenshots/form-signup-submitted.png' });
  });
});
