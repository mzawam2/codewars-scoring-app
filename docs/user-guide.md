# User Guide

## Purpose

This app displays a live scoreboard for a hackathon by reading Codewars completion data for configured users, then applying event-specific scoring rules.

## Core concepts

- **Team**: A pair/group mapped to one Codewars account.
- **Accepted kata**: Only kata in the approved list are scored.
- **Event window (ET)**: Only completions between the configured Eastern Time start/end timestamps are counted.
- **Rubric**: Points assigned by kata rank.

## What users see

- Rank
- Team members
- Codewars username
- Total points
- Completed accepted katas
- Last refresh timestamp

## How ranking works

1. Teams are sorted by `points` descending.
2. Highest score gets rank `1`.
3. If two adjacent teams have equal points, the later one displays without a rank value (tie display behavior).

## Runtime behavior

- Scoreboard refreshes on an interval configured in runtime settings.
- Auto-scroll runs on display screens with top and bottom loiter timing.
- Hovering the scoreboard pauses auto-scroll.

## Updating for a new event (quick path)

1. Update teams in `src/app/config/teams.config.ts`.
2. Update Eastern Time event timestamps in `src/app/config/event.config.ts`.
3. Update accepted katas (`name` + `slug`) and rubric in `src/app/config/scoring.config.ts`.
4. Run validation/tests (`npm run validate:preflight`, `npm test`, `npm run test:e2e`).
5. Launch (`npm start`) and validate rows visually.

## Local run

```bash
npm install
npm start
```

Open: http://localhost:4200
