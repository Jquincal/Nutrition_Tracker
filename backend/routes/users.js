import { Router } from 'express';
import { query } from '../db/database.js';
import { validate } from '../middleware/validate.js';
import { userSyncSchema, userUpdateSchema } from '../schemas.js';
import { calculateTdee } from '../services/tdeeService.js';

const router = Router();

router.post('/sync', validate(userSyncSchema), async (req, res) => {
  const { email, name } = req.body;
  const result = await query(
    `INSERT INTO users (clerk_user_id, email, name) VALUES ($1, $2, $3)
     ON CONFLICT (clerk_user_id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, updated_at = NOW()
     RETURNING *`,
    [req.userId, email || null, name || null],
  );
  res.json(result.rows[0]);
});

router.get('/me', async (req, res) => {
  const result = await query('SELECT * FROM users WHERE clerk_user_id = $1', [req.userId]);
  res.json(result.rows[0] || null);
});

router.put('/me', validate(userUpdateSchema), async (req, res) => {
  const current = await query('SELECT * FROM users WHERE clerk_user_id=$1', [req.userId]);
  if (!current.rows[0]) return res.status(404).json({ error: 'User profile not found' });
  const profile = { ...current.rows[0], ...req.body };
  const tdee = calculateTdee({
    sex: profile.sex,
    weightKg: profile.weight_kg,
    heightCm: profile.height_cm,
    age: profile.age,
    activityLevel: profile.activity_level,
  });
  const result = await query(
    `UPDATE users SET protein_goal=$2, calories_goal=$3, carbs_goal=$4, fats_goal=$5, weight_kg=$6,
       sex=$7, height_cm=$8, age=$9, activity_level=$10, tdee_goal=$11, updated_at=NOW()
     WHERE clerk_user_id=$1 RETURNING *`,
    [
      req.userId,
      profile.protein_goal,
      tdee ?? profile.calories_goal,
      profile.carbs_goal,
      profile.fats_goal,
      profile.weight_kg,
      profile.sex,
      profile.height_cm,
      profile.age,
      profile.activity_level,
      tdee,
    ],
  );
  res.json(result.rows[0]);
});

export default router;
