import { Router } from 'express';
import { query } from '../db/database.js';
import { searchFood } from '../services/nutritionService.js';
import { validate } from '../middleware/validate.js';
import { mealSchema } from '../schemas.js';

const router = Router();
const dayBounds = (date) => [`${date}T00:00:00`, `${date}T23:59:59.999`];

router.get('/search', async (req, res) => {
  const term = String(req.query.q || '').trim();
  if (term.length < 2) return res.json([]);
  const [local, cache, usda] = await Promise.all([
    query(`SELECT id, 'custom' source, name, protein, calories, carbs, fats, serving_size FROM custom_foods WHERE clerk_user_id=$1 AND name ILIKE $2 LIMIT 8`, [req.userId, `%${term}%`]),
    query(`SELECT usda_id, 'cache' source, name, protein, calories, carbs, fats, serving_size FROM foods_cache WHERE name ILIKE $1 LIMIT 8`, [`%${term}%`]),
    searchFood(term).catch(() => []),
  ]);
  res.json([...local.rows, ...cache.rows, ...usda].slice(0, 16));
});

router.get('/', async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const result = await query('SELECT * FROM meals WHERE clerk_user_id=$1 AND logged_at BETWEEN $2 AND $3 ORDER BY logged_at DESC', [req.userId, ...dayBounds(date)]);
  res.json(result.rows);
});

router.post('/', validate(mealSchema), async (req, res) => {
  const { food_name, usda_id, quantity, unit, protein, calories, carbs, fats, meal_type, logged_at } = req.body;
  const result = await query(
    `INSERT INTO meals (clerk_user_id, food_name, usda_id, quantity, unit, protein, calories, carbs, fats, meal_type, logged_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,COALESCE($11,NOW())) RETURNING *`,
    [req.userId, food_name, usda_id || null, quantity, unit || 'g', protein || 0, calories || 0, carbs || 0, fats || 0, meal_type || 'snack', logged_at || null],
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', validate(mealSchema.partial()), async (req, res) => {
  const { quantity, protein, calories, carbs, fats, meal_type } = req.body;
  const result = await query(`UPDATE meals SET quantity=$3, protein=$4, calories=$5, carbs=$6, fats=$7, meal_type=$8 WHERE id=$2 AND clerk_user_id=$1 RETURNING *`, [req.userId, req.params.id, quantity, protein, calories, carbs, fats, meal_type]);
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  await query('DELETE FROM meals WHERE id=$2 AND clerk_user_id=$1', [req.userId, req.params.id]);
  res.status(204).end();
});

export default router;
