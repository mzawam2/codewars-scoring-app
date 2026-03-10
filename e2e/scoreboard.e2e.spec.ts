import { test, expect } from '@playwright/test';

test.describe('Scoreboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/users/*/code-challenges/completed?page=*', async route => {
      const url = route.request().url();

      if (url.includes('/users/css99/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalPages: 1,
            totalItems: 1,
            data: [
              {
                id: 'accepted-e2e-1',
                name: 'Nut Farm',
                slug: 'nut-farm',
                completedLanguages: ['javascript'],
                completedAt: '2025-04-11T10:00:00.000Z'
              }
            ]
          })
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ totalPages: 1, totalItems: 0, data: [] })
      });
    });

    await page.route('**/api/v1/code-challenges/*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'accepted-e2e-1',
          name: 'Nut Farm',
          slug: 'nut-farm',
          url: 'https://www.codewars.com/kata/nut-farm',
          category: 'algorithms',
          description: 'x',
          tags: [],
          languages: ['javascript'],
          rank: { id: -1, name: '1 kyu', color: 'yellow' },
          createdBy: { username: 'u', url: 'u' },
          approvedBy: { username: 'a', url: 'a' },
          totalAttempts: 1,
          totalCompleted: 1,
          totalStars: 1,
          voteScore: 1,
          publishedAt: '2025-01-01T00:00:00.000Z',
          approvedAt: '2025-01-01T00:00:00.000Z'
        })
      });
    });
  });

  test('loads scoreboard shell and headers', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('table.scoreboard')).toBeVisible();
    await expect(page.locator('th')).toContainText([
      'Rank',
      'Team Members',
      'CodeWars User',
      'Points',
      'Completed Katas'
    ]);
  });

  test('shows scored results from API data', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.scoreboard-time')).toContainText('Last Updated:');

    const cssRow = page.locator('tbody tr', { hasText: 'css99' }).first();
    await expect(cssRow).toBeVisible();
    await expect(cssRow).toContainText('Nut Farm');
    await expect(cssRow).toContainText('200');
  });

  test('keeps rendering when some users have no results', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('tbody tr')).toHaveCount(21);
    await expect(page.locator('tbody tr', { hasText: 'css99' }).first()).toBeVisible();
  });
});
