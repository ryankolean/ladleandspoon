/*
  # Login Security System

  Creates tables and functions for login attempt tracking and account lockout
*/

CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  user_agent text,
  success boolean DEFAULT false,
  attempted_at timestamptz DEFAULT now(),
  error_message text
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);

CREATE TABLE IF NOT EXISTS account_lockouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  locked_at timestamptz DEFAULT now(),
  locked_until timestamptz NOT NULL,
  failed_attempts integer DEFAULT 0,
  reason text
);

CREATE INDEX IF NOT EXISTS idx_account_lockouts_email ON account_lockouts(email);

ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_lockouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No direct access to login attempts" ON login_attempts;
CREATE POLICY "No direct access to login attempts"
  ON login_attempts FOR ALL TO authenticated, anon USING (false);

DROP POLICY IF EXISTS "No direct access to account lockouts" ON account_lockouts;
CREATE POLICY "No direct access to account lockouts"
  ON account_lockouts FOR ALL TO authenticated, anon USING (false);

CREATE OR REPLACE FUNCTION record_login_attempt(
  p_email text,
  p_success boolean,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO login_attempts (email, success, ip_address, user_agent, error_message)
  VALUES (p_email, p_success, p_ip_address, p_user_agent, p_error_message);
END;
$$;

CREATE OR REPLACE FUNCTION check_account_lockout(p_email text)
RETURNS TABLE (
  is_locked boolean,
  locked_until timestamptz,
  failed_attempts integer,
  reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lockout RECORD;
  v_recent_failures integer;
  v_lockout_duration interval;
BEGIN
  SELECT * INTO v_lockout
  FROM account_lockouts
  WHERE email = p_email AND locked_until > now();
  
  IF FOUND THEN
    RETURN QUERY SELECT true, v_lockout.locked_until, v_lockout.failed_attempts, v_lockout.reason;
    RETURN;
  END IF;
  
  SELECT COUNT(*) INTO v_recent_failures
  FROM login_attempts
  WHERE email = p_email AND success = false AND attempted_at > now() - interval '15 minutes';
  
  IF v_recent_failures >= 5 THEN
    IF v_recent_failures < 7 THEN
      v_lockout_duration := interval '15 minutes';
    ELSIF v_recent_failures < 10 THEN
      v_lockout_duration := interval '30 minutes';
    ELSIF v_recent_failures < 15 THEN
      v_lockout_duration := interval '1 hour';
    ELSE
      v_lockout_duration := interval '24 hours';
    END IF;
    
    INSERT INTO account_lockouts (email, locked_until, failed_attempts, reason)
    VALUES (p_email, now() + v_lockout_duration, v_recent_failures, 'Too many failed login attempts')
    ON CONFLICT (email) 
    DO UPDATE SET locked_until = now() + v_lockout_duration, failed_attempts = v_recent_failures, locked_at = now();
    
    RETURN QUERY SELECT true, now() + v_lockout_duration, v_recent_failures, 'Too many failed login attempts'::text;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT false, NULL::timestamptz, v_recent_failures, NULL::text;
END;
$$;

CREATE OR REPLACE FUNCTION unlock_account(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM account_lockouts WHERE email = p_email;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM login_attempts WHERE attempted_at < now() - interval '30 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  DELETE FROM account_lockouts WHERE locked_until < now();
  RETURN deleted_count;
END;
$$;
