import { UsersCodeChallenge } from '../users-code-challenge';
import { ACCEPTED_KATAS_CONFIG } from '../config/scoring.config';
import { CodeChallengeResponse } from '../code-challenge-response';
import { EVENT_WINDOW_CONFIG } from '../config/event.config';

/**
 * Mock data for pre-event testing.
 *
 * HOW TO CUSTOMISE:
 *  - Add/remove katas from ACCEPTED_KATAS_CONFIG in scoring.config.ts to change
 *    which katas can appear in mock results.
 *  - Adjust TEAM_MOCK_PROFILES below to control how many katas each team has
 *    completed and which languages they used.
 *  - Dates are generated deterministically (no Math.random) so the data is
 *    stable across page reloads.
 */

// ---------------------------------------------------------------------------
// Deterministic helpers
// ---------------------------------------------------------------------------

/** Simple seeded hash so data is stable across page reloads. */
function hash(seed: number): number {
  let x = seed ^ 0xdeadbeef;
  x = ((x >>> 16) ^ x) * 0x45d9f3b;
  x = ((x >>> 16) ^ x) * 0x45d9f3b;
  x = (x >>> 16) ^ x;
  return Math.abs(x);
}

function deterministicDate(teamIdx: number, kataIdx: number): Date {
  const start = new Date(EVENT_WINDOW_CONFIG.startIsoEastern).getTime();
  const end = new Date(EVENT_WINDOW_CONFIG.endIsoEastern).getTime();
  const duration = Math.max(1, end - start);

  // Spread deterministically within the configured event window
  const offsetMs = hash(teamIdx * 1000 + kataIdx) % duration;
  return new Date(start + offsetMs);
}

// ---------------------------------------------------------------------------
// Team mock profiles
// Each entry controls how many katas a team has "completed" and which
// languages they used.  Add more entries here if you add more teams.
// The index must match the team's position in SCOREBOARD_TEAMS_CONFIG.
// ---------------------------------------------------------------------------

interface TeamMockProfile {
  completedCount: number;
  languages: string[];
}

const TEAM_MOCK_PROFILES: TeamMockProfile[] = [
  { completedCount: 45, languages: ['java', 'javascript', 'python'] }, // 0
  { completedCount: 38, languages: ['javascript', 'python'] },          // 1
  { completedCount: 52, languages: ['java', 'javascript', 'python'] }, // 2
  { completedCount: 41, languages: ['java', 'python'] },                // 3
  { completedCount: 35, languages: ['javascript'] },                    // 4
  { completedCount: 48, languages: ['java', 'javascript'] },            // 5
  { completedCount: 39, languages: ['python'] },                        // 6
  { completedCount: 44, languages: ['java', 'javascript', 'python'] }, // 7
  { completedCount: 50, languages: ['javascript', 'python'] },          // 8
  { completedCount: 37, languages: ['java'] },                          // 9
  { completedCount: 43, languages: ['java', 'javascript'] },            // 10
  { completedCount: 29, languages: ['javascript', 'python'] },          // 11
  { completedCount: 55, languages: ['java', 'javascript', 'python'] }, // 12
  { completedCount: 33, languages: ['python'] },                        // 13
  { completedCount: 47, languages: ['java', 'python'] },                // 14
  { completedCount: 31, languages: ['javascript'] },                    // 15
  { completedCount: 42, languages: ['java', 'javascript', 'python'] }, // 16
  { completedCount: 36, languages: ['javascript', 'python'] },          // 17
  { completedCount: 49, languages: ['java', 'javascript'] },            // 18
  { completedCount: 28, languages: ['python'] },                        // 19
];

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

function generateKatasForTeam(teamIdx: number): UsersCodeChallenge[] {
  const profile = TEAM_MOCK_PROFILES[teamIdx];
  const kataPool = ACCEPTED_KATAS_CONFIG;
  const count = Math.min(profile.completedCount, kataPool.length);

  // Pick `count` katas deterministically by offsetting into the pool
  const offset = hash(teamIdx * 500) % kataPool.length;
  const katas: UsersCodeChallenge[] = [];

  for (let i = 0; i < count; i++) {
    const kataIdx = (offset + i) % kataPool.length;
    const kata = kataPool[kataIdx];

    // Pick 1–3 languages deterministically from the team's language list
    const langCount = (hash(teamIdx * 100 + i) % profile.languages.length) + 1;
    const shuffleOffset = hash(teamIdx * 200 + i) % profile.languages.length;
    const langs: string[] = [];
    for (let l = 0; l < langCount; l++) {
      langs.push(profile.languages[(shuffleOffset + l) % profile.languages.length]);
    }

    katas.push({
      id: kata.slug,
      name: kata.name,
      slug: kata.slug,
      completedLanguages: langs,
      completedAt: deterministicDate(teamIdx, i),
    });
  }

  return katas;
}

// Pre-build all teams once at module load so data is stable within a session
export const MOCK_COMPLETED_KATAS_BY_TEAM: Record<number, UsersCodeChallenge[]> =
  Object.fromEntries(
    TEAM_MOCK_PROFILES.map((_, idx) => [idx, generateKatasForTeam(idx)])
  );

const MOCK_RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

function buildMockCodeChallenge(kataIndex: number): CodeChallengeResponse {
  const kata = ACCEPTED_KATAS_CONFIG[kataIndex];
  const rankId = MOCK_RANKS[hash(kataIndex * 997) % MOCK_RANKS.length];
  const totalAttempts = 2000 + (hash(kataIndex * 991) % 150000);
  const totalCompleted = Math.max(100, Math.floor(totalAttempts * 0.45));
  const totalStars = 50 + (hash(kataIndex * 983) % 5000);
  const voteScore = 100 + (hash(kataIndex * 977) % 50000);

  return {
    id: kata.slug,
    name: kata.name,
    slug: kata.slug,
    url: `https://www.codewars.com/kata/${kata.slug}`,
    category: 'algorithms',
    description: `Mock description for ${kata.name}.`,
    tags: ['Algorithms', 'Practice'],
    languages: ['java', 'javascript', 'python'],
    rank: {
      id: rankId,
      name: `${rankId} kyu`,
      color: 'yellow',
    },
    createdBy: {
      username: 'mock-admin',
      url: 'https://www.codewars.com/users/mock-admin',
    },
    approvedBy: {
      username: 'mock-approver',
      url: 'https://www.codewars.com/users/mock-approver',
    },
    totalAttempts,
    totalCompleted,
    totalStars,
    voteScore,
    publishedAt: '2024-01-01T00:00:00.000Z',
    approvedAt: '2024-01-02T00:00:00.000Z',
  };
}

export const MOCK_CODE_CHALLENGES_BY_ID: Record<string, CodeChallengeResponse> =
  Object.fromEntries(
    ACCEPTED_KATAS_CONFIG.map((_, idx) => {
      const challenge = buildMockCodeChallenge(idx);
      return [challenge.id, challenge];
    })
  );

