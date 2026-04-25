import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Clear persisted state so each test starts fresh
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('renders the route screen with all stops', async ({ page }) => {
  await expect(page.getByText('0 / 5 complete')).toBeVisible();
  await expect(page.getByText('Sunset Tacos')).toBeVisible();
  await expect(page.getByText('Marina Sushi')).toBeVisible();
});

test('complete all 5 stops from start to finish', async ({ page }) => {
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: /mark arrived/i }).click();
    await page.getByRole('button', { name: /mark departed/i }).click();
    await page
      .getByRole('button', { name: /^(picked up|delivered)$/i })
      .first()
      .click();
  }

  await expect(page.getByText('5 / 5 complete')).toBeVisible();
  await expect(page.getByText(/route complete/i)).toBeVisible();
});

test('undo toast appears after a status change and reverts on click', async ({ page }) => {
  await page.getByRole('button', { name: /mark arrived/i }).click();
  await expect(page.getByRole('status')).toBeVisible();

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByRole('button', { name: /mark arrived/i })).toBeVisible();
  await expect(page.getByRole('status')).not.toBeVisible();
});

test('failure picker records reason and marks stop failed', async ({ page }) => {
  await page.getByRole('button', { name: /mark arrived/i }).click();
  await page.getByRole('button', { name: /mark departed/i }).click();
  await page.getByRole('button', { name: /failed/i }).click();

  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: /refused/i }).click();

  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByText('1 / 5 complete')).toBeVisible();
});
