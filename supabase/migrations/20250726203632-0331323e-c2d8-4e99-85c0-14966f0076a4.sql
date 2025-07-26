-- Create bucket for car images with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images', 'car-images', true)
ON CONFLICT (id) DO NOTHING;

-- Add a policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload car images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'car-images');

-- Add a policy to allow anyone to read images (public access)
CREATE POLICY "Allow public to read car images" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'car-images');