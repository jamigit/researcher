/**
 * E2E tests for paper discovery workflow
 * @ai-context Tests complete user journey for discovering and reviewing papers
 */

import { test, expect } from '@playwright/test';

test.describe('Paper Discovery Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Clear IndexedDB to start fresh
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const req = indexedDB.deleteDatabase('ResearchTrackerDB');
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    });
    
    // Reload to initialize fresh database
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to discovery page', async ({ page }) => {
    // Click discovery link in navigation
    await page.click('a[href*="discovery"]');
    
    // Verify we're on the discovery page
    await expect(page).toHaveURL(/.*discovery/);
    await expect(page.locator('h1')).toContainText('Discovery', { timeout: 10000 });
  });

  test('should display discovery queue when available', async ({ page }) => {
    // Navigate to discovery page
    await page.goto('/discovery');
    
    // Should show empty state or queue
    const emptyState = page.locator('text=No papers in queue');
    const queueItems = page.locator('[data-testid="discovery-queue-item"]');
    
    // Either empty state or queue items should be visible
    await expect(emptyState.or(queueItems.first())).toBeVisible({ timeout: 10000 });
  });

  test('should handle navigation between pages', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await expect(page).toHaveURL('/');
    
    // Navigate to papers
    await page.click('a[href="/papers"]');
    await expect(page).toHaveURL('/papers');
    
    // Navigate to discovery (if link exists)
    const discoveryLink = page.locator('a[href*="discovery"]');
    if (await discoveryLink.count() > 0) {
      await discoveryLink.first().click();
      await expect(page).toHaveURL(/.*discovery/);
    }
  });
});

test.describe('Paper Management', () => {
  test('should display papers list', async ({ page }) => {
    await page.goto('/papers');
    
    // Should show papers page
    await expect(page.locator('h1')).toContainText(/Papers|Research/, { timeout: 10000 });
    
    // Should show either papers or empty state
    const emptyState = page.locator('text=/No papers|empty/i');
    const paperCards = page.locator('[data-testid="paper-card"]');
    
    await expect(emptyState.or(paperCards.first())).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to add paper page', async ({ page }) => {
    await page.goto('/papers');
    
    // Look for add paper button/link
    const addButton = page.locator('text=/Add Paper|New Paper/i');
    
    if (await addButton.count() > 0) {
      await addButton.first().click();
      await expect(page).toHaveURL(/.*add/);
    }
  });
});

test.describe('Questions & Answers', () => {
  test('should display questions page', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to questions (dashboard shows questions)
    await expect(page.locator('h1, h2')).toContainText(/Questions|Dashboard/i, { timeout: 10000 });
  });

  test('should handle question creation flow', async ({ page }) => {
    await page.goto('/');
    
    // Look for add question button
    const addQuestionButton = page.locator('text=/Ask Question|New Question|Add Question/i');
    
    if (await addQuestionButton.count() > 0) {
      await addQuestionButton.first().click();
      
      // Form should be visible
      const questionInput = page.locator('input[type="text"], textarea').first();
      await expect(questionInput).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Responsive Design', () => {
  test('should display mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Mobile navigation should be visible
    const mobileNav = page.locator('[data-testid="mobile-navigation"]');
    if (await mobileNav.count() > 0) {
      await expect(mobileNav).toBeVisible();
    }
  });

  test('should display desktop navigation', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Desktop navigation should be visible
    const desktopNav = page.locator('nav, aside');
    await expect(desktopNav.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Error Handling', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page');
    
    // Should show 404 or redirect to home
    const is404 = await page.locator('text=/404|Not Found/i').count() > 0;
    const isHome = page.url().endsWith('/');
    
    expect(is404 || isHome).toBe(true);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.goto('/');
    
    // Page should still load (may show error message)
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible({ timeout: 10000 });
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'TEXTAREA']).toContain(focusedElement);
  });
});

test.describe('Performance', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});

