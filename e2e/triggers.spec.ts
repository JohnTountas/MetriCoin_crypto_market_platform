import { expect, test } from '@playwright/test';

test('can create a Bitcoin price trigger from the watchlist page', async ({ page }) => {
  const triggerLabel = 'BTC e2e trigger';

  await page.goto('/watchlist');

  await expect(
    page.getByRole('heading', {
      name: /Price triggers/i,
    }),
  ).toBeVisible();

  await page.getByLabel('Direction').selectOption('above');
  await page.getByLabel('Trigger price').fill('123456');
  await page.getByLabel('Label').fill(triggerLabel);

  await page.getByRole('button', { name: 'Create trigger' }).click();

  await expect(page.getByText('Trigger created')).toBeVisible();
  await expect(page.getByText(triggerLabel)).toBeVisible();
  await expect(page.getByText(/Bitcoin above \$123,456\.00/i)).toBeVisible();
});
