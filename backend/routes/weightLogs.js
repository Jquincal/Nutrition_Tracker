import { Router } from 'express';
import { query } from '../db/database.js';
import { validate } from '../middleware/validate.js';
import { weightLogSchema } from '../schemas.js';
import { calculateTdee } from '../services/tdeeService.js';

const router = Router();
const userSql = '(SELECT id FROM users WHERE clerk_user_id=$1)';

async function syncCurrentWeightAndTdee(clerkUserId) {
  const result = await query(
    `SELECT u.*, latest.value_kg FROM users u
     LEFT JOIN LATERAL (
       SELECT value_kg FROM weight_logs WHERE user_id=u.id ORDER BY logged_at DESC LIMIT 1
     ) latest ON TRUE WHERE u.clerk_user_id=$1`,
    [clerkUserId],
  );
  const user = result.rows[0];
  if (!user?.value_kg) return;
  const tdee = calculateTdee({
    sex: user.sex,
    weightKg: user.value_kg,
    heightCm: user.height_cm,
    age: user.age,
    activityLevel: user.activity_level,
  });
  await query(
    `UPDATE users SET weight_kg=$2,tdee_goal=$3,calories_goal=COALESCE($3,calories_goal),updated_at=NOW()
     WHERE clerk_user_id=$1`,
    [clerkUserId, user.value_kg, tdee],
  );
}

router.get('/', async (req, res) => {
  const result = await query(`SELECT * FROM weight_logs WHERE user_id=${userSql} ORDER BY logged_at DESC`, [req.userId]);
  res.json(result.rows);
});

router.get('/weekly', async (req, res) => {
  const result = await query(
    `SELECT date_trunc('week', logged_at)::date week, ROUND(AVG(value_kg), 2) average_kg
     FROM weight_logs WHERE user_id=${userSql}
     GROUP BY date_trunc('week', logged_at) ORDER BY week`,
    [req.userId],
  );
  res.json(result.rows);
});

router.post('/', validate(weightLogSchema), async (req, res) => {
  const result = await query(
    `INSERT INTO weight_logs (user_id,value_kg,logged_at) VALUES (${userSql},$2,COALESCE($3,NOW()))
     ON CONFLICT (user_id, ((logged_at AT TIME ZONE 'UTC')::date))
     DO UPDATE SET value_kg=EXCLUDED.value_kg, logged_at=EXCLUDED.logged_at RETURNING *`,
    [req.userId, req.body.value_kg, req.body.logged_at || null],
  );
  await syncCurrentWeightAndTdee(req.userId);
  res.status(201).json(result.rows[0]);
});

router.put('/:id', validate(weightLogSchema.partial()), async (req, res) => {
  const result = await query(
    `UPDATE weight_logs SET value_kg=COALESCE($3,value_kg), logged_at=COALESCE($4,logged_at)
     WHERE user_id=${userSql} AND id=$2 RETURNING *`,
    [req.userId, req.params.id, req.body.value_kg ?? null, req.body.logged_at || null],
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Weight log not found' });
  await syncCurrentWeightAndTdee(req.userId);
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const result = await query(`DELETE FROM weight_logs WHERE user_id=${userSql} AND id=$2`, [req.userId, req.params.id]);
  if (!result.rowCount) return res.status(404).json({ error: 'Weight log not found' });
  await syncCurrentWeightAndTdee(req.userId);
  res.status(204).end();
});

export default router;
