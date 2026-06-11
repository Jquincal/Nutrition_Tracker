import { Router } from 'express';
import { query } from '../db/database.js';

const router = Router();

router.get('/today', async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const [user, meals, workouts] = await Promise.all([
    query('SELECT * FROM users WHERE clerk_user_id=$1', [req.userId]),
    query(`SELECT COALESCE(SUM(protein),0) protein, COALESCE(SUM(calories),0) calories, COALESCE(SUM(carbs),0) carbs, COALESCE(SUM(fats),0) fats FROM meals WHERE clerk_user_id=$1 AND logged_at::date=$2::date`, [req.userId, date]),
    query(`SELECT COALESCE(SUM(calories_burned),0) calories_burned, COUNT(*) workouts FROM workouts WHERE clerk_user_id=$1 AND logged_at::date=$2::date`, [req.userId, date]),
  ]);
  res.json({ date, goals: user.rows[0] || {}, totals: meals.rows[0], activity: workouts.rows[0] });
});

router.get('/week', async (req, res) => {
  const result = await query(
    `SELECT day::date date, COALESCE(SUM(m.protein),0) protein, COALESCE(SUM(m.calories),0) calories
     FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') day
     LEFT JOIN meals m ON m.clerk_user_id=$1 AND m.logged_at::date=day::date GROUP BY day ORDER BY day`,
    [req.userId],
  );
  res.json(result.rows);
});

router.get('/streaks', async (req, res) => {
  const result = await query(`SELECT COUNT(*)::int streak FROM (SELECT DISTINCT logged_at::date FROM meals WHERE clerk_user_id=$1 AND logged_at >= CURRENT_DATE - INTERVAL '30 days') d`, [req.userId]);
  res.json(result.rows[0]);
});
export default router;
