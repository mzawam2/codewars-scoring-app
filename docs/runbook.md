# Operations Runbook

This runbook is for event-day operators and maintainers.

## 1) Pre-event checklist (T-1 day)

1. Confirm team roster (`src/app/config/teams.config.ts`).
2. Confirm event window UTC timestamps (`src/app/config/event.config.ts`).
3. Confirm accepted kata list and rubric (`src/app/config/scoring.config.ts`).
4. Validate at least one sample user has expected completions in window.
5. Run quality gates:
   - `npm test`
   - `npm run test:e2e`
6. Build and smoke test:
   - `npm run build`
   - `npm start`

## 2) Event startup procedure

1. Start app:
   - `npm start`
   - This runs preflight validation first in warn-only mode.
2. Open projector display URL.
3. Verify:
   - Table loads
   - At least one known team has expected score behavior
   - “Last Updated” field changes over time
4. Keep one terminal open for logs.

## 3) Live operations checks

Every 15–30 minutes:
- Check app still reachable in browser.
- Check scores are changing for active teams.
- Check for network/API errors in browser dev tools or console logs.

## 4) Incident response

### Symptom: No teams have scores

Actions:
1. Verify event window timestamps are correct and UTC.
2. Validate one username with direct API request.
3. Verify accepted kata list is not empty/mismatched.
4. Restart app and clear browser localStorage cache if needed.

### Symptom: app does not start after config changes

Actions:
1. Run `npm run validate:preflight` and review reported failures.
2. Fix invalid team usernames in `teams.config.ts`.
3. Fix challenge slug mismatches directly in `scoring.config.ts` (`ACCEPTED_KATAS_CONFIG`).
4. Ensure every accepted challenge supports all accepted languages.
5. Re-run `npm start`.
6. Optional strict mode: `npm run start:strict-preflight`.

### Symptom: Some teams remain zero unexpectedly

Actions:
1. Confirm username spelling/casing in `teams.config.ts`.
2. Check if that user has qualifying completions in event window.
3. Check if solved kata names are in `ACCEPTED_KATAS_CONFIG`.

### Symptom: App is up but stale

Actions:
1. Confirm `refreshIntervalMs` is appropriate.
2. Check browser network tab for failed API calls.
3. Restart app process.

## 5) Post-event steps

1. Export screenshots/results if needed.
2. Tag release or snapshot config files for auditability.
3. Open follow-up issue for next year’s team/rule updates.

## 6) Useful commands

```bash
npm install
npm run validate:preflight
npm start
npm run start:skip-validation
npm run build
npm test
npm run test:coverage
npm run test:integration
npm run test:e2e
```
