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
