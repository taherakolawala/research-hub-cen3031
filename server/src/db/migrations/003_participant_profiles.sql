-- Participant profiles for students who want to join research studies
CREATE TABLE participant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Availability
  available_days  TEXT[] DEFAULT '{}',
  available_times TEXT[] DEFAULT '{}',
  hours_per_week  INT,
  -- Demographics
  age_range  VARCHAR(20),
  gender     VARCHAR(100),
  ethnicity  VARCHAR(100),
  -- Participation preferences
  study_types      TEXT[] DEFAULT '{}',
  compensation_pref TEXT[] DEFAULT '{}',
  location_pref    VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_participant_profiles_user_id ON participant_profiles(user_id);
