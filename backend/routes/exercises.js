import { Router } from 'express';
import { query } from '../db/database.js';

const router = Router();

router.get('/', async (req, res) => {
  const search = String(req.query.search || '').trim();
  const muscle = String(req.query.muscle || '').trim();
  const equipment = String(req.query.equipment || '').trim();
  const type = String(req.query.type || '').trim();
  const result = await query(
    `SELECT * FROM exercises
     WHERE ($1='' OR name ILIKE '%' || $1 || '%')
       AND ($2='' OR target_muscle ILIKE '%' || $2 || '%' OR body_part ILIKE '%' || $2 || '%')
       AND ($3='' OR equipment ILIKE '%' || $3 || '%')
       AND ($4='' OR type=$4)
     ORDER BY name LIMIT 100`,
    [search, muscle, equipment, type],
  );
  res.json(result.rows);
});

export default router;
