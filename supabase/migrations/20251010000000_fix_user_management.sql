/*
  # Fix User Management - Add Email to Profiles

  1. Changes
    - Adds email column to profiles table for easier user management
    - Creates trigger to sync email from auth.users to profiles
    - Updates existing profiles with email from auth.users
    - Recreates list_users_with_roles function to use profiles.email

  2. Security
    - Email field is populated automatically from auth.users
    - RLS policies remain unchanged
    - Only admins can call list_users_with_roles function
*/

-- Add email column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
END $$;

-- Create or replace function to sync email from auth.users to profiles
CREATE OR REPLACE FUNCTION public.handle_user_email_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Update email in profiles when user record is created or updated
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_email_change ON auth.users;

-- Create trigger to sync email on user creation/update
CREATE TRIGGER on_auth_user_email_change
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_email_sync();

-- Sync existing emails from auth.users to profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email != u.email);

-- Recreate list_users_with_roles function to use profiles.email
CREATE OR REPLACE FUNCTION public.list_users_with_roles()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can list users';
  END IF;

  RETURN QUERY
  SELECT
    p.id as user_id,
    p.email,
    p.full_name,
    COALESCE(p.role, 'customer') as role,
    p.created_at
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
