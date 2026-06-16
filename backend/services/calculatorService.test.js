import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCalories, getEffectiveMinutes } from './calculatorService.js';

test('uses the previous strength MET calculation for both strength and fuerza types', () => {
  assert.equal(calculateCalories('Bench press', 'strength', 80, null, 1), 7);
  assert.equal(calculateCalories('Press banca', 'fuerza', 80, null, 1), 7);
});

test('defaults strength work to 1.5 minutes per set when duration is empty', () => {
  assert.equal(getEffectiveMinutes('strength', null, 4), 6);
  assert.equal(calculateCalories('Bench press', 'strength', 70, null, 4), 26);
});

test('uses user weight and duration for cardio', () => {
  assert.equal(calculateCalories('Running', 'cardio', 80, 30), 412);
  assert.ok(calculateCalories('Running', 'cardio', 100, 30) > calculateCalories('Running', 'cardio', 70, 30));
});
