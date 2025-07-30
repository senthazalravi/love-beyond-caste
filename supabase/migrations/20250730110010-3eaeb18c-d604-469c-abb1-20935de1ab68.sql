-- Drop all RLS policies on user_settings table
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON public.user_settings;

-- Also disable RLS on the user_settings table
ALTER TABLE public.user_settings DISABLE ROW LEVEL SECURITY;