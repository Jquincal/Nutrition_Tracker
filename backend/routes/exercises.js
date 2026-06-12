import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { query } from '../db/database.js';
import { validate } from '../middleware/validate.js';
import { exerciseSchema } from '../schemas.js';

const router = Router();
const userSql = '(SELECT id FROM users WHERE clerk_user_id=$1)';

router.get('/', async (req, res) => {
  const search = String(req.query.search || '').trim();
  const muscle = String(req.query.muscle || '').trim();
  const equipment = String(req.query.equipment || '').trim();
  const type = String(req.query.type || '').trim();
  const result = await query(
    `SELECT * FROM exercises
     WHERE (user_id IS NULL OR user_id=${userSql})
       AND ($2='' OR name ILIKE '%' || $2 || '%' OR provider_data::text ILIKE '%' || $2 || '%')
       AND ($3='' OR target_muscle ILIKE '%' || $3 || '%' OR body_part ILIKE '%' || $3 || '%')
       AND ($4='' OR equipment ILIKE '%' || $4 || '%')
       AND ($5='' OR type=$5)
     ORDER BY (provider='manual') DESC, name LIMIT 150`,
    [req.userId, search, muscle, equipment, type],
  );
  res.json(result.rows);
});

router.post('/', validate(exerciseSchema), async (req, res) => {
  const { name, type, body_part, target_muscle, equipment, instructions } = req.body;
  const result = await query(
    `INSERT INTO exercises
     (user_id,provider,provider_id,name,type,body_part,target_muscle,equipment,instructions,provider_data)
     VALUES (${userSql},'manual',$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [req.userId, randomUUID(), name, type, body_part || null, target_muscle || null, equipment || null, instructions, { aliases: [] }],
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', validate(exerciseSchema.partial()), async (req, res) => {
  const current = await query(`SELECT * FROM exercises WHERE id=$2 AND user_id=${userSql} AND provider='manual'`, [req.userId, req.params.id]);
  if (!current.rows[0]) return res.status(404).json({ error: 'Manual exercise not found' });
  const exercise = { ...current.rows[0], ...req.body };
  const result = await query(
    `UPDATE exercises SET name=$3,type=$4,body_part=$5,target_muscle=$6,equipment=$7,instructions=$8,updated_at=NOW()
     WHERE id=$2 AND user_id=${userSql} AND provider='manual' RETURNING *`,
    [req.userId, req.params.id, exercise.name, exercise.type, exercise.body_part, exercise.target_muscle, exercise.equipment, exercise.instructions],
  );
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const usage = await query(
    `SELECT COUNT(*)::int count FROM sets s JOIN exercises e ON e.id=s.exercise_id
     WHERE e.id=$2 AND e.user_id=${userSql} AND e.provider='manual'`,
    [req.userId, req.params.id],
  );
  if (usage.rows[0].count) return res.status(409).json({ error: 'Exercise is used in workout history' });
  const result = await query(`DELETE FROM exercises WHERE id=$2 AND user_id=${userSql} AND provider='manual'`, [req.userId, req.params.id]);
  if (!result.rowCount) return res.status(404).json({ error: 'Manual exercise not found' });
  res.status(204).end();
});

export default router;
