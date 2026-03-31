# Configuration Reference

All operational configuration lives in `src/app/config`.

## `api.config.ts`

- `CODEWARS_API_CONFIG.baseUrl`
- Default: `https://www.codewars.com/api/v1`

Use this if Codewars changes base host/path in the future.

## `event.config.ts`

- `EVENT_WINDOW_CONFIG.timeZone`
- `EVENT_WINDOW_CONFIG.startIsoEastern`
- `EVENT_WINDOW_CONFIG.endIsoEastern`

Use full ISO timestamps with an Eastern offset (for example `YYYY-MM-DDTHH:mm:ss-04:00`) to keep event configuration in ET.

## `teams.config.ts`

- `SCOREBOARD_TEAMS_CONFIG`
- Each team includes:
  - `teamMembers: string[]`
  - `codeWarsUser: string`

If username is invalid or removed, that team will normally score 0 (with current tolerance settings).

## `scoring.config.ts`

- `ACCEPTED_KATAS_CONFIG: { name: string; slug: string }[]`
- `ACCEPTED_LANGUAGES_CONFIG: string[]`
- `SCORE_RUBRIC_CONFIG: Record<number, number>`

`SCORE_RUBRIC_CONFIG` maps absolute rank id to points.
Example: rank `-1` maps via key `1`.

Only completions with at least one language in `ACCEPTED_LANGUAGES_CONFIG` are considered score-eligible.

For challenges, configure both a display `name` and API lookup key `slug`.
The app uses `slug` for acceptance checks and API validation, while displaying the configured `name` on the scoreboard.

## `runtime.config.ts`

- `refreshIntervalMs`
- `challengeCacheKey`
- `tolerateTeamFetchErrors`
- `tolerateChallengeDetailErrors`

These control refresh cadence, localStorage cache key, and strict-vs-resilient API error behavior.

## `ui.config.ts`

- Auto-scroll timing and movement:
  - `scrollIntervalMs`
  - `scrollStepPx`
  - `topLoiterMs`
  - `bottomLoiterMs`
  - `uiRefreshIntervalMs`
- Labels:
  - `lastUpdatedPrefix`
  - `emptyLastUpdatedValue`

## `app-display.config.ts`

- `APP_DISPLAY_CONFIG.title`

For title/branding text.
