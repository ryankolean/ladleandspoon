/*
  # Fix Security and Performance Issues

  1. Add Missing Indexes
    - Add foreign key indexes for `authorized_phone_numbers` and `sms_campaigns`

  2. Fix RLS Policies
    - Replace `auth.uid()` with `(SELECT auth.uid())` for better performance
    - Replace `auth.jwt()` checks with `app_metadata` only (not user_metadata)
    - Remove references to user_metadata in security policies

  3. Fix Function Search Paths
    - Add SECURITY DEFINER and search_path to all functions

  4. Performance Improvements
    - Optimize RLS policy evaluation
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_authorized_phone_numbers_added_by 
  ON authorized_phone_numbers(added_by);

CREATE INDEX IF NOT EXISTS idx_sms_campaigns_created_by 
  ON sms_campaigns(created_by);

-- ============================================================================
-- 2. FIX RLS POLICIES - REMOVE user_metadata REFERENCES
-- ============================================================================

-- Drop existing policies that use user_metadata
DROP POLICY IF EXISTS "Admins can view all conversations" ON sms_conversations;
DROP POLICY IF EXISTS "Admins can insert conversations" ON sms_conversations;
DROP POLICY IF EXISTS "Admins can update conversations" ON sms_conversations;

DROP POLICY IF EXISTS "Admins can view all messages" ON sms_messages;
DROP POLICY IF EXISTS "Admins can insert messages" ON sms_messages;
DROP POLICY IF EXISTS "Admins can update messages" ON sms_messages;

DROP POLICY IF EXISTS "Admins can view authorized numbers" ON authorized_phone_numbers;
DROP POLICY IF EXISTS "Admins can insert authorized numbers" ON authorized_phone_numbers;
DROP POLICY IF EXISTS "Admins can update authorized numbers" ON authorized_phone_numbers;

DROP POLICY IF EXISTS "Admins can view opt-outs" ON sms_opt_outs;
DROP POLICY IF EXISTS "Admins can insert opt-outs" ON sms_opt_outs;

DROP POLICY IF EXISTS "Admins can view consent records" ON sms_consent_records;

DROP POLICY IF EXISTS "Admins can read all profiles using JWT" ON profiles;

-- Recreate policies using ONLY app_metadata and SELECT optimization
CREATE POLICY "Admins can view all conversations"
  ON sms_conversations FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can insert conversations"
  ON sms_conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update conversations"
  ON sms_conversations FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can view all messages"
  ON sms_messages FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can insert messages"
  ON sms_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update messages"
  ON sms_messages FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can view authorized numbers"
  ON authorized_phone_numbers FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can insert authorized numbers"
  ON authorized_phone_numbers FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update authorized numbers"
  ON authorized_phone_numbers FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can view opt-outs"
  ON sms_opt_outs FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can insert opt-outs"
  ON sms_opt_outs FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can view consent records"
  ON sms_consent_records FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ============================================================================
-- 3. FIX OTHER RLS POLICIES WITH SELECT OPTIMIZATION
-- ============================================================================

-- Menu Items
DROP POLICY IF EXISTS "Anyone can view available menu items" ON menu_items;
CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  TO authenticated
  USING (available = true OR (SELECT auth.uid()) IS NOT NULL);

-- Orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- User Addresses
DROP POLICY IF EXISTS "Users can view their own addresses" ON user_addresses;
CREATE POLICY "Users can view their own addresses"
  ON user_addresses FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own addresses" ON user_addresses;
CREATE POLICY "Users can insert their own addresses"
  ON user_addresses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own addresses" ON user_addresses;
CREATE POLICY "Users can update their own addresses"
  ON user_addresses FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own addresses" ON user_addresses;
CREATE POLICY "Users can delete their own addresses"
  ON user_addresses FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- SMS Subscriptions
DROP POLICY IF EXISTS "Users can view their own SMS subscriptions" ON sms_subscriptions;
CREATE POLICY "Users can view their own SMS subscriptions"
  ON sms_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own SMS subscriptions" ON sms_subscriptions;
CREATE POLICY "Users can insert their own SMS subscriptions"
  ON sms_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own SMS subscriptions" ON sms_subscriptions;
CREATE POLICY "Users can update their own SMS subscriptions"
  ON sms_subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- SMS Campaigns
DROP POLICY IF EXISTS "Authenticated users can create SMS campaigns" ON sms_campaigns;
CREATE POLICY "Authenticated users can create SMS campaigns"
  ON sms_campaigns FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update SMS campaigns" ON sms_campaigns;
CREATE POLICY "Authenticated users can update SMS campaigns"
  ON sms_campaigns FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

-- Login Attempts
DROP POLICY IF EXISTS "Admins can view all login attempts" ON login_attempts;
CREATE POLICY "Admins can view all login attempts"
  ON login_attempts FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Account Lockouts
DROP POLICY IF EXISTS "Users can view own lockouts" ON account_lockouts;
CREATE POLICY "Users can view own lockouts"
  ON account_lockouts FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins can view all lockouts" ON account_lockouts;
CREATE POLICY "Admins can view all lockouts"
  ON account_lockouts FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ============================================================================
-- 4. FIX FUNCTION SEARCH PATHS
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_is_admin_with_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.is_admin := (NEW.role = 'admin');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION handle_user_email_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE auth.users
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_app_metadata->>'role', 'customer'),
    COALESCE((NEW.raw_app_metadata->>'role')::text = 'admin', false)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION is_user_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_user boolean;
BEGIN
  SELECT is_admin INTO is_admin_user
  FROM profiles
  WHERE id = user_uuid;

  RETURN COALESCE(is_admin_user, false);
END;
$$;

CREATE OR REPLACE FUNCTION grant_admin_role(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_metadata = 
    COALESCE(raw_app_metadata, '{}'::jsonb) || '{"role": "admin"}'::jsonb
  WHERE id = target_user_id;

  UPDATE profiles
  SET role = 'admin', is_admin = true
  WHERE id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION revoke_admin_role(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_metadata = 
    COALESCE(raw_app_metadata, '{}'::jsonb) || '{"role": "customer"}'::jsonb
  WHERE id = target_user_id;

  UPDATE profiles
  SET role = 'customer', is_admin = false
  WHERE id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION list_users_with_roles()
RETURNS TABLE (
  id uuid,
  email text,
  role text,
  is_admin boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.email, p.role, p.is_admin, p.created_at
  FROM profiles p
  ORDER BY p.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION update_conversation_on_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE sms_conversations
  SET 
    last_message_at = NEW.sent_at,
    unread_count = CASE 
      WHEN NEW.direction = 'inbound' THEN unread_count + 1
      ELSE unread_count
    END,
    updated_at = now()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION mark_messages_as_read(p_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE sms_messages
  SET read_at = now()
  WHERE conversation_id = p_conversation_id
    AND direction = 'inbound'
    AND read_at IS NULL;

  UPDATE sms_conversations
  SET unread_count = 0
  WHERE id = p_conversation_id;
END;
$$;

CREATE OR REPLACE FUNCTION log_sms_consent_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.sms_consent IS DISTINCT FROM NEW.sms_consent AND NEW.phone IS NOT NULL THEN
    INSERT INTO sms_consent_records (
      phone_number,
      first_name,
      last_name,
      email,
      consent_given,
      consent_method,
      notes
    ) VALUES (
      NEW.phone,
      NEW.first_name,
      NEW.last_name,
      NEW.email,
      NEW.sms_consent,
      'profile_update',
      CASE
        WHEN NEW.sms_consent THEN 'User opted in via profile settings'
        ELSE 'User opted out via profile settings'
      END
    );
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 5. COMMENT IMPROVEMENTS
-- ============================================================================

COMMENT ON INDEX idx_authorized_phone_numbers_added_by IS 'Index for foreign key lookups on added_by column';
COMMENT ON INDEX idx_sms_campaigns_created_by IS 'Index for foreign key lookups on created_by column';

COMMENT ON POLICY "Admins can read all profiles" ON profiles IS 'Allows admins to view all user profiles using app_metadata role check with SELECT optimization';
COMMENT ON POLICY "Admins can view all conversations" ON sms_conversations IS 'Allows admins to view SMS conversations using app_metadata (not user_metadata) with SELECT optimization';
COMMENT ON POLICY "Admins can view all messages" ON sms_messages IS 'Allows admins to view SMS messages using app_metadata (not user_metadata) with SELECT optimization';
