# API Integration Reference

This app uses **Codewars API v1** and does not require authentication for current endpoints.

Official documentation root:
- https://dev.codewars.com/

Primary docs sections:
- Users API: https://dev.codewars.com/#users-api
- Code Challenges API: https://dev.codewars.com/#code-challenges-api
- Errors: https://dev.codewars.com/#errors

> If sub-section anchors change in the docs site, open the section and navigate by heading name.

## APIs currently used by this app

### 1) List completed challenges for a user

**HTTP**
- `GET https://www.codewars.com/api/v1/users/{user}/code-challenges/completed?page={page}`

**Used in code**
- `src/app/user.service.ts` via `getCodeChallengesByUser(userName, page)`

**Expected response shape (used fields)**

```json
{
  "totalPages": 1,
  "totalItems": 1,
  "data": [
    {
      "id": "514b92a657cdc65150000006",
      "name": "Multiples of 3 and 5",
      "slug": "multiples-of-3-and-5",
      "completedAt": "2017-04-06T16:32:09Z",
      "completedLanguages": ["javascript"]
    }
  ]
}
```

**App behavior with this response**
- Iterates all pages from `0` to `totalPages - 1`
- Filters records to configured event window (`completedAt`)
- Uses `id` to fetch challenge details for rank and canonical name

**Codewars docs**
- Users API section (List Completed Challenges): https://dev.codewars.com/#users-api

---

### 2) Get code challenge details

**HTTP**
- `GET https://www.codewars.com/api/v1/code-challenges/{challenge}`

**Used in code**
- `src/app/user.service.ts` via `getCodeChallenge(id)`

**Expected response shape (used fields)**

```json
{
  "id": "5277c8a221e209d3f6000b56",
  "name": "Valid Braces",
  "slug": "valid-braces",
  "url": "http://www.codewars.com/kata/valid-braces",
  "category": "algorithms",
  "description": "...",
  "tags": ["Algorithms"],
  "languages": ["javascript"],
  "rank": {
    "id": -4,
    "name": "4 kyu",
    "color": "blue"
  },
  "createdBy": {
    "username": "user",
    "url": "http://www.codewars.com/users/user"
  },
  "approvedBy": {
    "username": "approver",
    "url": "http://www.codewars.com/users/approver"
  },
  "totalAttempts": 4911,
  "totalCompleted": 919,
  "totalStars": 12,
  "voteScore": 512,
  "publishedAt": "2013-11-05T00:07:31Z",
  "approvedAt": "2013-12-20T14:53:06Z"
}
```

**App behavior with this response**
- Uses `slug` to check allow-list (`ACCEPTED_KATAS_CONFIG`)
- Uses `rank.id` to compute points via rubric map
- Caches challenge details in `localStorage`
- Displays configured kata `name` from `ACCEPTED_KATAS_CONFIG` on the scoreboard

**Codewars docs**
- Code Challenges API section (Get Code Challenge): https://dev.codewars.com/#code-challenges-api

## Error handling expectations

Codewars documents conventional HTTP status codes.
Typical relevant statuses:
- `200` success
- `404` user/challenge not found
- `429` rate limit
- `5xx` server errors

Reference:
- https://dev.codewars.com/#errors

Current app behavior is controlled by `src/app/config/runtime.config.ts`:
- `tolerateTeamFetchErrors`
- `tolerateChallengeDetailErrors`

When tolerance is enabled, failures degrade to zero-score outcomes for impacted teams rather than failing the whole board.

## Contract test workflow (recommended)

Use this command:

```bash
npm run test:contract
```

This runs `scripts/contract-tests.mjs`, which makes live requests to the same Codewars endpoints used by the app and validates critical response shape + types.

Why this helps:

- Detects breaking API schema changes early
- Verifies third-party endpoint behavior independently from UI tests
- Produces a clear non-zero exit code for CI alerting

Suggested CI strategy:

1. Keep normal tests (`npm test`, `npm run test:e2e`) as PR gates.
2. Run contract tests on a daily schedule.
3. Notify maintainers on failure and pin failing field/endpoint in incident notes.
