import { Router } from 'express';
import { pool, query } from '../db/database.js';
import { searchFood } from '../services/nutritionService.js';
import { validate } from '../middleware/validate.js';
import { customFoodSchema, mealSchema } from '../schemas.js';
import { dayRangeSql, getTimeZone } from '../utils/date.js';

const router = Router();

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
  const timeZone = getTimeZone(req.query.tz);
  const result = await query(`SELECT * FROM meals WHERE clerk_user_id=$1 AND ${dayRangeSql()} ORDER BY logged_at DESC`, [req.userId, date, timeZone]);
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

router.post('/manual', validate(customFoodSchema), async (req, res) => {
  const { name, protein, calories, carbs, fats, serving_size } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const food = await client.query(
      `INSERT INTO custom_foods (clerk_user_id,name,protein,calories,carbs,fats,serving_size)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.userId, name, protein, calories, carbs, fats, serving_size],
    );
    const meal = await client.query(
      `INSERT INTO meals (clerk_user_id,food_name,quantity,unit,protein,calories,carbs,fats)
       VALUES ($1,$2,$3,'g',$4,$5,$6,$7) RETURNING *`,
      [req.userId, name, serving_size, protein, calories, carbs, fats],
    );
    await client.query('COMMIT');
    res.status(201).json({ food: food.rows[0], meal: meal.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
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
