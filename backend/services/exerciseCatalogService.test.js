import assert from 'node:assert/strict';
import test from 'node:test';
import { loadCuratedCatalog } from './exerciseCatalogService.js';

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
  } finally {
    if (previousBaseUrl) process.env.EXERCISEDB_BASE_URL = previousBaseUrl;
    if (previousApiKey) process.env.EXERCISEDB_API_KEY = previousApiKey;
  }
});
