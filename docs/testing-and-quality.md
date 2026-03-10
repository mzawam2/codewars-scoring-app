# Testing and Quality

## Test suites

- Unit tests: component/service logic
- Integration tests: app + service + HTTP mocking
- End-to-end tests: browser-level behavior with Playwright

## Commands

```bash
npm test
npm run test:coverage
npm run test:integration
npm run test:e2e
npm run test:contract
npm run validate:preflight
```

First-time Playwright setup:

```bash
npx playwright install
```

## Current high-value scenarios covered

- Score computation from accepted kata + rank
- Event-window filtering
- Paging behavior (`totalPages`)
- Ranking/tie behavior
- Resilient behavior when one team API call fails
- UI rendering and timestamp display
- API endpoint contract tests in `UserService`
- E2E rendering of scoreboard and rows

## API contract testing

`npm run test:contract` runs live contract checks against Codewars API v1 and fails if required response fields/types change.

## Startup preflight validation

`npm start` runs `npm run validate:preflight` before serving (warn-only by default).

Preflight checks:

- every configured team username exists in Codewars
- every accepted challenge slug exists in Codewars
- every accepted challenge supports all accepted languages

Bypass once (for local debugging only):

```bash
npm run start:skip-validation
```

Force strict mode (fail startup on issues):

```bash
npm run start:strict-preflight
```

What it validates:

- `GET /users/{user}/code-challenges/completed?page=0`
	- `totalPages`, `totalItems`, `data[]`
	- `data[0].id`, `name`, `slug`, `completedAt`, `completedLanguages`
- `GET /code-challenges/{challenge}`
	- required fields used by this app (including `rank.id`, `rank.name`, `rank.color`)

Environment overrides:

- `CODEWARS_API_BASE_URL`
- `CODEWARS_CONTRACT_USER`
- `CODEWARS_CONTRACT_CHALLENGE_ID`

Recommended usage:

- Run in CI on a schedule (daily) and on demand.
- Keep unit/integration tests as the main PR gate.
- Use contract tests as an early warning for third-party API drift.

## Coverage output

Coverage artifacts are generated at:
- `coverage/score-board/index.html`

Latest coverage snapshot:

- Statements: 100%
- Branches: 100%
- Functions: 100%
- Lines: 100%

## Suggested CI gate (example)

- Run `npm test` and `npm run test:e2e` on pull requests.
- Optionally enforce minimum thresholds (statements/functions/branches/lines).

## Manual smoke checks (after config changes)

1. Launch app and verify table is visible.
2. Verify at least one known team’s expected points.
3. Verify no console errors.
4. Run one full test pass before merge.
