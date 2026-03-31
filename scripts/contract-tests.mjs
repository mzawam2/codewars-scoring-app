import assert from 'node:assert/strict';

const baseUrl = process.env.CODEWARS_API_BASE_URL || 'https://www.codewars.com/api/v1';
const user = process.env.CODEWARS_CONTRACT_USER || 'css99';
const fallbackChallengeId = process.env.CODEWARS_CONTRACT_CHALLENGE_ID;

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectType(value, type, path) {
  assert.equal(typeof value, type, `${path} must be ${type}, got ${typeof value}`);
}

function expectArray(value, path) {
  assert.ok(Array.isArray(value), `${path} must be an array`);
}

function expectIsoDate(value, path) {
  expectType(value, 'string', path);
  const parsed = Date.parse(value);
  assert.ok(!Number.isNaN(parsed), `${path} must be a valid ISO date string`);
}

async function getJson(url) {
  const response = await fetch(url);
  assert.equal(response.status, 200, `Expected 200 for ${url}, got ${response.status}`);

  const contentType = response.headers.get('content-type') || '';
  assert.ok(contentType.includes('application/json'), `Expected JSON response for ${url}`);

  return response.json();
}

function validateCompletedChallengesPayload(payload) {
  assert.ok(isObject(payload), 'Completed challenges payload must be an object');
  expectType(payload.totalPages, 'number', 'totalPages');
  expectType(payload.totalItems, 'number', 'totalItems');
  expectArray(payload.data, 'data');

  if (payload.data.length > 0) {
    const first = payload.data[0];
    assert.ok(isObject(first), 'data[0] must be an object');
    expectType(first.id, 'string', 'data[0].id');
    expectType(first.name, 'string', 'data[0].name');
    expectType(first.slug, 'string', 'data[0].slug');
    expectIsoDate(first.completedAt, 'data[0].completedAt');
    expectArray(first.completedLanguages, 'data[0].completedLanguages');
  }
}

function validateChallengePayload(payload) {
  assert.ok(isObject(payload), 'Code challenge payload must be an object');

  expectType(payload.id, 'string', 'id');
  expectType(payload.name, 'string', 'name');
  expectType(payload.slug, 'string', 'slug');
  expectType(payload.url, 'string', 'url');
  expectType(payload.category, 'string', 'category');
  expectType(payload.description, 'string', 'description');
  expectArray(payload.tags, 'tags');
  expectArray(payload.languages, 'languages');

  assert.ok(isObject(payload.rank), 'rank must be an object');
  expectType(payload.rank.id, 'number', 'rank.id');
  expectType(payload.rank.name, 'string', 'rank.name');
  expectType(payload.rank.color, 'string', 'rank.color');

  assert.ok(isObject(payload.createdBy), 'createdBy must be an object');
  expectType(payload.createdBy.username, 'string', 'createdBy.username');
  expectType(payload.createdBy.url, 'string', 'createdBy.url');

  if (payload.approvedBy != null) {
    assert.ok(isObject(payload.approvedBy), 'approvedBy must be an object when present');
    expectType(payload.approvedBy.username, 'string', 'approvedBy.username');
    expectType(payload.approvedBy.url, 'string', 'approvedBy.url');
  }

  expectType(payload.totalAttempts, 'number', 'totalAttempts');
  expectType(payload.totalCompleted, 'number', 'totalCompleted');
  expectType(payload.totalStars, 'number', 'totalStars');
  expectType(payload.voteScore, 'number', 'voteScore');
  expectIsoDate(payload.publishedAt, 'publishedAt');
  expectIsoDate(payload.approvedAt, 'approvedAt');
}

async function run() {
  console.log('Running Codewars API contract tests...');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`User: ${user}`);

  const completedUrl = `${baseUrl}/users/${encodeURIComponent(user)}/code-challenges/completed?page=0`;
  const completedPayload = await getJson(completedUrl);
  validateCompletedChallengesPayload(completedPayload);
  console.log('✓ Completed challenges contract valid');

  const challengeId = completedPayload.data?.[0]?.id || fallbackChallengeId;
  assert.ok(
    challengeId,
    'No challenge id available. Provide CODEWARS_CONTRACT_CHALLENGE_ID env var or use a user with at least one completion.'
  );

  const challengeUrl = `${baseUrl}/code-challenges/${encodeURIComponent(challengeId)}`;
  const challengePayload = await getJson(challengeUrl);
  validateChallengePayload(challengePayload);
  console.log('✓ Code challenge contract valid');

  console.log('All contract checks passed.');
}

run().catch((error) => {
  console.error('Contract test failed:', error.message);
  process.exitCode = 1;
});
