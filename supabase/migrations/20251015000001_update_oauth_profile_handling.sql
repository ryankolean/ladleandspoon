/*
  # Update OAuth Profile Handling

  1. Changes
    - Update handle_new_user() function to better extract name from Google OAuth
    - Google OAuth provides given_name, family_name, and full_name in user metadata
    - Prioritize full_name if available, otherwise combine given_name + family_name
    - Ensure first and last name are properly captured for OAuth users

  2. Notes
    - Google OAuth automatically provides profile information when 'profile' scope is requested
    - The user metadata includes: given_name, family_name, full_name, email, picture
    - This migration ensures proper name extraction for OAuth sign-ins
*/

-- Update the handle_new_user function to better extract names from OAuth providers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name text;
BEGIN
  -- Extract full name from OAuth metadata
  -- Google OAuth provides: full_name, given_name, family_name
  -- Prioritize full_name, then construct from given_name + family_name
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    CONCAT_WS(' ',
      NEW.raw_user_meta_data->>'given_name',
      NEW.raw_user_meta_data->>'family_name'
    ),
    ''
  );

  -- Trim any extra whitespace
  user_full_name := TRIM(user_full_name);

  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    user_full_name,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
