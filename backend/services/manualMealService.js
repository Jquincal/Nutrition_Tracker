import { pool } from '../db/database.js';
import { getUserId } from './userService.js';

export async function createManualMeal(clerkUserId, data) {
  const { name, protein, calories, carbs, fats, serving_size } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userId = await getUserId(client, clerkUserId);
    const food = await client.query(
      `INSERT INTO custom_foods (user_id,name,protein,calories,carbs,fats,serving_size)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [userId, name, protein, calories, carbs, fats, serving_size],
    );
    const meal = await client.query(
      `INSERT INTO meals (user_id,food_name,quantity,unit,protein,calories,carbs,fats)
       VALUES ($1,$2,$3,'g',$4,$5,$6,$7) RETURNING *`,
      [userId, name, serving_size, protein, calories, carbs, fats],
    );
    await client.query('COMMIT');
    return { food: food.rows[0], meal: meal.rows[0] };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
