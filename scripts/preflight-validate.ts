import { CODEWARS_API_CONFIG } from '../src/app/config/api.config';
import { ACCEPTED_KATAS_CONFIG, ACCEPTED_LANGUAGES_CONFIG } from '../src/app/config/scoring.config';
import { SCOREBOARD_TEAMS_CONFIG } from '../src/app/config/teams.config';
import { VALIDATION_CONFIG } from '../src/app/config/validation.config';

interface ValidationFailure {
  type: 'team' | 'challenge';
  key: string;
  reason: string;
  details?: string;
}

const acceptedLanguages = ACCEPTED_LANGUAGES_CONFIG.map((language) => language.toLowerCase());

async function fetchJson(url: string): Promise<{ status: number; body?: any; contentType?: string; }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VALIDATION_CONFIG.requestTimeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const contentType = response.headers.get('content-type') ?? '';

    if (!contentType.includes('application/json')) {
      return { status: response.status, contentType };
    }

    const body = await response.json();
    return { status: response.status, body, contentType };
  } finally {
    clearTimeout(timeout);
  }
}

async function runWithConcurrency<T>(items: T[], handler: (item: T) => Promise<void>): Promise<void> {
  let index = 0;

  const workers = Array.from({ length: Math.min(VALIDATION_CONFIG.maxConcurrency, items.length) }, async () => {
    while (index < items.length) {
      const current = items[index++];
      await handler(current);
    }
  });

  await Promise.all(workers);
}

async function validateTeams(baseUrl: string, failures: ValidationFailure[]): Promise<void> {
  const users = SCOREBOARD_TEAMS_CONFIG.map((team) => team.codeWarsUser);

  await runWithConcurrency(users, async (user) => {
    const url = `${baseUrl}/users/${encodeURIComponent(user)}`;

    try {
      const result = await fetchJson(url);

      if (result.status !== 200) {
        failures.push({
          type: 'team',
          key: user,
          reason: `Codewars user lookup returned HTTP ${result.status}`,
          details: url,
        });
        return;
      }

      if (!result.body || typeof result.body.username !== 'string') {
        failures.push({
          type: 'team',
          key: user,
          reason: 'Missing expected field `username` in user response',
          details: url,
        });
      }
    } catch (error: any) {
      failures.push({
        type: 'team',
        key: user,
        reason: 'Request failed',
        details: `${url} :: ${error?.message ?? error}`,
      });
    }
  });
}

async function validateChallenges(baseUrl: string, failures: ValidationFailure[]): Promise<void> {
  await runWithConcurrency(ACCEPTED_KATAS_CONFIG, async (challengeConfig) => {
    const lookupValue = challengeConfig.slug;
    const lookupType = 'slug';
    const url = `${baseUrl}/code-challenges/${encodeURIComponent(lookupValue)}`;

    try {
      const result = await fetchJson(url);

      if (result.status !== 200) {
        failures.push({
          type: 'challenge',
          key: challengeConfig.name,
          reason: `Code challenge lookup returned HTTP ${result.status} (${lookupType}: ${lookupValue})`,
          details: url,
        });
        return;
      }

      const languages = Array.isArray(result.body?.languages)
        ? result.body.languages.map((language: string) => String(language).toLowerCase())
        : [];

      const missingLanguages = acceptedLanguages.filter((language) => !languages.includes(language));

      if (missingLanguages.length > 0) {
        failures.push({
          type: 'challenge',
          key: challengeConfig.name,
          reason: `Missing accepted language(s): ${missingLanguages.join(', ')}`,
          details: `${lookupType}=${lookupValue}; available=${languages.join(', ') || 'none'}`,
        });
      }
    } catch (error: any) {
      failures.push({
        type: 'challenge',
        key: challengeConfig.name,
        reason: 'Request failed',
        details: `${url} :: ${error?.message ?? error}`,
      });
    }
  });
}

function printSummary(failures: ValidationFailure[]): void {
  if (failures.length === 0) {
    console.log('✅ Preflight validation passed.');
    console.log(`Validated ${SCOREBOARD_TEAMS_CONFIG.length} team user(s) and ${ACCEPTED_KATAS_CONFIG.length} challenge(s).`);
    return;
  }

  console.warn('⚠️  Preflight validation found issues.');
  console.warn(`Found ${failures.length} issue(s).\n`);

  for (const failure of failures) {
    console.warn(`- [${failure.type}] ${failure.key}`);
    console.warn(`  Reason : ${failure.reason}`);
    if (failure.details) {
      console.warn(`  Details: ${failure.details}`);
    }
  }
}

async function main(): Promise<void> {
  if (process.env['SKIP_PREFLIGHT_VALIDATION'] === 'true') {
    console.log('⚠️  Skipping preflight validation (SKIP_PREFLIGHT_VALIDATION=true).');
    return;
  }

  const baseUrl = CODEWARS_API_CONFIG.baseUrl;
  const failures: ValidationFailure[] = [];

  console.log('Running preflight validation...');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Accepted languages: ${acceptedLanguages.join(', ')}`);

  await validateTeams(baseUrl, failures);
  await validateChallenges(baseUrl, failures);

  printSummary(failures);

  if (failures.length > 0) {
    const strictMode = process.env['STRICT_PREFLIGHT_VALIDATION'] === 'true';

    if (VALIDATION_CONFIG.blockServeOnFailure || strictMode) {
      console.error('\n❌ Strict preflight mode is enabled. Failing startup.');
      process.exitCode = 1;
    } else {
      console.warn('\n⚠️  Continuing startup (warn-only mode). Set STRICT_PREFLIGHT_VALIDATION=true to fail on issues.');
    }
  }
}

void main();
