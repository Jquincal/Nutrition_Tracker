export const ACTIVITY_FACTORS = Object.freeze({
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
});

export function calculateTdee({ sex, weightKg, heightCm, age, activityLevel }) {
  const factor = ACTIVITY_FACTORS[activityLevel];
  if (!['male', 'female'].includes(sex) || !factor || weightKg <= 0 || heightCm <= 0 || age <= 0) return null;
  const bmr = (10 * Number(weightKg)) + (6.25 * Number(heightCm)) - (5 * Number(age)) + (sex === 'male' ? 5 : -161);
  return Math.round(bmr * factor);
}
