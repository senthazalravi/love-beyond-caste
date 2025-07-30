-- Enable Row Level Security on cnb_profiles table
ALTER TABLE public.cnb_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for cnb_profiles
CREATE POLICY "Users can view their own profile" 
ON public.cnb_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.cnb_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.cnb_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" 
ON public.cnb_profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow authenticated users to view all profiles for browsing
CREATE POLICY "Authenticated users can view all profiles" 
ON public.cnb_profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Enable Row Level Security on user_settings table
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_settings
CREATE POLICY "Users can view their own settings" 
ON public.user_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.user_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.user_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" 
ON public.user_settings 
FOR DELETE 
USING (auth.uid() = user_id);