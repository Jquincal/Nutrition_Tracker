import assert from 'node:assert/strict';
import test from 'node:test';
import { getTimeZone } from './date.js';

test('accepts valid IANA time zones', () => {
  assert.equal(getTimeZone('America/Argentina/Mendoza'), 'America/Argentina/Mendoza');
});

test('falls back to UTC for invalid time zones', () => {
  assert.equal(getTimeZone('not-a-time-zone'), 'UTC');
});
