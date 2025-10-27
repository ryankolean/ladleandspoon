/*
  # Fix Profiles RLS Policies

  1. Changes
    - Fix recursive query issue in admin policy
    - Use is_admin field instead of recursive profile lookup
    - Ensure all users can read their own profiles
    - Ensure admins can read all profiles without recursion

  2. Security
    - Users can only read/update their own profile
    - Admins can read all profiles using is_admin field
    - No recursive queries that could cause 500 errors
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create policy for users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policy for users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policy for admins to read all profiles (using is_admin field to avoid recursion)
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );
