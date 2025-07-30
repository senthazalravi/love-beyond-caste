-- Drop all RLS policies on cnb_profiles table
DROP POLICY IF EXISTS "Allow users to view all profiles" ON public.cnb_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.cnb_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.cnb_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.cnb_profiles;

-- Also disable RLS on the table if needed for troubleshooting
ALTER TABLE public.cnb_profiles DISABLE ROW LEVEL SECURITY;