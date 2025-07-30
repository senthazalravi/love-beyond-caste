-- Fix storage bucket policies for cnb-photos bucket to allow uploads
-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "users can update their own avatar" ON storage.objects;

-- Create permissive policies for cnb-photos bucket
CREATE POLICY "Public read access for cnb-photos" ON storage.objects
FOR SELECT USING (bucket_id = 'cnb-photos');

CREATE POLICY "Allow uploads to cnb-photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'cnb-photos');

CREATE POLICY "Allow updates to cnb-photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'cnb-photos');