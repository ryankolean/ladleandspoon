/*
  # Fix Test Customer Helper Function

  1. Fix
    - Fix ambiguous column reference error
    - Use fully qualified column names
*/

DROP FUNCTION IF EXISTS add_test_customer(text, text, text, text);

CREATE OR REPLACE FUNCTION add_test_customer(
  p_phone text,
  p_email text DEFAULT 'test-sms@ladleandspoon.com',
  p_first_name text DEFAULT 'Test',
  p_last_name text DEFAULT 'Customer'
)
RETURNS TABLE (
  profile_id uuid,
  profile_email text,
  profile_phone text,
  profile_first_name text,
  profile_last_name text,
  profile_sms_consent boolean
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check if profile with this phone already exists
  SELECT profiles.id INTO v_user_id
  FROM profiles
  WHERE profiles.phone = p_phone;

  IF v_user_id IS NOT NULL THEN
    -- Update existing profile
    UPDATE profiles
    SET 
      sms_consent = true,
      sms_consent_date = NOW(),
      sms_consent_method = 'admin_setup',
      first_name = p_first_name,
      last_name = p_last_name,
      full_name = p_first_name || ' ' || p_last_name,
      updated_at = NOW()
    WHERE profiles.id = v_user_id;
  ELSE
    -- Check if we can use existing user with this email
    SELECT auth.users.id INTO v_user_id
    FROM auth.users
    WHERE auth.users.email = p_email;

    IF v_user_id IS NULL THEN
      -- Create a placeholder user ID for testing
      v_user_id := gen_random_uuid();
      
      -- Insert directly into auth.users (service role only)
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token
      )
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_user_id,
        'authenticated',
        'authenticated',
        p_email,
        '',
        NOW(),
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email'], 'role', 'customer'),
        jsonb_build_object('first_name', p_first_name, 'last_name', p_last_name),
        NOW(),
        NOW(),
        '',
        ''
      );
    END IF;

    -- Create profile
    INSERT INTO profiles (
      id,
      email,
      role,
      phone,
      first_name,
      last_name,
      full_name,
      sms_consent,
      sms_consent_date,
      sms_consent_method,
      preferences
    )
    VALUES (
      v_user_id,
      p_email,
      'customer',
      p_phone,
      p_first_name,
      p_last_name,
      p_first_name || ' ' || p_last_name,
      true,
      NOW(),
      'admin_setup',
      '{}'::jsonb
    );
  END IF;

  -- Return the profile
  RETURN QUERY
  SELECT 
    profiles.id,
    profiles.email,
    profiles.phone,
    profiles.first_name,
    profiles.last_name,
    profiles.sms_consent
  FROM profiles
  WHERE profiles.id = v_user_id;
END;
$$;