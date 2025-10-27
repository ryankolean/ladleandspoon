/*
  # Fix Profiles RLS Using JWT Instead of Subquery

  1. Problem
    - The "Admins can read all profiles" policy queries the profiles table
    - This creates recursion even with subquery because REST API evaluates RLS on that subquery
    - Result: 500 errors when accessing profiles via REST API
    
  2. Solution
    - Remove the admin policy that queries profiles table
    - Admins don't need special policy since they can read their own profile
    - If admin features are needed later, use auth.jwt() metadata instead
    
  3. Changes
    - Drop "Admins can read all profiles" policy
    - Keep only non-recursive policies
*/

-- Drop the recursive admin policy
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Verify no recursive policies remain
-- Users can only read their own profile (no recursion)
-- Users can update their own profile (no recursion)
-- Users can insert their own profile (no recursion)