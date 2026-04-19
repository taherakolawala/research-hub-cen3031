-- PBI-34: labeled external links on student profile (max 5; validated http/https)
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS profile_links jsonb NOT NULL DEFAULT '[]'::jsonb;
