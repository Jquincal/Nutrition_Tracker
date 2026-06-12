import assert from 'node:assert/strict';
import test from 'node:test';
import { loadCuratedCatalog } from './exerciseCatalogService.js';

const exercise = (id, name) => ({
  exerciseId: id,
  name,
  bodyParts: ['chest'],
  targetMuscles: ['pectorals'],
  equipments: ['barbell'],
  instructions: ['Perform the exercise under control.'],
});

test('bundled exercise catalog is stable and deduplicated without external credentials', async () => {
  const previousBaseUrl = process.env.EXERCISEDB_BASE_URL;
  const previousApiKey = process.env.EXERCISEDB_API_KEY;
  delete process.env.EXERCISEDB_BASE_URL;
  delete process.env.EXERCISEDB_API_KEY;
  try {
    const first = await loadCuratedCatalog();
    const second = await loadCuratedCatalog();
    assert.deepEqual(first, second);
    assert.equal(new Set(first.map((exercise) => `${exercise.provider}:${exercise.providerId}`)).size, first.length);
    assert.ok(first.every((exercise) => exercise.name && exercise.instructions.length));
    assert.ok(first.some((exercise) => exercise.name === 'Barbell bench press'));
    assert.ok(first.some((exercise) => exercise.equipment === 'cable machine'));
    assert.ok(first.length >= 25);
  } finally {
    if (previousBaseUrl) process.env.EXERCISEDB_BASE_URL = previousBaseUrl;
    if (previousApiKey) process.env.EXERCISEDB_API_KEY = previousApiKey;
  }
});

test('loads and paginates the public ExerciseDB catalog without API credentials', async () => {
  const previousBaseUrl = process.env.EXERCISEDB_BASE_URL;
  const previousApiKey = process.env.EXERCISEDB_API_KEY;
  const previousFetch = global.fetch;
  process.env.EXERCISEDB_BASE_URL = 'https://oss.example/api/v1';
  delete process.env.EXERCISEDB_API_KEY;
  const requests = [];
  global.fetch = async (url, options) => {
    requests.push({ url: String(url), options });
    const isSecondPage = String(url).includes('after=next-page');
    return {
      ok: true,
      status: 200,
      json: async () => ({
        data: [isSecondPage ? exercise('external-2', 'Cable crossover') : exercise('external-1', 'Machine row')],
        meta: isSecondPage
          ? { hasNextPage: false }
          : { hasNextPage: true, nextCursor: 'next-page' },
      }),
    };
  };

  try {
    const catalog = await loadCuratedCatalog();
    assert.ok(catalog.some((item) => item.providerId === 'external-1'));
    assert.ok(catalog.some((item) => item.providerId === 'external-2'));
    assert.equal(requests.length, 2);
    assert.equal(requests[0].options, undefined);
    assert.match(requests[1].url, /after=next-page/);
  } finally {
    global.fetch = previousFetch;
    if (previousBaseUrl) process.env.EXERCISEDB_BASE_URL = previousBaseUrl;
    else delete process.env.EXERCISEDB_BASE_URL;
    if (previousApiKey) process.env.EXERCISEDB_API_KEY = previousApiKey;
    else delete process.env.EXERCISEDB_API_KEY;
  }
});

test('sends RapidAPI headers when ExerciseDB credentials are configured', async () => {
  const previousBaseUrl = process.env.EXERCISEDB_BASE_URL;
  const previousApiKey = process.env.EXERCISEDB_API_KEY;
  const previousHost = process.env.EXERCISEDB_HOST;
  const previousFetch = global.fetch;
  process.env.EXERCISEDB_BASE_URL = 'https://rapid.example/api/v1';
  process.env.EXERCISEDB_API_KEY = 'secret';
  process.env.EXERCISEDB_HOST = 'rapid.example';
  let requestOptions;
  global.fetch = async (_url, options) => {
    requestOptions = options;
    return {
      ok: true,
      status: 200,
      json: async () => ({ data: [], meta: { hasNextPage: false } }),
    };
  };

  try {
    await loadCuratedCatalog();
    assert.deepEqual(requestOptions.headers, {
      'X-RapidAPI-Key': 'secret',
      'X-RapidAPI-Host': 'rapid.example',
    });
  } finally {
    global.fetch = previousFetch;
    if (previousBaseUrl) process.env.EXERCISEDB_BASE_URL = previousBaseUrl;
    else delete process.env.EXERCISEDB_BASE_URL;
    if (previousApiKey) process.env.EXERCISEDB_API_KEY = previousApiKey;
    else delete process.env.EXERCISEDB_API_KEY;
    if (previousHost) process.env.EXERCISEDB_HOST = previousHost;
    else delete process.env.EXERCISEDB_HOST;
  }
});
