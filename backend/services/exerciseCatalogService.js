const fallbackCatalog = [
  { id: 'fallback-bench-press', name: 'Barbell bench press', aliases: ['press banca', 'press de banca'], bodyPart: 'chest', target: 'pectorals', equipment: 'barbell', type: 'strength', instructions: ['Lower the bar under control to your chest.', 'Press the bar up while keeping your upper back stable.'] },
  { id: 'fallback-incline-bench', name: 'Incline dumbbell bench press', aliases: ['press inclinado'], bodyPart: 'chest', target: 'upper chest', equipment: 'dumbbells', type: 'strength', instructions: ['Set the bench to a moderate incline.', 'Press the dumbbells upward without losing shoulder position.'] },
  { id: 'fallback-chest-press', name: 'Machine chest press', aliases: ['press de pecho en maquina'], bodyPart: 'chest', target: 'pectorals', equipment: 'chest press machine', type: 'strength', instructions: ['Adjust the seat so handles align with your chest.', 'Press forward and return under control.'] },
  { id: 'fallback-cable-fly', name: 'Cable chest fly', aliases: ['aperturas en polea', 'cruce de poleas'], bodyPart: 'chest', target: 'pectorals', equipment: 'cable machine', type: 'strength', instructions: ['Keep a slight bend in your elbows.', 'Bring the handles together in front of your chest.'] },
  { id: 'fallback-overhead-press', name: 'Barbell overhead press', aliases: ['press militar', 'press de hombros'], bodyPart: 'shoulders', target: 'deltoids', equipment: 'barbell', type: 'strength', instructions: ['Brace your trunk and press the bar overhead.', 'Finish with the bar stacked over your shoulders.'] },
  { id: 'fallback-shoulder-press', name: 'Machine shoulder press', aliases: ['press hombros maquina'], bodyPart: 'shoulders', target: 'deltoids', equipment: 'shoulder press machine', type: 'strength', instructions: ['Adjust the seat and keep your back supported.', 'Press overhead and lower under control.'] },
  { id: 'fallback-lateral-raise', name: 'Dumbbell lateral raise', aliases: ['elevaciones laterales'], bodyPart: 'shoulders', target: 'lateral deltoids', equipment: 'dumbbells', type: 'strength', instructions: ['Raise the dumbbells to shoulder height.', 'Lower them slowly without swinging.'] },
  { id: 'fallback-lat-pulldown', name: 'Lat pulldown', aliases: ['jalon al pecho', 'polea al pecho'], bodyPart: 'back', target: 'latissimus dorsi', equipment: 'cable machine', type: 'strength', instructions: ['Pull the bar toward your upper chest.', 'Return with control and a full stretch.'] },
  { id: 'fallback-seated-row', name: 'Seated cable row', aliases: ['remo en polea', 'remo sentado'], bodyPart: 'back', target: 'upper back', equipment: 'cable machine', type: 'strength', instructions: ['Keep your torso stable.', 'Pull the handle toward your abdomen and squeeze your back.'] },
  { id: 'fallback-row', name: 'Bent-over barbell row', aliases: ['remo con barra'], bodyPart: 'back', target: 'upper back', equipment: 'barbell', type: 'strength', instructions: ['Hinge forward with a neutral back.', 'Pull the bar toward your torso.'] },
  { id: 'fallback-assisted-pullup', name: 'Assisted pull-up', aliases: ['dominadas asistidas'], bodyPart: 'back', target: 'latissimus dorsi', equipment: 'assisted pull-up machine', type: 'strength', instructions: ['Set assistance and start from a full hang.', 'Pull until your chest approaches the handles.'] },
  { id: 'fallback-deadlift', name: 'Barbell deadlift', aliases: ['peso muerto'], bodyPart: 'back', target: 'posterior chain', equipment: 'barbell', type: 'strength', instructions: ['Brace your trunk and hinge at the hips.', 'Stand tall while keeping the bar close.'] },
  { id: 'fallback-squat', name: 'Barbell back squat', aliases: ['sentadilla con barra'], bodyPart: 'upper legs', target: 'quadriceps', equipment: 'barbell', type: 'strength', instructions: ['Brace and sit the hips down between your feet.', 'Drive through the floor to stand.'] },
  { id: 'fallback-leg-press', name: 'Leg press', aliases: ['prensa de piernas'], bodyPart: 'upper legs', target: 'quadriceps', equipment: 'leg press machine', type: 'strength', instructions: ['Place your feet securely on the platform.', 'Lower under control and press without locking your knees.'] },
  { id: 'fallback-leg-extension', name: 'Leg extension', aliases: ['extension de cuadriceps'], bodyPart: 'upper legs', target: 'quadriceps', equipment: 'leg extension machine', type: 'strength', instructions: ['Align your knees with the machine pivot.', 'Extend your knees and lower under control.'] },
  { id: 'fallback-leg-curl', name: 'Seated leg curl', aliases: ['curl femoral'], bodyPart: 'upper legs', target: 'hamstrings', equipment: 'leg curl machine', type: 'strength', instructions: ['Secure the thigh pad.', 'Curl your heels down and return slowly.'] },
  { id: 'fallback-hip-thrust', name: 'Barbell hip thrust', aliases: ['hip thrust', 'empuje de cadera'], bodyPart: 'upper legs', target: 'glutes', equipment: 'barbell', type: 'strength', instructions: ['Keep your upper back supported.', 'Drive the hips up and squeeze your glutes.'] },
  { id: 'fallback-calf-raise', name: 'Standing calf raise machine', aliases: ['gemelos en maquina'], bodyPart: 'lower legs', target: 'calves', equipment: 'calf raise machine', type: 'strength', instructions: ['Lower your heels through a comfortable range.', 'Rise onto your toes and pause.'] },
  { id: 'fallback-cable-curl', name: 'Cable biceps curl', aliases: ['curl biceps polea'], bodyPart: 'upper arms', target: 'biceps', equipment: 'cable machine', type: 'strength', instructions: ['Keep your elbows close to your sides.', 'Curl the handle without swinging.'] },
  { id: 'fallback-triceps-pushdown', name: 'Cable triceps pushdown', aliases: ['triceps en polea'], bodyPart: 'upper arms', target: 'triceps', equipment: 'cable machine', type: 'strength', instructions: ['Keep your elbows fixed.', 'Extend your arms and return under control.'] },
  { id: 'fallback-push-up', name: 'Push-up', aliases: ['flexiones'], bodyPart: 'chest', target: 'pectorals', equipment: 'body weight', type: 'strength', instructions: ['Keep your body in a straight line.', 'Lower your chest, then push back up.'] },
  { id: 'fallback-plank', name: 'Plank', aliases: ['plancha'], bodyPart: 'waist', target: 'abs', equipment: 'body weight', type: 'strength', instructions: ['Brace your core and keep a straight line.', 'Hold without letting the hips sag.'] },
  { id: 'fallback-cable-crunch', name: 'Cable crunch', aliases: ['abdominales en polea'], bodyPart: 'waist', target: 'abs', equipment: 'cable machine', type: 'strength', instructions: ['Keep your hips stable.', 'Flex your trunk against the cable resistance.'] },
  { id: 'fallback-run', name: 'Running', aliases: ['correr'], bodyPart: 'cardio', target: 'cardiovascular system', equipment: 'treadmill or body weight', type: 'cardio', instructions: ['Run at a sustainable pace.'] },
  { id: 'fallback-bike', name: 'Stationary cycling', aliases: ['bicicleta fija'], bodyPart: 'cardio', target: 'cardiovascular system', equipment: 'stationary bike', type: 'cardio', instructions: ['Adjust the seat and pedal at a sustainable pace.'] },
  { id: 'fallback-elliptical', name: 'Elliptical trainer', aliases: ['eliptico'], bodyPart: 'cardio', target: 'cardiovascular system', equipment: 'elliptical machine', type: 'cardio', instructions: ['Maintain a stable posture and sustainable pace.'] },
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
  type: item.bodyPart === 'cardio' || String(item.exerciseType || '').toLowerCase() === 'cardio' ? 'cardio' : 'strength',
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
  const bundled = fallbackCatalog.map((item) => normalizeExerciseDb(item));
  const baseUrl = process.env.EXERCISEDB_BASE_URL?.replace(/\/$/, '');
  const apiKey = process.env.EXERCISEDB_API_KEY;
  if (!baseUrl || !apiKey) return bundled;
  try {
    const host = process.env.EXERCISEDB_HOST || new URL(baseUrl).host;
    const data = await fetchJson(`${baseUrl}/exercises?limit=250&offset=0`, {
      headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': host },
    });
    const external = (Array.isArray(data) ? data : data.data || []).filter((item) => (item?.exerciseId || item?.id) && item?.name).map(normalizeExerciseDb);
    const seen = new Set();
    return [...bundled, ...external].filter((exercise) => {
      const key = `${exercise.name.toLowerCase()}:${String(exercise.equipment || '').toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (error) {
    console.warn(`ExerciseDB unavailable, using bundled catalog: ${error.message}`);
    return bundled;
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
