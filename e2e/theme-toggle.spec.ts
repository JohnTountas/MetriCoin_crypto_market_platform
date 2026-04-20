import { expect, type Page, test } from '@playwright/test';

test('dashboard theme toggle keeps the app stable', async ({ page }) => {
  const pageErrors: Error[] = [];

  page.on('pageerror', (error) => {
    pageErrors.push(error);
  });

  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      name: /Premium crypto market intelligence with live portfolio math/i,
    }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(documentTheme(page)).resolves.toBe('light');

  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(documentTheme(page)).resolves.toBe('dark');

  expect(pageErrors).toEqual([]);
});

const documentTheme = (page: Page) =>
  page.evaluate(() => document.documentElement.dataset.theme);
