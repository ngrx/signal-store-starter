# E2E Testing with Playwright

This directory contains end-to-end tests for the Angular 20+ zone-less application.

## Prerequisites

1. Install Playwright browsers:
   ```bash
   npm run playwright:install
   ```

## Running Tests

### Run all tests (headless):
```bash
npm run test:e2e
```

### Run tests with UI mode:
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser):
```bash
npm run test:e2e:headed
```

## Test Structure

### Authentication Tests (`auth.spec.ts`)
- Login flow validation
- Credential verification
- Post-authentication navigation
- Logout functionality

## Test Credentials

For testing purposes, use:
- **Email**: ac7x@pm.me
- **Password**: 123123

⚠️ **Important**: These are test credentials for E2E testing only.

## Writing Tests

All tests follow the Given-When-Then pattern:

```typescript
test('should do something', async ({ page }) => {
  // Given: Setup initial state
  await page.goto('/some-page');
  
  // When: Perform action
  await page.click('button');
  
  // Then: Verify outcome
  await expect(page).toHaveURL('/expected-url');
});
```

## Configuration

See `playwright.config.ts` for configuration details.

## Debugging Tests

1. Use UI mode for visual debugging:
   ```bash
   npm run test:e2e:ui
   ```

2. Use headed mode to see browser actions:
   ```bash
   npm run test:e2e:headed
   ```

3. View test reports:
   ```bash
   npx playwright show-report
   ```
