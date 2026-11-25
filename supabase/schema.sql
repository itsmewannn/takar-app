-- ============================================================================
-- TAKAR — Supabase PostgreSQL Schema (Strict Auth & Per-User Isolation)
-- Kalibrasi Makro & Protein Makanan Lokal Berbasis TKPI + Cooking Modifiers
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Tabel Master Makanan Lokal (TKPI Base Values — sebelum pengali minyak/bumbu)
CREATE TABLE IF NOT EXISTS tkpi_foods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  aliases TEXT[] NOT NULL DEFAULT '{}',
  category TEXT NOT NULL CHECK (
    category IN (
      'karbo',
      'protein_hewani',
      'protein_nabati',
      'sayur',
      'sambal_pelengkap'
    )
  ),
  kcal_per_100g NUMERIC(6, 1) NOT NULL CHECK (kcal_per_100g >= 0),
  protein_per_100g NUMERIC(6, 1) NOT NULL CHECK (protein_per_100g >= 0),
  carbs_per_100g NUMERIC(6, 1) NOT NULL CHECK (carbs_per_100g >= 0),
  fat_per_100g NUMERIC(6, 1) NOT NULL CHECK (fat_per_100g >= 0),
  default_unit_type TEXT NOT NULL CHECK (
    default_unit_type IN ('centong', 'potong', 'sdm', 'butir', 'mangkuk')
  ),
  grams_per_unit NUMERIC(6, 1) NOT NULL CHECK (grams_per_unit > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tkpi_foods_category ON tkpi_foods (category);
CREATE INDEX IF NOT EXISTS idx_tkpi_foods_name_trgm ON tkpi_foods USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tkpi_foods_aliases ON tkpi_foods USING GIN (aliases);

-- 2. Tabel Pengali Kalori Tersembunyi (Minyak, Tepung, Santan, Kecap)
CREATE TABLE IF NOT EXISTS cooking_modifiers (
  method_key TEXT PRIMARY KEY CHECK (
    method_key IN (
      'kukus_rebus',
      'panggang',
      'tumis',
      'goreng',
      'goreng_tepung',
      'balado',
      'santan',
      'kecap_manis'
    )
  ),
  label TEXT NOT NULL,
  extra_fat_per_100g NUMERIC(6, 1) NOT NULL DEFAULT 0 CHECK (extra_fat_per_100g >= 0),
  extra_carbs_per_100g NUMERIC(6, 1) NOT NULL DEFAULT 0 CHECK (extra_carbs_per_100g >= 0),
  extra_kcal_per_100g NUMERIC(6, 1) NOT NULL DEFAULT 0 CHECK (extra_kcal_per_100g >= 0)
);

-- 3. Tabel Target Makro Harian User (terisolasi per user_id)
CREATE TABLE IF NOT EXISTS user_targets (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_kcal INTEGER NOT NULL DEFAULT 2200 CHECK (daily_kcal > 0),
  daily_protein_g INTEGER NOT NULL DEFAULT 130 CHECK (daily_protein_g > 0),
  daily_carbs_g INTEGER NOT NULL DEFAULT 250 CHECK (daily_carbs_g >= 0),
  daily_fat_g INTEGER NOT NULL DEFAULT 65 CHECK (daily_fat_g >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_targets
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_user_targets_user_id ON user_targets (user_id);

-- 4. Tabel Log Makan Harian (terisolasi per user_id)
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meal_type TEXT NOT NULL DEFAULT 'makan_siang' CHECK (
    meal_type IN ('sarapan', 'makan_siang', 'makan_malam', 'camilan')
  ),
  image_url TEXT,
  total_kcal INTEGER NOT NULL CHECK (total_kcal >= 0),
  total_protein_g NUMERIC(6, 1) NOT NULL CHECK (total_protein_g >= 0),
  total_carbs_g NUMERIC(6, 1) NOT NULL CHECK (total_carbs_g >= 0),
  total_fat_g NUMERIC(6, 1) NOT NULL CHECK (total_fat_g >= 0),
  reference_calibrated BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE meal_logs
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_meal_logs_logged_at ON meal_logs (logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_logged_at ON meal_logs (user_id, logged_at DESC);

-- 5. Tabel Rincian Item per Log Makan
CREATE TABLE IF NOT EXISTS meal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_log_id UUID NOT NULL REFERENCES meal_logs(id) ON DELETE CASCADE,
  tkpi_food_id TEXT NOT NULL REFERENCES tkpi_foods(id),
  display_name TEXT NOT NULL,
  cooking_method TEXT NOT NULL REFERENCES cooking_modifiers(method_key),
  grams NUMERIC(6, 1) NOT NULL CHECK (grams > 0),
  kcal INTEGER NOT NULL CHECK (kcal >= 0),
  protein_g NUMERIC(6, 1) NOT NULL CHECK (protein_g >= 0),
  carbs_g NUMERIC(6, 1) NOT NULL CHECK (carbs_g >= 0),
  fat_g NUMERIC(6, 1) NOT NULL CHECK (fat_g >= 0),
  hidden_kcal INTEGER NOT NULL DEFAULT 0 CHECK (hidden_kcal >= 0)
);

CREATE INDEX IF NOT EXISTS idx_meal_items_meal_log_id ON meal_items (meal_log_id);

-- Row Level Security (Strict Per-User Isolation menggunakan auth.uid())
ALTER TABLE tkpi_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read tkpi_foods" ON tkpi_foods;
CREATE POLICY "Public read tkpi_foods" ON tkpi_foods FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read cooking_modifiers" ON cooking_modifiers;
CREATE POLICY "Public read cooking_modifiers" ON cooking_modifiers FOR SELECT USING (true);

DROP POLICY IF EXISTS "MVP access user_targets" ON user_targets;
DROP POLICY IF EXISTS "Users manage own user_targets" ON user_targets;
CREATE POLICY "Users manage own user_targets"
  ON user_targets
  FOR ALL
  USING (auth.uid()::text = id OR auth.uid() = user_id)
  WITH CHECK (auth.uid()::text = id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "MVP access meal_logs" ON meal_logs;
DROP POLICY IF EXISTS "Users manage own meal_logs" ON meal_logs;
CREATE POLICY "Users manage own meal_logs"
  ON meal_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "MVP access meal_items" ON meal_items;
DROP POLICY IF EXISTS "Users manage own meal_items" ON meal_items;
CREATE POLICY "Users manage own meal_items"
  ON meal_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM meal_logs ml
      WHERE ml.id = meal_items.meal_log_id
        AND ml.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meal_logs ml
      WHERE ml.id = meal_items.meal_log_id
        AND ml.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. V2: Tabel Profil Tubuh, Program Makan & Streak Konsistensi (user_profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  gender TEXT NOT NULL DEFAULT 'pria' CHECK (gender IN ('pria', 'wanita')),
  age INTEGER NOT NULL DEFAULT 25 CHECK (age BETWEEN 12 AND 100),
  weight_kg NUMERIC(5, 1) NOT NULL DEFAULT 68.0 CHECK (weight_kg BETWEEN 30 AND 250),
  height_cm NUMERIC(5, 1) NOT NULL DEFAULT 170.0 CHECK (height_cm BETWEEN 120 AND 230),
  activity_level TEXT NOT NULL DEFAULT 'moderate' CHECK (
    activity_level IN ('sedentary', 'light', 'moderate', 'active')
  ),
  goal_program TEXT NOT NULL DEFAULT 'rekomposisi' CHECK (
    goal_program IN ('cutting', 'bulking', 'rekomposisi')
  ),
  bmi NUMERIC(4, 1) NOT NULL DEFAULT 23.5,
  tdee_kcal INTEGER NOT NULL DEFAULT 2200,
  target_kcal INTEGER NOT NULL DEFAULT 2200,
  target_protein_g INTEGER NOT NULL DEFAULT 136,
  target_carbs_g INTEGER NOT NULL DEFAULT 235,
  target_fat_g INTEGER NOT NULL DEFAULT 65,
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_logged_date DATE,
  streak_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_celebrated_month INTEGER NOT NULL DEFAULT 0 CHECK (last_celebrated_month >= 0),
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own user_profiles" ON user_profiles;
CREATE POLICY "Users manage own user_profiles"
  ON user_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
