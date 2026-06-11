import { Router } from 'express';
import { query } from '../db/database.js';
import { calculateCalories } from '../services/calculatorService.js';
import { validate } from '../middleware/validate.js';
import { workoutSchema } from '../schemas.js';
import { dayRangeSql, getTimeZone } from '../utils/date.js';

const router = Router();
router.get('/', async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const timeZone = getTimeZone(req.query.tz);
  const result = await query(`SELECT * FROM workouts WHERE clerk_user_id=$1 AND ${dayRangeSql()} ORDER BY logged_at DESC`, [req.userId, date, timeZone]);
  res.json(result.rows);
});
router.post('/', validate(workoutSchema), async (req, res) => {
  const { exercise_type, exercise_name, duration_minutes, calories_burned, sets, reps, weight, notes, logged_at } = req.body;
  let calories = calories_burned || 0;
  if (!calories) {
    const user = await query('SELECT weight_kg FROM users WHERE clerk_user_id=$1', [req.userId]);
    calories = calculateCalories(exercise_name, exercise_type, user.rows[0]?.weight_kg || 70, duration_minutes, sets);
  }
  const result = await query(`INSERT INTO workouts (clerk_user_id,exercise_type,exercise_name,duration_minutes,calories_burned,sets,reps,weight,notes,logged_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10,NOW())) RETURNING *`, [req.userId, exercise_type, exercise_name, duration_minutes || 0, calories, sets || null, reps || null, weight || null, notes || null, logged_at || null]);
  res.status(201).json(result.rows[0]);
});
router.delete('/:id', async (req, res) => {
  await query('DELETE FROM workouts WHERE clerk_user_id=$1 AND id=$2', [req.userId, req.params.id]);
  res.status(204).end();
});
export default router;
