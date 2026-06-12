import { Router } from 'express';
import { query } from '../db/database.js';
import { dayRangeSql, getTimeZone } from '../utils/date.js';

const router = Router();

router.get('/today', async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const timeZone = getTimeZone(req.query.tz);
  const [user, meals, workouts] = await Promise.all([
    query('SELECT * FROM users WHERE clerk_user_id=$1', [req.userId]),
    query(`SELECT COALESCE(SUM(protein),0) protein, COALESCE(SUM(calories),0) calories, COALESCE(SUM(carbs),0) carbs, COALESCE(SUM(fats),0) fats FROM meals WHERE user_id=(SELECT id FROM users WHERE clerk_user_id=$1) AND ${dayRangeSql()}`, [req.userId, date, timeZone]),
    query(`SELECT COALESCE(SUM(s.calories_burned),0) calories_burned, COUNT(DISTINCT w.id) workouts FROM workouts w LEFT JOIN sets s ON s.workout_id=w.id WHERE w.user_id=(SELECT id FROM users WHERE clerk_user_id=$1) AND ${dayRangeSql('w.logged_at')}`, [req.userId, date, timeZone]),
  ]);
  res.json({ date, goals: user.rows[0] || {}, totals: meals.rows[0], activity: workouts.rows[0] });
});

router.get('/week', async (req, res) => {
  const timeZone = getTimeZone(req.query.tz);
  const result = await query(
    `WITH days AS (
       SELECT generate_series(
         (CURRENT_TIMESTAMP AT TIME ZONE $2)::date - INTERVAL '6 days',
         (CURRENT_TIMESTAMP AT TIME ZONE $2)::date,
         INTERVAL '1 day'
       )::date AS local_date
     )
     SELECT local_date AS date, COALESCE(SUM(m.protein),0) protein, COALESCE(SUM(m.calories),0) calories
     FROM days
     LEFT JOIN meals m ON m.user_id=(SELECT id FROM users WHERE clerk_user_id=$1) AND (m.logged_at AT TIME ZONE $2)::date=local_date
     GROUP BY local_date ORDER BY local_date`,
    [req.userId, timeZone],
  );
  res.json(result.rows);
});

router.get('/streaks', async (req, res) => {
  const result = await query(`SELECT COUNT(*)::int streak FROM (SELECT DISTINCT logged_at::date FROM meals WHERE user_id=(SELECT id FROM users WHERE clerk_user_id=$1) AND logged_at >= CURRENT_DATE - INTERVAL '30 days') d`, [req.userId]);
  res.json(result.rows[0]);
});
export default router;
