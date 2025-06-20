/*
  # Storage Setup for Bookmart

  1. Storage Buckets
    - `book-images` - For storing book photos uploaded by sellers
    - `avatars` - For storing user profile pictures

  2. Storage Policies
    - Public read access for book images
    - Authenticated users can upload images
    - Users can only delete their own images
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('book-images', 'book-images', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Book images storage policies
CREATE POLICY "Book images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'book-images');

CREATE POLICY "Authenticated users can upload book images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'book-images');

CREATE POLICY "Users can update their own book images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'book-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own book images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'book-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Avatar storage policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatars"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);