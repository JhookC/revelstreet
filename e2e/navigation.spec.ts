import { test, expect } from '@playwright/test';

test('back button on route screen returns to fleet', async ({ page }) => {
  await page.goto('/routes/route-001');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: 'Back to fleet' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByText('Fleet Overview')).toBeVisible();
});

test('404 page shows for unknown path with back link', async ({ page }) => {
  await page.goto('/does-not-exist');
  await page.waitForLoadState('networkidle');

  await expect(page.getByText('404 — Page not found')).toBeVisible();

  await page.getByRole('link', { name: /back to fleet/i }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByText('Fleet Overview')).toBeVisible();
});

test('unknown routeId shows route-not-found error state', async ({ page }) => {
  await page.goto('/routes/route-999');
  await page.waitForLoadState('networkidle');

  await expect(page.getByText('Route not found')).toBeVisible();

  await page.getByRole('button', { name: /back to fleet/i }).click();
  await expect(page).toHaveURL('/');
});

test('route progress persists across page reload', async ({ page }) => {
  await page.goto('/routes/route-001');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Advance the first stop
  await page.getByRole('button', { name: /mark arrived/i }).click();
  await page.getByRole('button', { name: /mark departed/i }).click();
  await page.getByRole('button', { name: /picked up/i }).first().click();

  await expect(page.getByText('1 / 5 complete')).toBeVisible();

  // Reload without clearing localStorage — progress should survive
  await page.reload();
  await page.waitForLoadState('networkidle');

  await expect(page.getByText('1 / 5 complete')).toBeVisible();
});
