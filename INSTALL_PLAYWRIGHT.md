# Playwright Installation & Setup

## Quick Start

### 1. Install Playwright

```bash
npm install -D @playwright/test
```

### 2. Install Browsers

```bash
npx playwright install --with-deps
```

This will install Chromium, Firefox, and WebKit browsers along with their system dependencies.

### 3. Run E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/discovery.spec.ts

# Run specific browser
npx playwright test --project=chromium
```

---

## Configuration

The Playwright configuration is already set up in `playwright.config.ts`:

- **Test directory**: `./e2e`
- **Base URL**: `http://localhost:5173`
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 12
- **Auto-start**: Dev server starts automatically
- **Screenshots**: On failure
- **Traces**: On retry

---

## Writing Tests

Create new test files in the `e2e/` directory:

```typescript
import { test, expect } from '@playwright/test';

test('my test', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Expected Text');
});
```

---

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/test.yml`) already includes E2E testing:

```yaml
e2e:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20.x'
    - run: npm ci
    - run: npx playwright install --with-deps chromium
    - run: npx playwright test
```

---

## Troubleshooting

### Permission Errors

If you encounter npm cache permission errors:

```bash
sudo chown -R $(id -u):$(id -g) ~/.npm
```

### Browser Installation Issues

If browsers fail to install:

```bash
# Install system dependencies manually (Ubuntu/Debian)
sudo npx playwright install-deps

# Or install browsers only
npx playwright install chromium
```

### Port Conflicts

If port 5173 is already in use:

1. Kill the process using port 5173
2. Or change the port in `vite.config.ts` and `playwright.config.ts`

---

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test Runner](https://playwright.dev/docs/test-intro)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)

---

Last Updated: October 29, 2024

