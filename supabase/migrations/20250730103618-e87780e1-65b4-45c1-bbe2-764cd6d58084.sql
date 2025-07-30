-- Drop all RLS policies on cnb_profiles table
DROP POLICY IF EXISTS "Users can create their own profile" ON public.cnb_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.cnb_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.cnb_profiles;

-- Optionally disable RLS entirely on the table (SECURITY RISK!)
-- ALTER TABLE public.cnb_profiles DISABLE ROW LEVEL SECURITY;