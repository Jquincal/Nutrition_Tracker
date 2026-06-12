import { Router } from 'express';
import { query } from '../db/database.js';
import { validate } from '../middleware/validate.js';
import { customFoodSchema } from '../schemas.js';
import { createManualMeal } from '../services/manualMealService.js';

const router = Router();

router.get('/', async (req, res) => {
  const result = await query('SELECT * FROM custom_foods WHERE user_id=(SELECT id FROM users WHERE clerk_user_id=$1) ORDER BY name', [req.userId]);
  res.json(result.rows);
});
router.post('/', validate(customFoodSchema), async (req, res) => {
  res.status(201).json(await createManualMeal(req.userId, req.body));
});
router.put('/:id', validate(customFoodSchema.partial()), async (req, res) => {
  const { name, protein, calories, carbs, fats, serving_size } = req.body;
  const result = await query(`UPDATE custom_foods SET name=$3, protein=$4, calories=$5, carbs=$6, fats=$7, serving_size=$8 WHERE user_id=(SELECT id FROM users WHERE clerk_user_id=$1) AND id=$2 RETURNING *`, [req.userId, req.params.id, name, protein, calories, carbs, fats, serving_size]);
  res.json(result.rows[0]);
});
router.delete('/:id', async (req, res) => {
  await query('DELETE FROM custom_foods WHERE user_id=(SELECT id FROM users WHERE clerk_user_id=$1) AND id=$2', [req.userId, req.params.id]);
  res.status(204).end();
});
export default router;
