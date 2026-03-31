import { test, expect } from '@playwright/test';

test.describe('Admin E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/users/*/code-challenges/completed?page=*', async (route) => {
      const url = route.request().url();

      if (url.includes('/users/MildRacc/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalPages: 1,
            totalItems: 2,
            data: [
              {
                id: '5168bb5dfe9a00b126000018',
                name: 'Reversed Strings',
                slug: '5168bb5dfe9a00b126000018',
                completedLanguages: ['javascript'],
                completedAt: '2025-04-11T10:00:00.000Z',
              },
              {
                id: '514b92a657cdc65150000006',
                name: 'Multiples of 3 or 5',
                slug: '514b92a657cdc65150000006',
                completedLanguages: ['java'],
                completedAt: '2025-04-11T11:00:00.000Z',
              },
            ],
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ totalPages: 1, totalItems: 0, data: [] }),
      });
    });

    await page.route('**/api/v1/code-challenges/*', async (route) => {
      const id = route.request().url().split('/').pop();
      const isFirst = id === '5168bb5dfe9a00b126000018';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id,
          name: isFirst ? 'Reversed Strings' : 'Multiples of 3 or 5',
          slug: id,
          url: `https://www.codewars.com/kata/${id}`,
          category: 'algorithms',
          description: 'x',
          tags: [],
          languages: ['javascript'],
          rank: isFirst
            ? { id: -1, name: '1 kyu', color: 'yellow' }
            : { id: -8, name: '8 kyu', color: 'white' },
          createdBy: { username: 'u', url: 'u' },
          approvedBy: { username: 'a', url: 'a' },
          totalAttempts: 1,
          totalCompleted: 1,
          totalStars: 1,
          voteScore: 1,
          publishedAt: '2025-01-01T00:00:00.000Z',
          approvedAt: '2025-01-01T00:00:00.000Z',
        }),
      });
    });
  });

  test('shows teams alphabetically on admin page', async ({ page }) => {
    await page.goto('/admin');

    const names = await page.locator('.team-card .team-name').allTextContents();
    const sorted = [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    expect(names).toEqual(sorted);
  });

  test('shows difficulty, points and total points on team detail page', async ({ page }) => {
    await page.goto('/admin/team/2');

    await expect(page.locator('table.katas-table')).toBeVisible();
    await expect(page.locator('th')).toContainText(['Difficulty', 'Points']);

    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(2);

    await expect(page.locator('.summary')).toContainText('Total Completed: 2');
    await expect(page.locator('.summary')).toContainText('Total Points: 205');
  });
});
