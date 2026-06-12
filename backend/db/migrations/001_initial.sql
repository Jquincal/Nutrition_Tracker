CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  weight_kg NUMERIC(7,2) DEFAULT 70,
  protein_goal NUMERIC(8,2) DEFAULT 150,
  calories_goal NUMERIC(8,2) DEFAULT 2500,
  carbs_goal NUMERIC(8,2) DEFAULT 300,
  fats_goal NUMERIC(8,2) DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meals (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  usda_id TEXT,
  quantity NUMERIC(10,2) NOT NULL,
  unit TEXT DEFAULT 'g',
  protein NUMERIC(10,2) DEFAULT 0,
  calories NUMERIC(10,2) DEFAULT 0,
  carbs NUMERIC(10,2) DEFAULT 0,
  fats NUMERIC(10,2) DEFAULT 0,
  meal_type TEXT DEFAULT 'snack',
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS custom_foods (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  protein NUMERIC(10,2) DEFAULT 0,
  calories NUMERIC(10,2) DEFAULT 0,
  carbs NUMERIC(10,2) DEFAULT 0,
  fats NUMERIC(10,2) DEFAULT 0,
  serving_size NUMERIC(10,2) DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workouts (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  exercise_type TEXT DEFAULT 'cardio',
  duration_minutes INTEGER DEFAULT 0,
  calories_burned NUMERIC(10,2) DEFAULT 0,
  sets INTEGER,
  reps INTEGER,
  weight NUMERIC(8,2),
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS foods_cache (
  id BIGSERIAL PRIMARY KEY,
  usda_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  protein NUMERIC(10,2) DEFAULT 0,
  calories NUMERIC(10,2) DEFAULT 0,
  carbs NUMERIC(10,2) DEFAULT 0,
  fats NUMERIC(10,2) DEFAULT 0,
  serving_size NUMERIC(10,2) DEFAULT 100,
  cached_at TIMESTAMPTZ DEFAULT NOW()
);
