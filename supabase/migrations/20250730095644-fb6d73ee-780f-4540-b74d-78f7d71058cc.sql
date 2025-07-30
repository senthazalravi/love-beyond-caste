-- Create profiles table
CREATE TABLE public.cnb_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  whatsapp_number TEXT NOT NULL UNIQUE,
  password_pin TEXT NOT NULL,
  name TEXT NOT NULL,
  date_of_birth DATE,
  profession TEXT,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  photo_url TEXT,
  marriage_timeframe TEXT,
  city TEXT,
  email TEXT,
  consent_no_dowry BOOLEAN DEFAULT FALSE,
  consent_medical_report BOOLEAN DEFAULT FALSE,
  consent_any_caste BOOLEAN DEFAULT FALSE,
  consent_any_religion BOOLEAN DEFAULT FALSE,
  consent_share_contact BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cnb_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.cnb_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own profile" 
ON public.cnb_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.cnb_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('cnb-photos', 'cnb-photos', true);

-- Create storage policies
CREATE POLICY "Photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cnb-photos');

CREATE POLICY "Users can upload their own photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cnb-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'cnb-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cnb_profiles_updated_at
BEFORE UPDATE ON public.cnb_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert admin profile
INSERT INTO public.cnb_profiles (
  id,
  user_id,
  whatsapp_number,
  password_pin,
  name,
  is_admin
) VALUES (
  gen_random_uuid(),
  gen_random_uuid(),
  '+46733115830',
  '0000',
  'Admin User',
  true
);