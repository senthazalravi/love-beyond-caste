-- Add about_me field to cnb_profiles table
ALTER TABLE public.cnb_profiles 
ADD COLUMN about_me TEXT;

-- Update existing users with dummy text for about_me field
UPDATE public.cnb_profiles 
SET about_me = 'Hello! I am looking for a meaningful relationship and believe in love beyond boundaries. I value honesty, respect, and genuine connections. Looking forward to meeting someone special who shares similar values and is ready for a committed relationship.'
WHERE about_me IS NULL;

-- Create user_settings table for user preferences and settings
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  profile_visibility BOOLEAN DEFAULT true,
  show_whatsapp_publicly BOOLEAN DEFAULT true,
  show_email_publicly BOOLEAN DEFAULT false,
  theme_preference TEXT DEFAULT 'system',
  language_preference TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_settings table
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_settings
CREATE POLICY "Users can view their own settings" ON public.user_settings
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own settings" ON public.user_settings
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own settings" ON public.user_settings
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own settings" ON public.user_settings
FOR DELETE USING (user_id = auth.uid());

-- Add trigger for updated_at timestamp on user_settings
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();