-- Add missing columns to users table for GraderX application

-- Add branch column for student's academic branch
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS branch text;

-- Add current_semester column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_semester integer DEFAULT 1;

-- Add current_academic_year column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_academic_year text DEFAULT '2024-25';

-- Add role column (this might already exist from later migration, but add if not)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'student' CHECK (role IN ('student', 'admin'));

-- Add is_lnmiit_email column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_lnmiit_email boolean DEFAULT false;

-- Update the handle_new_user function to include the new columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    user_id,
    email,
    name,
    full_name,
    avatar_url,
    token_identifier,
    created_at,
    updated_at,
    branch,
    current_semester,
    current_academic_year,
    is_lnmiit_email,
    role
  ) VALUES (
    NEW.id,
    NEW.id::text,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    NEW.created_at,
    NEW.updated_at,
    NEW.raw_user_meta_data->>'branch',
    COALESCE((NEW.raw_user_meta_data->>'current_semester')::integer, 1),
    COALESCE(NEW.raw_user_meta_data->>'current_academic_year', '2024-25'),
    CASE WHEN NEW.email LIKE '%@lnmiit.ac.in' THEN true ELSE false END,
    CASE WHEN NEW.email = 'admin@lnmiit.ac.in' THEN 'admin' ELSE 'student' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_user_update function as well
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    email = NEW.email,
    name = NEW.raw_user_meta_data->>'name',
    full_name = NEW.raw_user_meta_data->>'full_name',
    avatar_url = NEW.raw_user_meta_data->>'avatar_url',
    updated_at = NEW.updated_at,
    branch = NEW.raw_user_meta_data->>'branch',
    current_semester = COALESCE((NEW.raw_user_meta_data->>'current_semester')::integer, current_semester),
    current_academic_year = COALESCE(NEW.raw_user_meta_data->>'current_academic_year', current_academic_year),
    is_lnmiit_email = CASE WHEN NEW.email LIKE '%@lnmiit.ac.in' THEN true ELSE false END
  WHERE user_id = NEW.id::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 