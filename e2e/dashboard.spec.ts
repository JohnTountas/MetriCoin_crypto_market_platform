import { expect, test } from '@playwright/test';

test('dashboard and markets route render core terminal UI', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      name: /Premium crypto market intelligence with live portfolio math/i,
    }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Markets' }).first().click();

  await expect(
    page.getByRole('heading', {
      name: /Scalable market coverage/i,
    }),
  ).toBeVisible();
});

