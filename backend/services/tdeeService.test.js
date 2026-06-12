import assert from 'node:assert/strict';
import test from 'node:test';
import { ACTIVITY_FACTORS, calculateTdee } from './tdeeService.js';

test('calculates Mifflin-St Jeor TDEE for male and female profiles', () => {
  assert.equal(calculateTdee({ sex: 'male', weightKg: 80, heightCm: 180, age: 30, activityLevel: 'moderate' }), 2759);
  assert.equal(calculateTdee({ sex: 'female', weightKg: 60, heightCm: 165, age: 30, activityLevel: 'sedentary' }), 1584);
});

test('exposes standard activity factors and requires a complete valid profile', () => {
  assert.deepEqual(ACTIVITY_FACTORS, { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 });
  assert.equal(calculateTdee({ sex: null, weightKg: 80, heightCm: 180, age: 30, activityLevel: 'moderate' }), null);
});
