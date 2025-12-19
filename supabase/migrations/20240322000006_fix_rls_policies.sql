-- Fix RLS policies to allow user registration

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view own data" ON public.users;

-- Create comprehensive policies for users table
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage all users" ON public.users
  FOR ALL USING (current_setting('role') = 'service_role');

-- Enable realtime for users table
alter publication supabase_realtime add table users;