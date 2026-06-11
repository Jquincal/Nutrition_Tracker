const METS = { caminar: 3.5, correr: 9.8, bicicleta: 7.5, natacion: 8, hiit: 10, fuerza: 3.5, pesas: 3.5 };

export function calculateCalories(exercise, type, weightKg, minutes, sets = 0) {
  const met = METS[exercise.toLowerCase()] || METS[type.toLowerCase()] || 5;
  const calcMinutes = minutes || (type === 'fuerza' ? sets * 1.5 : 30);
  return Math.round((met * 3.5 * Number(weightKg) * Number(calcMinutes)) / 200);
}
