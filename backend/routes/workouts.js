import { Router } from 'express';
import { pool, query } from '../db/database.js';
import { validate } from '../middleware/validate.js';
import { workoutInputSchema } from '../schemas.js';
import { getUserId } from '../services/userService.js';
import { calculateCalories, getEffectiveMinutes } from '../services/calculatorService.js';
import { dayRangeSql, getTimeZone } from '../utils/date.js';

const router = Router();
const workoutSelect = `
  SELECT w.*, COALESCE(SUM(s.calories_burned),0) calories_burned,
    COALESCE(json_agg(json_build_object(
      'id',s.id,'exercise_id',s.exercise_id,'exercise_name',e.name,'exercise_type',e.type,
      'weight_kg',s.weight_kg,'reps',s.reps,'duration_minutes',s.duration_minutes,
      'calories_burned',s.calories_burned,'set_order',s.set_order,'notes',s.notes
    ) ORDER BY s.set_order) FILTER (WHERE s.id IS NOT NULL), '[]') sets
  FROM workouts w LEFT JOIN sets s ON s.workout_id=w.id LEFT JOIN exercises e ON e.id=s.exercise_id`;

const normalizeType = (type) => (['strength', 'fuerza'].includes(type) ? 'strength' : 'cardio');

async function findOrCreateLegacyExercise(client, userId, workout) {
  const type = normalizeType(workout.exercise_type);
  const existing = await client.query(
    `SELECT id FROM exercises
     WHERE (user_id=$1 OR user_id IS NULL) AND LOWER(name)=LOWER($2)
     ORDER BY (user_id=$1) DESC LIMIT 1`,
    [userId, workout.exercise_name],
  );
  if (existing.rows[0]) return existing.rows[0].id;

  const created = await client.query(
    `INSERT INTO exercises (user_id,provider,provider_id,name,type,body_part,target_muscle,equipment,instructions,provider_data)
     VALUES ($1,'manual',$2,$3,$4,$5,$5,$6,$7,$8) RETURNING id`,
    [
      userId,
      `legacy-${userId}-${workout.exercise_name.toLowerCase().replace(/\s+/g, '-')}`,
      workout.exercise_name,
      type,
      type === 'cardio' ? 'cardio' : null,
      type === 'cardio' ? 'body weight' : null,
      [],
      { migratedFrom: 'legacy-workout-payload' },
    ],
  );
  return created.rows[0].id;
}

async function normalizeWorkoutBody(client, userId, body) {
  if (Array.isArray(body.sets)) return body;

  const exerciseId = await findOrCreateLegacyExercise(client, userId, body);
  const setCount = Math.max(1, Number(body.sets || 1));
  return {
    name: body.exercise_name,
    notes: body.notes || null,
    logged_at: body.logged_at || null,
    sets: Array.from({ length: setCount }, (_, index) => ({
      exercise_id: exerciseId,
      weight_kg: body.weight ?? null,
      reps: body.reps ?? null,
      duration_minutes: body.duration_minutes ?? null,
      calories_burned: body.calories_burned ? Number(body.calories_burned) / setCount : null,
      set_order: index + 1,
      notes: null,
    })),
  };
}

router.get('/', async (req, res) => {
  const date = req.query.date;
  const timeZone = getTimeZone(req.query.tz);
  const params = [req.userId];
  const dateFilter = date ? `AND ${dayRangeSql('w.logged_at', 2, 3)}` : '';
  if (date) params.push(date, timeZone);
  const result = await query(
    `${workoutSelect} WHERE w.user_id=(SELECT id FROM users WHERE clerk_user_id=$1) ${dateFilter}
     GROUP BY w.id ORDER BY w.logged_at DESC`,
    params,
  );
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const result = await query(
    `${workoutSelect} WHERE w.user_id=(SELECT id FROM users WHERE clerk_user_id=$1) AND w.id=$2 GROUP BY w.id`,
    [req.userId, req.params.id],
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Workout not found' });
  res.json(result.rows[0]);
});

async function saveWorkout(req, res, workoutId = null) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userId = await getUserId(client, req.userId);
    const workout = await normalizeWorkoutBody(client, userId, req.body);
    const user = await client.query('SELECT weight_kg FROM users WHERE id=$1', [userId]);
    let id = workoutId;
    if (id) {
      const updated = await client.query(
        `UPDATE workouts SET name=$3,notes=$4,logged_at=COALESCE($5,logged_at),updated_at=NOW()
         WHERE id=$2 AND user_id=$1 RETURNING id`,
        [userId, id, workout.name, workout.notes || null, workout.logged_at || null],
      );
      if (!updated.rowCount) {
        const error = new Error('Workout not found');
        error.status = 404;
        throw error;
      }
      await client.query('DELETE FROM sets WHERE workout_id=$1', [id]);
    } else {
      const created = await client.query(
        `INSERT INTO workouts (user_id,name,notes,logged_at) VALUES ($1,$2,$3,COALESCE($4,NOW())) RETURNING id`,
        [userId, workout.name, workout.notes || null, workout.logged_at || null],
      );
      id = created.rows[0].id;
    }
    for (const [index, set] of workout.sets.entries()) {
      const exercise = await client.query(
        'SELECT name,type FROM exercises WHERE id=$1 AND (user_id IS NULL OR user_id=$2)',
        [set.exercise_id, userId],
      );
      if (!exercise.rows[0]) {
        const error = new Error('Exercise not found');
        error.status = 400;
        throw error;
      }
      const durationMinutes = getEffectiveMinutes(exercise.rows[0].type, set.duration_minutes, 1);
      const calories = set.calories_burned || calculateCalories(
        exercise.rows[0].name,
        exercise.rows[0].type,
        user.rows[0]?.weight_kg || 70,
        durationMinutes,
        1,
      );
      await client.query(
        `INSERT INTO sets (workout_id,exercise_id,weight_kg,reps,duration_minutes,calories_burned,set_order,notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [id, set.exercise_id, set.weight_kg ?? null, set.reps ?? null, durationMinutes, calories, set.set_order || index + 1, set.notes || null],
      );
    }
    await client.query('COMMIT');
    const result = await query(`${workoutSelect} WHERE w.id=$1 GROUP BY w.id`, [id]);
    res.status(workoutId ? 200 : 201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

router.post('/', validate(workoutInputSchema), (req, res, next) => saveWorkout(req, res).catch(next));
router.put('/:id', validate(workoutInputSchema), (req, res, next) => saveWorkout(req, res, req.params.id).catch(next));
router.delete('/:id', async (req, res) => {
  const result = await query('DELETE FROM workouts WHERE user_id=(SELECT id FROM users WHERE clerk_user_id=$1) AND id=$2', [req.userId, req.params.id]);
  if (!result.rowCount) return res.status(404).json({ error: 'Workout not found' });
  res.status(204).end();
});

export default router;
