/*
  # Add First and Last Name to Profiles

  1. Changes
    - Add first_name column to profiles table
    - Add last_name column to profiles table
    - Migrate existing full_name data to first_name and last_name
    - Update handle_new_user() trigger to populate first_name and last_name from OAuth
    - Keep full_name column for backward compatibility but mark as deprecated

  2. Notes
    - Splits full_name into first_name (first word) and last_name (remaining words)
    - OAuth providers like Google provide given_name and family_name separately
    - This migration maintains backward compatibility while supporting granular name fields
*/

-- Add first_name and last_name columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_name text;
  END IF;
END $$;

-- Migrate existing full_name data to first_name and last_name
UPDATE profiles
SET
  first_name = CASE
    WHEN full_name IS NOT NULL AND full_name != '' THEN
      SPLIT_PART(TRIM(full_name), ' ', 1)
    ELSE NULL
  END,
  last_name = CASE
    WHEN full_name IS NOT NULL AND full_name != '' AND POSITION(' ' IN TRIM(full_name)) > 0 THEN
      SUBSTRING(TRIM(full_name) FROM POSITION(' ' IN TRIM(full_name)) + 1)
    ELSE NULL
  END
WHERE first_name IS NULL AND last_name IS NULL;

-- Update the handle_new_user function to populate first_name and last_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_first_name text;
  user_last_name text;
  user_full_name text;
BEGIN
  -- Extract first and last name from OAuth metadata
  -- Google OAuth provides: given_name, family_name, full_name
  user_first_name := COALESCE(
    NEW.raw_user_meta_data->>'given_name',
    CASE
      WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL AND NEW.raw_user_meta_data->>'full_name' != '' THEN
        SPLIT_PART(TRIM(NEW.raw_user_meta_data->>'full_name'), ' ', 1)
      ELSE ''
    END
  );

  user_last_name := COALESCE(
    NEW.raw_user_meta_data->>'family_name',
    CASE
      WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL
           AND NEW.raw_user_meta_data->>'full_name' != ''
           AND POSITION(' ' IN TRIM(NEW.raw_user_meta_data->>'full_name')) > 0 THEN
        SUBSTRING(TRIM(NEW.raw_user_meta_data->>'full_name') FROM POSITION(' ' IN TRIM(NEW.raw_user_meta_data->>'full_name')) + 1)
      ELSE ''
    END
  );

  -- Also maintain full_name for backward compatibility
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    CONCAT_WS(' ',
      NULLIF(user_first_name, ''),
      NULLIF(user_last_name, '')
    ),
    ''
  );

  -- Trim any extra whitespace
  user_first_name := TRIM(user_first_name);
  user_last_name := TRIM(user_last_name);
  user_full_name := TRIM(user_full_name);

  INSERT INTO public.profiles (id, first_name, last_name, full_name, phone, role)
  VALUES (
    NEW.id,
    user_first_name,
    user_last_name,
    user_full_name,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
