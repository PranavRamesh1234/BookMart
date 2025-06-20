# Supabase Setup Instructions for Bookmart

## Database Schema

The database includes three main tables:

### 1. Profiles Table
- Extends Supabase auth.users with additional profile information
- Stores user details like full name, phone, location, avatar
- Automatically created when a user signs up

### 2. Books Table
- Stores all book listings from sellers
- Includes book details, pricing, condition, location, and seller contact info
- Supports image uploads and geographic coordinates for location-based search

### 3. Book Requests Table
- Allows buyers to request specific books they're looking for
- Includes preferred conditions, maximum price, and contact information
- Enables sellers to find potential buyers for their books

## Storage Buckets

### 1. book-images
- Stores photos of books uploaded by sellers
- Public read access for displaying images
- Authenticated users can upload, update, and delete their own images

### 2. avatars
- Stores user profile pictures
- Public read access
- Users can manage their own avatar images

## Security (Row Level Security)

All tables have RLS enabled with appropriate policies:

- **Public Read Access**: Anyone can view books, requests, and public profiles
- **Authenticated Write Access**: Only logged-in users can create listings/requests
- **Owner-Only Modifications**: Users can only edit/delete their own content

## Setup Instructions

1. **Create a new Supabase project** at https://supabase.com

2. **Enable Authentication Providers**:
   - Go to Authentication > Providers
   - Enable Email provider
   - Enable Google OAuth (optional but recommended)
   - Configure redirect URLs for your domain

3. **Run the migrations**:
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of each migration file in order:
     1. `create_bookmart_schema.sql`
     2. `setup_storage.sql`
     3. `seed_sample_data.sql` (optional, for development)

4. **Configure your environment**:
   - Copy your Project URL and anon key from Settings > API
   - Update your `.env` file with these values

5. **Test the setup**:
   - Try signing up a new user
   - Verify that a profile is automatically created
   - Test uploading images to storage buckets

## Environment Variables Needed

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Optional: Google OAuth Setup

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add your Supabase callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Add the client ID and secret to Supabase Authentication settings

## Database Functions

The schema includes several helpful functions:

- **handle_new_user()**: Automatically creates a profile when a user signs up
- **handle_updated_at()**: Updates the `updated_at` timestamp on record changes

## Indexes

Performance indexes are created for:
- Book searches by location, genre, condition, price
- User-specific queries (seller_id, requester_id)
- Active/available status filtering

This setup provides a complete backend for the Bookmart application with proper security, performance optimization, and scalability considerations.