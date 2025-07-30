-- Drop all RLS policies from cnb_profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.cnb_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.cnb_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.cnb_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.cnb_profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.cnb_profiles;

-- Drop all RLS policies from user_settings table
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON public.user_settings;

-- Disable Row Level Security on both tables
ALTER TABLE public.cnb_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings DISABLE ROW LEVEL SECURITY;