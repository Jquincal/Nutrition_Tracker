const fallbackCatalog = [
  { id: 'fallback-push-up', name: 'Push-up', bodyPart: 'chest', target: 'pectorals', equipment: 'body weight', type: 'strength', instructions: ['Keep your body in a straight line.', 'Lower your chest, then push back up.'] },
  { id: 'fallback-squat', name: 'Bodyweight squat', bodyPart: 'upper legs', target: 'quadriceps', equipment: 'body weight', type: 'strength', instructions: ['Sit the hips back and down.', 'Drive through the feet to stand.'] },
  { id: 'fallback-deadlift', name: 'Barbell deadlift', bodyPart: 'back', target: 'spine', equipment: 'barbell', type: 'strength', instructions: ['Brace your trunk and hinge at the hips.', 'Stand tall while keeping the bar close.'] },
  { id: 'fallback-row', name: 'Bent-over barbell row', bodyPart: 'back', target: 'upper back', equipment: 'barbell', type: 'strength', instructions: ['Hinge forward with a neutral back.', 'Pull the bar toward your torso.'] },
  { id: 'fallback-plank', name: 'Plank', bodyPart: 'waist', target: 'abs', equipment: 'body weight', type: 'strength', instructions: ['Brace your core and keep a straight line.', 'Hold without letting the hips sag.'] },
  { id: 'fallback-run', name: 'Running', bodyPart: 'cardio', target: 'cardiovascular system', equipment: 'body weight', type: 'cardio', instructions: ['Run at a sustainable pace.'] },
  { id: 'fallback-bike', name: 'Stationary cycling', bodyPart: 'cardio', target: 'cardiovascular system', equipment: 'stationary bike', type: 'cardio', instructions: ['Adjust the seat and pedal at a sustainable pace.'] },
];

async function fetchJson(url, options, attempts = 3) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429 || response.status >= 500) throw new Error(`External exercise API returned ${response.status}`);
      if (!response.ok) throw new Error(`External exercise API returned ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
    }
  }
  throw lastError;
}

const normalizeExerciseDb = (item) => ({
  provider: 'exercisedb',
  providerId: String(item.exerciseId || item.id),
  name: item.name,
  type: String(item.exerciseType || (item.bodyPart === 'cardio' ? 'cardio' : 'strength')).toLowerCase(),
  bodyPart: item.bodyParts?.[0] || item.bodyPart,
  targetMuscle: item.targetMuscles?.[0] || item.target,
  secondaryMuscles: item.secondaryMuscles || [],
  equipment: item.equipments?.join(', ') || item.equipment,
  instructions: item.instructions || [],
  gifUrl: item.gifUrl || item.imageUrl || null,
  videoUrl: item.videoUrl || null,
  providerData: item,
});

export async function loadCuratedCatalog() {
  const baseUrl = process.env.EXERCISEDB_BASE_URL?.replace(/\/$/, '');
  const apiKey = process.env.EXERCISEDB_API_KEY;
  if (!baseUrl || !apiKey) return fallbackCatalog.map((item) => normalizeExerciseDb(item));
  try {
    const host = process.env.EXERCISEDB_HOST || new URL(baseUrl).host;
    const data = await fetchJson(`${baseUrl}/exercises?limit=250&offset=0`, {
      headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': host },
    });
    return (Array.isArray(data) ? data : data.data || []).filter((item) => (item?.exerciseId || item?.id) && item?.name).map(normalizeExerciseDb);
  } catch (error) {
    console.warn(`ExerciseDB unavailable, using bundled catalog: ${error.message}`);
    return fallbackCatalog.map((item) => normalizeExerciseDb(item));
  }
}

export async function enrichWithApiNinjas(exercises) {
  const apiKey = process.env.API_NINJAS_API_KEY;
  if (!apiKey) return exercises;
  return Promise.all(exercises.map(async (exercise) => {
    if (exercise.instructions.length) return exercise;
    try {
      const data = await fetchJson(`https://api.api-ninjas.com/v1/exercises?name=${encodeURIComponent(exercise.name)}`, {
        headers: { 'X-Api-Key': apiKey },
      }, 2);
      const match = Array.isArray(data) && data[0];
      return match?.instructions
        ? { ...exercise, instructions: [match.instructions], providerData: { ...exercise.providerData, apiNinjas: match } }
        : exercise;
    } catch {
      return exercise;
    }
  }));
}
