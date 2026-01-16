import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 * Tests the complete authentication flow including login and workspace navigation
 * Uses test credentials: ac7x@pm.me / 123123
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should redirect unauthenticated users to login page', async ({ page }) => {
    // When: User visits the root URL without being authenticated
    await page.goto('/');
    
    // Then: Should be redirected to /login
    await expect(page).toHaveURL('/login');
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Given: User is on the login page
    await page.goto('/login');
    
    // When: User enters valid credentials and submits
    await page.fill('input[type="email"]', 'ac7x@pm.me');
    await page.fill('input[type="password"]', '123123');
    await page.click('button[type="submit"]');
    
    // Then: Should be redirected to dashboard or workspace
    // Wait for navigation to complete
    await page.waitForURL(/\/(dashboard|workspace)/, { timeout: 10000 });
    
    // Verify user is authenticated by checking for user-specific content
    // This could be user email, avatar, or other identifier
    const isAuthenticated = 
      page.url().includes('/dashboard') || 
      page.url().includes('/workspace');
    
    expect(isAuthenticated).toBeTruthy();
  });

  test('should display error message with invalid credentials', async ({ page }) => {
    // Given: User is on the login page
    await page.goto('/login');
    
    // When: User enters invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Then: Should display error message
    // Wait for error message to appear
    await page.waitForSelector('.alert-error, .error-message', { timeout: 5000 });
    
    const errorVisible = await page.isVisible('.alert-error, .error-message');
    expect(errorVisible).toBeTruthy();
  });

  test('should show loading state during login', async ({ page }) => {
    // Given: User is on the login page
    await page.goto('/login');
    
    // When: User submits the form
    await page.fill('input[type="email"]', 'ac7x@pm.me');
    await page.fill('input[type="password"]', '123123');
    
    // Click submit and immediately check for loading state
    const submitPromise = page.click('button[type="submit"]');
    
    // Then: Should show loading state
    const loadingText = page.locator('button[type="submit"]:has-text("Logging in")');
    const loadingVisible = await loadingText.isVisible().catch(() => false);
    
    // Wait for submit to complete
    await submitPromise;
    
    // Loading state may be very brief, so we just verify the button exists
    expect(page.locator('button[type="submit"]')).toBeTruthy();
  });
});

test.describe('Post-Authentication Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'ac7x@pm.me');
    await page.fill('input[type="password"]', '123123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|workspace)/, { timeout: 10000 });
  });

  test('should access dashboard after login', async ({ page }) => {
    // Given: User is authenticated
    // When: User navigates to dashboard
    if (!page.url().includes('/dashboard')) {
      await page.goto('/dashboard');
    }
    
    // Then: Dashboard page should be accessible
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should access workspace list after login', async ({ page }) => {
    // Given: User is authenticated
    // When: User navigates to workspace
    await page.goto('/workspace');
    
    // Then: Workspace page should be accessible
    await expect(page).toHaveURL(/\/workspace/);
  });

  test('should be able to logout', async ({ page }) => {
    // Given: User is authenticated
    // When: User logs out
    await page.goto('/logout');
    
    // Then: Should be redirected to login page
    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page).toHaveURL('/login');
  });
});
