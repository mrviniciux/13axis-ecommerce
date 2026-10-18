import { expect, test } from '@playwright/test';

test('renders the default Portuguese locale', async ({ page }) => {
  await page.goto('/br');

  await expect(page.getByRole('heading', { name: 'Bem vindo' })).toBeVisible();
});

test('renders the English locale', async ({ page }) => {
  await page.goto('/us');

  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
});
