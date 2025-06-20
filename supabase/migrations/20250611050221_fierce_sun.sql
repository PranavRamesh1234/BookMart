/*
  # Bookmart Database Schema Setup

  1. New Tables
    - `profiles` - User profile information extending Supabase auth
      - `id` (uuid, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `phone` (text)
      - `avatar_url` (text)
      - `location` (text)
      - `created_at` (timestamp)

    - `books` - Book listings from sellers
      - `id` (uuid, primary key)
      - `seller_id` (uuid, references profiles)
      - `title` (text)
      - `author` (text)
      - `description` (text)
      - `condition` (enum: new, like_new, good, fair, poor)
      - `price` (decimal)
      - `price_type` (enum: fixed, negotiable, price_on_call)
      - `genre` (text)
      - `year_published` (integer)
      - `language` (text)
      - `images` (text array)
      - `location` (text)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `seller_contact_phone` (text)
      - `seller_contact_email` (text)
      - `is_available` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `book_requests` - Buyer requests for specific books
      - `id` (uuid, primary key)
      - `requester_id` (uuid, references profiles)
      - `title` (text)
      - `author` (text)
      - `description` (text)
      - `max_price` (decimal)
      - `preferred_condition` (text)
      - `genre` (text)
      - `location` (text)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `contact_phone` (text)
      - `contact_email` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Storage
    - `book-images` bucket for storing book photos
    - Public access for viewing images
    - Authenticated users can upload images

  3. Security
    - Enable RLS on all tables
    - Users can read all public data
    - Users can only modify their own data
    - Proper policies for book listings and requests
*/

-- Create custom types
CREATE TYPE book_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');
CREATE TYPE price_type AS ENUM ('fixed', 'negotiable', 'price_on_call');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  location text,
  created_at timestamptz DEFAULT now()
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  author text NOT NULL,
  description text,
  condition book_condition NOT NULL,
  price decimal(10,2),
  price_type price_type NOT NULL DEFAULT 'fixed',
  genre text,
  year_published integer,
  language text DEFAULT 'English',
  images text[] DEFAULT '{}',
  location text NOT NULL,
  latitude decimal(10,8) NOT NULL,
  longitude decimal(11,8) NOT NULL,
  seller_contact_phone text,
  seller_contact_email text NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create book_requests table
CREATE TABLE IF NOT EXISTS book_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  author text,
  description text,
  max_price decimal(10,2),
  preferred_condition text,
  genre text,
  location text NOT NULL,
  latitude decimal(10,8) NOT NULL,
  longitude decimal(11,8) NOT NULL,
  contact_phone text,
  contact_email text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Books policies
CREATE POLICY "Books are viewable by everyone"
  ON books
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert books"
  ON books
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own books"
  ON books
  FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own books"
  ON books
  FOR DELETE
  USING (auth.uid() = seller_id);

-- Book requests policies
CREATE POLICY "Book requests are viewable by everyone"
  ON book_requests
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert book requests"
  ON book_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own book requests"
  ON book_requests
  FOR UPDATE
  USING (auth.uid() = requester_id);

CREATE POLICY "Users can delete their own book requests"
  ON book_requests
  FOR DELETE
  USING (auth.uid() = requester_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS books_seller_id_idx ON books(seller_id);
CREATE INDEX IF NOT EXISTS books_location_idx ON books(location);
CREATE INDEX IF NOT EXISTS books_genre_idx ON books(genre);
CREATE INDEX IF NOT EXISTS books_condition_idx ON books(condition);
CREATE INDEX IF NOT EXISTS books_price_idx ON books(price);
CREATE INDEX IF NOT EXISTS books_created_at_idx ON books(created_at);
CREATE INDEX IF NOT EXISTS books_is_available_idx ON books(is_available);

CREATE INDEX IF NOT EXISTS book_requests_requester_id_idx ON book_requests(requester_id);
CREATE INDEX IF NOT EXISTS book_requests_location_idx ON book_requests(location);
CREATE INDEX IF NOT EXISTS book_requests_title_idx ON book_requests(title);
CREATE INDEX IF NOT EXISTS book_requests_is_active_idx ON book_requests(is_active);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_book_requests_updated_at
  BEFORE UPDATE ON book_requests
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();