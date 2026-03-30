import { CODEWARS_API_CONFIG } from '../src/app/config/api.config';
import { ACCEPTED_KATAS_CONFIG, ACCEPTED_LANGUAGES_CONFIG } from '../src/app/config/scoring.config';
import { VALIDATION_CONFIG } from '../src/app/config/validation.config';
import type { CodeChallengeResponse } from '../src/app/code-challenge-response';

const CONCURRENCY = VALIDATION_CONFIG.maxConcurrency;
const TIMEOUT_MS = VALIDATION_CONFIG.requestTimeoutMs;

async function fetchKata(slug: string): Promise<CodeChallengeResponse | null> {
  const url = `${CODEWARS_API_CONFIG.baseUrl}/code-challenges/${encodeURIComponent(slug)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      console.error(`[SKIP] ${slug} — HTTP ${response.status}`);
      return null;
    }
    return (await response.json()) as CodeChallengeResponse;
  } catch (err: any) {
    const reason = err?.name === 'AbortError' ? 'request timed out' : String(err);
    console.error(`[SKIP] ${slug} — ${reason}`);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchAllOrdered(
  slugs: string[],
  concurrency: number,
): Promise<(CodeChallengeResponse | null)[]> {
  const results: (CodeChallengeResponse | null)[] = new Array(slugs.length).fill(null);
  let next = 0;

  const workers = Array.from({ length: Math.min(concurrency, slugs.length) }, async () => {
    while (next < slugs.length) {
      const i = next++;
      results[i] = await fetchKata(slugs[i]);
    }
  });

  await Promise.all(workers);
  return results;
}

function sanitize(value: string): string {
  // Remove pipes and collapse newlines so they don't break the delimited format
  return value.replace(/\|/g, '/').replace(/\r?\n/g, ' ').trim();
}

function hasAllAcceptedLanguages(kataLanguages: string[]): boolean {
  const kataLanguageSet = new Set(kataLanguages.map((l) => l.toLowerCase()));
  return ACCEPTED_LANGUAGES_CONFIG.every((lang) => kataLanguageSet.has(lang.toLowerCase()));
}

async function main(): Promise<void> {
  const slugs = ACCEPTED_KATAS_CONFIG.map((k) => k.slug);

  console.log(
    'id|name|slug|url|category|tags|languages|allAcceptedLanguages|rank|totalAttempts|totalCompleted|totalStars|voteScore',
  );

  const katas = await fetchAllOrdered(slugs, CONCURRENCY);

  for (const data of katas) {
    if (!data) continue;

    const row = [
      data.id,
      sanitize(data.name),
      data.slug,
      data.url,
      sanitize(data.category),
      data.tags.join(','),
      data.languages.join(','),
      hasAllAcceptedLanguages(data.languages),
      sanitize(data.rank?.name ?? ''),
      data.totalAttempts,
      data.totalCompleted,
      data.totalStars,
      data.voteScore,
    ].join('|');

    console.log(row);
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
