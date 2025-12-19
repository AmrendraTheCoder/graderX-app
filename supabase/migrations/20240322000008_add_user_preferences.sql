-- Add user preferences for semester and academic year
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_semester integer DEFAULT 1;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_academic_year text DEFAULT '2024-25';

-- Create admin user (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@lnmiit.ac.in') THEN
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      gen_random_uuid(),
      'admin@lnmiit.ac.in',
      crypt('admin123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Admin User"}',
      false,
      'authenticated'
    );
  END IF;
END $$;

-- Insert admin user into public.users table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@lnmiit.ac.in') THEN
    INSERT INTO public.users (
      id,
      email,
      name,
      full_name,
      role,
      token_identifier,
      created_at
    ) 
    SELECT 
      id,
      email,
      'Admin User',
      'Admin User',
      'admin',
      id,
      now()
    FROM auth.users 
    WHERE email = 'admin@lnmiit.ac.in'
    AND NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@lnmiit.ac.in');
    
    -- Update existing user role if already exists
    UPDATE public.users 
    SET role = 'admin' 
    WHERE email = 'admin@lnmiit.ac.in' AND role != 'admin';
  END IF;
END $$;