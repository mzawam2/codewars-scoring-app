# Event Day Operator Quick Card

Fast checklist for running the scoreboard during the event.

## 0) One-time prep (before event day)

- Confirm teams in `src/app/config/teams.config.ts`
- Confirm event window in `src/app/config/event.config.ts` (UTC)
- Confirm accepted kata list/rubric in `src/app/config/scoring.config.ts` (`name` + `slug` per kata)
- Run:

```bash
npm run validate:preflight
npm test
npm run test:e2e
```

## 1) Start procedure (event day)

1. Open terminal in repo root.
2. Run:

```bash
npm start
```

3. Open scoreboard in browser: http://localhost:4200
4. Put browser in full screen on display/projector.

## 2) 2-minute health check

- Table is visible
- “Last Updated” is visible and changes over time
- At least one known team row appears
- Points and completed kata cells are populated for active teams

## 3) During-event monitoring cadence

Every 15–30 minutes:

- Refresh browser once if display appears stale
- Check terminal for API/network errors
- Verify scores continue to update for active teams

## 4) Quick diagnostics

### Symptom: all teams at 0

- Verify event window timestamps (UTC)
- Verify API availability and internet connectivity
- Verify accepted kata list is not empty/mismatched

### Symptom: one/few teams stuck at 0

- Verify `codeWarsUser` spelling in teams config
- Verify those users have completions in event window
- Verify solved kata names are in accepted list

### Symptom: app running but no visible changes

- Check `refreshIntervalMs` in `runtime.config.ts`
- Hard refresh browser
- Restart app process

## 5) Emergency restart

```bash
# stop current process (Ctrl+C), then
npm start
```

Re-open/refresh display URL.

## 6) End-of-day closeout

- Capture final screenshot(s)
- Save/export any final standings needed by organizers
- Create follow-up issue for next event updates
