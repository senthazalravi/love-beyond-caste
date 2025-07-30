-- Add age column to cnb_profiles table
ALTER TABLE public.cnb_profiles 
ADD COLUMN age INTEGER;

-- Update existing rows to calculate age from date_of_birth
UPDATE public.cnb_profiles 
SET age = EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))
WHERE date_of_birth IS NOT NULL;

-- For rows without date_of_birth, you may want to set a default age or leave as NULL
-- Uncomment the line below if you want to set a default age for rows without date_of_birth
-- UPDATE public.cnb_profiles SET age = 25 WHERE age IS NULL;