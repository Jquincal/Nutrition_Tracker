import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('FitStack migration backfills nutrition ownership before dropping Clerk foreign keys', async () => {
  const sql = await readFile(new URL('./002_fitstack_pro.sql', import.meta.url), 'utf8');
  const mealBackfill = sql.indexOf('UPDATE meals m SET user_id');
  const mealDrop = sql.indexOf('ALTER TABLE meals DROP COLUMN IF EXISTS clerk_user_id');
  const foodBackfill = sql.indexOf('UPDATE custom_foods f SET user_id');
  const foodDrop = sql.indexOf('ALTER TABLE custom_foods DROP COLUMN IF EXISTS clerk_user_id');
  assert.ok(mealBackfill >= 0 && mealBackfill < mealDrop);
  assert.ok(foodBackfill >= 0 && foodBackfill < foodDrop);
  assert.ok(sql.includes('DROP TABLE IF EXISTS workouts CASCADE'));
  assert.ok(!sql.includes('DROP TABLE IF EXISTS meals'));
  assert.ok(!sql.includes('DROP TABLE IF EXISTS custom_foods'));
});
