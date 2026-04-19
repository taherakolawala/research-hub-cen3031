-- Run in Supabase Dashboard → SQL Editor (not in plain Postgres).
-- Creates the public "Resumes" bucket used by POST /api/students/resume.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'Resumes',
  'Resumes',
  true,
  5242880,
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Allow anyone to read objects (required for public resume links in the app).
DROP POLICY IF EXISTS "Public read Resumes bucket" ON storage.objects;
CREATE POLICY "Public read Resumes bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'Resumes');
