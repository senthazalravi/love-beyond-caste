-- Enable Row Level Security on cnb_profiles table
ALTER TABLE public.cnb_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cnb_profiles table
-- Allow users to view all profiles (for browsing)
CREATE POLICY "Allow users to view all profiles" ON public.cnb_profiles
FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.cnb_profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.cnb_profiles
FOR UPDATE USING (user_id = auth.uid());

-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" ON public.cnb_profiles
FOR DELETE USING (user_id = auth.uid());