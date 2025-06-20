-- Add settings column to profiles table
ALTER TABLE profiles
ADD COLUMN settings jsonb DEFAULT '{
  "email_notifications": true,
  "show_phone": true,
  "show_email": true,
  "show_location": true
}'::jsonb;

-- Update the handle_new_user function to include default settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, settings)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    '{
      "email_notifications": true,
      "show_phone": true,
      "show_email": true,
      "show_location": true
    }'::jsonb
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 