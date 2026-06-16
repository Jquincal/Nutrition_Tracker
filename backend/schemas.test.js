import assert from 'node:assert/strict';
import test from 'node:test';
import { workoutInputSchema } from './schemas.js';

test('accepts the current workout session payload', () => {
  const parsed = workoutInputSchema.parse({
    name: 'Piernas',
    sets: [{ exercise_id: 1, duration_minutes: '12', reps: '10', weight_kg: '80' }],
  });

  assert.equal(parsed.name, 'Piernas');
  assert.equal(parsed.sets[0].duration_minutes, 12);
});

test('accepts legacy single-exercise workout payloads from cached clients', () => {
  const parsed = workoutInputSchema.parse({
    exercise_name: 'Caminar',
    exercise_type: 'cardio',
    duration_minutes: '30',
    calories_burned: '129',
    sets: '1',
    reps: '0',
    weight: '0',
  });

  assert.equal(parsed.exercise_name, 'Caminar');
  assert.equal(parsed.duration_minutes, 30);
  assert.equal(parsed.calories_burned, 129);
});
