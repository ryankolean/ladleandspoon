/*
  # Add Role to JWT and Create Safe Profile Access

  1. Problem
    - Can't query profiles table from client due to RLS recursion
    - Need role information in JWT for RLS policies to work
    - Current auth.js tries to query profiles which fails with 500 error
    
  2. Solution
    - Create function to sync role to auth.users app_metadata
    - Create trigger to automatically update JWT when role changes
    - Add RLS policy that allows admin access using JWT metadata
    - Create safe RPC function to get profile data
    
  3. Implementation
    - Trigger syncs role from profiles to auth.users metadata
    - RLS uses JWT metadata (no database queries)
    - RPC function bypasses RLS using security definer
*/

-- Function to sync role to auth.users metadata
CREATE OR REPLACE FUNCTION sync_role_to_auth_metadata()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the user's app_metadata in auth.users
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS sync_role_to_auth_metadata_trigger ON profiles;

-- Create trigger on profiles table
CREATE TRIGGER sync_role_to_auth_metadata_trigger
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_role_to_auth_metadata();

-- Sync existing roles to auth metadata
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN SELECT id, role FROM profiles
  LOOP
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', profile_record.role)
    WHERE id = profile_record.id;
  END LOOP;
END $$;

-- Create admin policy using JWT metadata
CREATE POLICY "Admins can read all profiles using JWT"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'role'),
      (auth.jwt() -> 'user_metadata' ->> 'role')
    ) = 'admin'
  );

-- Create safe RPC function to get user profile
CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS TABLE (
  id uuid,
  email text,
  role text,
  phone text,
  first_name text,
  last_name text,
  full_name text,
  preferences jsonb,
  sms_consent boolean,
  sms_consent_date timestamptz,
  sms_consent_method text,
  sms_consent_ip text,
  created_at timestamptz,
  updated_at timestamptz
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.role,
    p.phone,
    p.first_name,
    p.last_name,
    p.full_name,
    p.preferences,
    p.sms_consent,
    p.sms_consent_date,
    p.sms_consent_method,
    p.sms_consent_ip,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.id = auth.uid();
END;
$$;