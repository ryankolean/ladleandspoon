/*
  # Add is_admin field to profiles table

  1. Changes
    - Add `is_admin` (boolean) column to profiles table
    - Create trigger to keep is_admin in sync with role field
    - Populate existing records based on role field

  2. Notes
    - is_admin is a convenience field that mirrors role = 'admin'
    - Trigger ensures is_admin always stays in sync with role changes
    - This field is used in various RLS policies throughout the system
*/

-- Add is_admin column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Populate existing records based on role
UPDATE profiles
SET is_admin = (role = 'admin')
WHERE is_admin IS NULL OR is_admin != (role = 'admin');

-- Create function to keep is_admin in sync with role
CREATE OR REPLACE FUNCTION public.sync_is_admin_with_role()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_admin := (NEW.role = 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically sync is_admin when role changes
DROP TRIGGER IF EXISTS sync_is_admin_trigger ON profiles;
CREATE TRIGGER sync_is_admin_trigger
  BEFORE INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_is_admin_with_role();

-- Add index on is_admin for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
