-- ResearchHub initial schema
-- Run with: psql $DATABASE_URL -f 001_initial.sql

-- User roles enum
CREATE TYPE user_role AS ENUM ('student', 'pi');

-- Year level enum for students
CREATE TYPE year_level AS ENUM ('freshman', 'sophomore', 'junior', 'senior', 'grad');

-- Application status enum
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student profiles
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  major VARCHAR(200),
  gpa DECIMAL(3, 2),
  graduation_year INT,
  skills TEXT[] DEFAULT '{}',
  bio TEXT,
  resume_url TEXT,
  year_level year_level,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PI profiles
CREATE TABLE pi_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department VARCHAR(200),
  lab_name VARCHAR(200),
  research_area TEXT,
  lab_website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Positions
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pi_id UUID NOT NULL REFERENCES pi_profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  required_skills TEXT[] DEFAULT '{}',
  min_gpa DECIMAL(3, 2),
  is_funded BOOLEAN DEFAULT false,
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deadline DATE
);

-- Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'pending',
  cover_letter TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(position_id, student_id)
);

-- Indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_pi_profiles_user_id ON pi_profiles(user_id);
CREATE INDEX idx_positions_pi_id ON positions(pi_id);
CREATE INDEX idx_positions_is_open ON positions(is_open);
CREATE INDEX idx_applications_position_id ON applications(position_id);
CREATE INDEX idx_applications_student_id ON applications(student_id);
