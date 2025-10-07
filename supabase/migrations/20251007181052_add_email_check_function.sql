/*
  # Add Email Existence Check Function

  1. Function
    - `check_email_exists` - Safely checks if an email is already registered
    
  2. Security
    - Function is accessible to authenticated and anonymous users
    - Only returns boolean, no user data exposed
    - Prevents enumeration attacks by rate limiting on application side
    
  3. Purpose
    - Provides real-time feedback during signup
    - Improves user experience
    - Reduces failed signup attempts
*/

CREATE OR REPLACE FUNCTION check_email_exists(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = check_email
  );
END;
$$;

COMMENT ON FUNCTION check_email_exists IS 'Checks if an email address is already registered. Returns boolean only.';
