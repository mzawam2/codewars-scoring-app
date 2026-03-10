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

## Developer environment

- Node version is pinned with:
	- `.nvmrc`
	- `.node-version`

Recommended local setup:

1. Install Node 22 (LTS)
2. Run `npm install`
3. Run `npm start`

### VS Code Dev Container

This repo includes a ready-to-use dev container config:

- [.devcontainer/devcontainer.json](.devcontainer/devcontainer.json)

In VS Code, run **Dev Containers: Reopen in Container**. It will:

- use Node 22 image
- install dependencies (`npm install`)
- forward port 4200

## Docker (containerized app)

This repo includes:

- [Dockerfile](Dockerfile)
- [nginx.conf](nginx.conf)
- [.dockerignore](.dockerignore)

### Build image

```bash
docker build -t codewars-scoring-app:latest .
```

### Run container

```bash
docker run --rm -p 8080:80 codewars-scoring-app:latest
```

Then open http://localhost:8080.

### Docker Compose

Use the included compose file for one-command startup:

```bash
docker compose up --build -d
```

Stop it with:

```bash
docker compose down
```

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
