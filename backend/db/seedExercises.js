import 'dotenv/config';
import { pool } from './database.js';
import { enrichWithApiNinjas, loadCuratedCatalog } from '../services/exerciseCatalogService.js';

const exercises = await enrichWithApiNinjas(await loadCuratedCatalog());
let seeded = 0;

try {
  for (const exercise of exercises) {
    await pool.query(
      `INSERT INTO exercises
       (provider,provider_id,name,type,body_part,target_muscle,secondary_muscles,equipment,instructions,gif_url,video_url,provider_data)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (provider,provider_id) DO UPDATE SET
       name=EXCLUDED.name,type=EXCLUDED.type,body_part=EXCLUDED.body_part,target_muscle=EXCLUDED.target_muscle,
       secondary_muscles=EXCLUDED.secondary_muscles,equipment=EXCLUDED.equipment,instructions=EXCLUDED.instructions,
       gif_url=EXCLUDED.gif_url,video_url=EXCLUDED.video_url,provider_data=EXCLUDED.provider_data,updated_at=NOW()`,
      [
        exercise.provider, exercise.providerId, exercise.name, exercise.type, exercise.bodyPart || null,
        exercise.targetMuscle || null, exercise.secondaryMuscles || [], exercise.equipment || null,
        exercise.instructions || [], exercise.gifUrl || null, exercise.videoUrl || null, exercise.providerData || {},
      ],
    );
    seeded += 1;
  }
  console.log(`Seeded ${seeded} exercises`);
} finally {
  await pool.end();
}
