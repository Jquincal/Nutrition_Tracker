const METS = {
  caminar: 3.5,
  walking: 3.5,
  correr: 9.8,
  running: 9.8,
  bicicleta: 7.5,
  cycling: 7.5,
  natacion: 8,
  swimming: 8,
  hiit: 10,
  fuerza: 3.5,
  strength: 3.5,
  pesas: 3.5,
};

export const DEFAULT_STRENGTH_MINUTES_PER_SET = 1.5;
export const DEFAULT_CARDIO_MINUTES = 30;

export function getEffectiveMinutes(type, minutes, sets = 0) {
  const normalizedType = String(type || '').toLowerCase();
  const isStrength = ['fuerza', 'strength', 'pesas'].includes(normalizedType);
  const providedMinutes = Number(minutes);
  if (providedMinutes > 0) return providedMinutes;
  return isStrength ? Number(sets || 1) * DEFAULT_STRENGTH_MINUTES_PER_SET : DEFAULT_CARDIO_MINUTES;
}

export function calculateCalories(exercise, type, weightKg, minutes, sets = 0) {
  const normalizedExercise = String(exercise || '').toLowerCase();
  const normalizedType = String(type || '').toLowerCase();
  const met = Object.entries(METS).find(([name]) => normalizedExercise.includes(name))?.[1] || METS[normalizedType] || 5;
  const calcMinutes = getEffectiveMinutes(type, minutes, sets);
  return Math.round((met * 3.5 * Number(weightKg) * Number(calcMinutes)) / 200);
}
