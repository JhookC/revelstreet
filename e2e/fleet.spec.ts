import { test, expect } from '@playwright/test';

test('fleet screen shows all three routes', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page.getByText('Fleet Overview')).toBeVisible();
  await expect(page.getByText('op-fox-7')).toBeVisible();
  await expect(page.getByText('op-echo-3')).toBeVisible();
  await expect(page.getByText('op-victor-2')).toBeVisible();
});

test('clicking a route card navigates to the route screen', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.locator('li').filter({ hasText: 'op-fox-7' }).click();

  await expect(page).toHaveURL(/\/routes\/route-001/);
  await expect(page.getByRole('heading', { name: 'op-fox-7' })).toBeVisible();
  await expect(page.getByText('0 / 5 complete')).toBeVisible();
});

test('route-002 card shows in-progress status with completed stops', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const card = page.locator('li').filter({ hasText: 'op-echo-3' });
  await expect(card.getByText('In progress')).toBeVisible();
  await expect(card.getByText('2 / 4 stops')).toBeVisible();
});

test('route-003 card shows not-started status', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const card = page.locator('li').filter({ hasText: 'op-victor-2' });
  await expect(card.getByText('Not started')).toBeVisible();
  await expect(card.getByText('0 / 3 stops')).toBeVisible();
});

test('fleet card updates immediately after completing a stop on the route screen', async ({ page }) => {
  // Start fresh
  await page.goto('/routes/route-001');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Complete one stop
  await page.getByRole('button', { name: /mark arrived/i }).click();
  await page.getByRole('button', { name: /mark departed/i }).click();
  await page.getByRole('button', { name: /picked up/i }).first().click();

  // Navigate back to fleet
  await page.getByRole('button', { name: 'Back to fleet' }).click();
  await page.waitForLoadState('networkidle');

  // Fleet card should show updated progress immediately (no stale cache)
  const card = page.locator('li').filter({ hasText: 'op-fox-7' });
  await expect(card.getByText('1 / 5 stops')).toBeVisible();
  await expect(card.getByText('In progress')).toBeVisible();
});
