import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCalories } from './calculatorService.js';

test('uses the previous strength MET calculation for both strength and fuerza types', () => {
  assert.equal(calculateCalories('Bench press', 'strength', 80, null, 1), 7);
  assert.equal(calculateCalories('Press banca', 'fuerza', 80, null, 1), 7);
});

test('uses user weight and duration for cardio', () => {
  assert.equal(calculateCalories('Running', 'cardio', 80, 30), 412);
  assert.ok(calculateCalories('Running', 'cardio', 100, 30) > calculateCalories('Running', 'cardio', 70, 30));
});
