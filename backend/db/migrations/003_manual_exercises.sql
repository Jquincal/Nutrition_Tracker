ALTER TABLE exercises ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_exercises_user ON exercises(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_manual_exercises_user_name
  ON exercises(user_id, LOWER(name))
  WHERE provider = 'manual';

ALTER TABLE sets DROP CONSTRAINT IF EXISTS sets_exercise_id_fkey;
ALTER TABLE sets ADD CONSTRAINT sets_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES exercises(id);
