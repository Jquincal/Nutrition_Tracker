ALTER TABLE users
  ADD COLUMN IF NOT EXISTS sex TEXT,
  ADD COLUMN IF NOT EXISTS height_cm NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS activity_level TEXT,
  ADD COLUMN IF NOT EXISTS tdee_goal NUMERIC(8,2);

ALTER TABLE meals ADD COLUMN IF NOT EXISTS user_id BIGINT;
UPDATE meals m SET user_id = u.id FROM users u WHERE m.user_id IS NULL AND m.clerk_user_id = u.clerk_user_id;
ALTER TABLE meals ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE meals DROP COLUMN IF EXISTS clerk_user_id CASCADE;
ALTER TABLE meals DROP CONSTRAINT IF EXISTS meals_user_id_fkey;
ALTER TABLE meals ADD CONSTRAINT meals_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE custom_foods ADD COLUMN IF NOT EXISTS user_id BIGINT;
UPDATE custom_foods f SET user_id = u.id FROM users u WHERE f.user_id IS NULL AND f.clerk_user_id = u.clerk_user_id;
ALTER TABLE custom_foods ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE custom_foods DROP COLUMN IF EXISTS clerk_user_id CASCADE;
ALTER TABLE custom_foods DROP CONSTRAINT IF EXISTS custom_foods_user_id_fkey;
ALTER TABLE custom_foods ADD CONSTRAINT custom_foods_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

DROP TABLE IF EXISTS sets;
DROP TABLE IF EXISTS workouts CASCADE;

CREATE TABLE workouts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Workout',
  notes TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exercises (
  id BIGSERIAL PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'manual',
  provider_id TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'strength',
  body_part TEXT,
  target_muscle TEXT,
  secondary_muscles TEXT[] NOT NULL DEFAULT '{}',
  equipment TEXT,
  instructions TEXT[] NOT NULL DEFAULT '{}',
  gif_url TEXT,
  video_url TEXT,
  provider_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

CREATE TABLE sets (
  id BIGSERIAL PRIMARY KEY,
  workout_id BIGINT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id BIGINT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  weight_kg NUMERIC(8,2),
  reps INTEGER,
  duration_minutes NUMERIC(8,2),
  calories_burned NUMERIC(10,2) NOT NULL DEFAULT 0,
  set_order INTEGER NOT NULL DEFAULT 1,
  notes TEXT
);

CREATE TABLE weight_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value_kg NUMERIC(7,2) NOT NULL CHECK (value_kg > 0),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_custom_foods_user ON custom_foods(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_sets_workout_order ON sets(workout_id, set_order);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON weight_logs(user_id, logged_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_weight_logs_user_day ON weight_logs(user_id, ((logged_at AT TIME ZONE 'UTC')::date));
CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON exercises(LOWER(target_muscle));
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises(LOWER(equipment));
