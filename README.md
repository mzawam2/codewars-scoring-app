# Hackathon ScoreBoard

Reliable event scoreboard powered by Codewars API data.

This repository now includes a **multi-page guide + runbook** for operators, maintainers, and developers.

## Start here

- User Guide: [docs/user-guide.md](docs/user-guide.md)
- Operator Quick Card: [docs/operator-quick-card.md](docs/operator-quick-card.md)
- Operations Runbook: [docs/runbook.md](docs/runbook.md)
- Configuration Reference: [docs/configuration-reference.md](docs/configuration-reference.md)
- API Integration Reference: [docs/api-integration.md](docs/api-integration.md)
- Testing & Quality: [docs/testing-and-quality.md](docs/testing-and-quality.md)

## Quick commands

```bash
npm install
npm run validate:preflight
npm start
npm run start:skip-validation
npm test
npm run test:coverage
npm run test:e2e
npm run test:contract
```

`npm start` runs preflight validation first (teams exist + challenge validation against accepted languages) in warn-only mode by default. To fail startup on issues, use `npm run start:strict-preflight`. To bypass once, use `npm run start:skip-validation`.

## Codewars APIs used by this app

Detailed API contract docs are in [docs/api-integration.md](docs/api-integration.md), including:

- Specific endpoint URLs currently used
- Expected response fields (with JSON examples)
- Error handling expectations
- Links to official Codewars API documentation sections

Official documentation root:
- https://dev.codewars.com/

## Repository structure (docs)

```
docs/
	user-guide.md
	operator-quick-card.md
	runbook.md
	configuration-reference.md
	api-integration.md
	testing-and-quality.md
```

## Audience

- Event operators running the board live
- Maintainers updating yearly team/rule configuration
- Developers extending integration and scoring logic
