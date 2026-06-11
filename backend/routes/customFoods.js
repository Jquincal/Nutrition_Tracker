import { Router } from 'express';
import { query } from '../db/database.js';
import { validate } from '../middleware/validate.js';
import { customFoodSchema } from '../schemas.js';

const router = Router();

router.get('/', async (req, res) => {
  const result = await query('SELECT * FROM custom_foods WHERE clerk_user_id=$1 ORDER BY name', [req.userId]);
  res.json(result.rows);
});
router.post('/', validate(customFoodSchema), async (req, res) => {
  const { name, protein, calories, carbs, fats, serving_size } = req.body;
  const result = await query(`INSERT INTO custom_foods (clerk_user_id,name,protein,calories,carbs,fats,serving_size) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [req.userId, name, protein || 0, calories || 0, carbs || 0, fats || 0, serving_size || 100]);
  res.status(201).json(result.rows[0]);
});
router.put('/:id', validate(customFoodSchema.partial()), async (req, res) => {
  const { name, protein, calories, carbs, fats, serving_size } = req.body;
  const result = await query(`UPDATE custom_foods SET name=$3, protein=$4, calories=$5, carbs=$6, fats=$7, serving_size=$8 WHERE clerk_user_id=$1 AND id=$2 RETURNING *`, [req.userId, req.params.id, name, protein, calories, carbs, fats, serving_size]);
  res.json(result.rows[0]);
});
router.delete('/:id', async (req, res) => {
  await query('DELETE FROM custom_foods WHERE clerk_user_id=$1 AND id=$2', [req.userId, req.params.id]);
  res.status(204).end();
});
export default router;
