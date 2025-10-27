/*
  # Fix All SMS Tables RLS Recursion Issues

  1. Problem
    - All SMS-related tables have policies that query profiles table for admin check
    - These queries trigger RLS on profiles, causing recursion
    - Result: 500 errors when accessing these tables via REST API
    
  2. Solution
    - Use auth.jwt() to check role from JWT metadata instead of querying profiles
    - This avoids any database queries during RLS evaluation
    - JWT contains user metadata including role
    
  3. Tables Fixed
    - sms_conversations
    - sms_messages
    - authorized_phone_numbers
    - sms_opt_outs
    - sms_consent_records
*/

-- =============================================
-- FIX SMS CONVERSATIONS TABLE POLICIES
-- =============================================

DROP POLICY IF EXISTS "Admins can view all conversations" ON sms_conversations;
DROP POLICY IF EXISTS "Admins can insert conversations" ON sms_conversations;
DROP POLICY IF EXISTS "Admins can update conversations" ON sms_conversations;

CREATE POLICY "Admins can view all conversations"
  ON sms_conversations FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can insert conversations"
  ON sms_conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update conversations"
  ON sms_conversations FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- =============================================
-- FIX SMS MESSAGES TABLE POLICIES
-- =============================================

DROP POLICY IF EXISTS "Admins can view all messages" ON sms_messages;
DROP POLICY IF EXISTS "Admins can insert messages" ON sms_messages;
DROP POLICY IF EXISTS "Admins can update messages" ON sms_messages;

CREATE POLICY "Admins can view all messages"
  ON sms_messages FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can insert messages"
  ON sms_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update messages"
  ON sms_messages FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- =============================================
-- FIX AUTHORIZED PHONE NUMBERS TABLE POLICIES
-- =============================================

DROP POLICY IF EXISTS "Admins can view authorized numbers" ON authorized_phone_numbers;
DROP POLICY IF EXISTS "Admins can insert authorized numbers" ON authorized_phone_numbers;
DROP POLICY IF EXISTS "Admins can update authorized numbers" ON authorized_phone_numbers;

CREATE POLICY "Admins can view authorized numbers"
  ON authorized_phone_numbers FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can insert authorized numbers"
  ON authorized_phone_numbers FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update authorized numbers"
  ON authorized_phone_numbers FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- =============================================
-- FIX SMS OPT-OUTS TABLE POLICIES
-- =============================================

DROP POLICY IF EXISTS "Admins can view opt-outs" ON sms_opt_outs;
DROP POLICY IF EXISTS "Admins can insert opt-outs" ON sms_opt_outs;

CREATE POLICY "Admins can view opt-outs"
  ON sms_opt_outs FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can insert opt-outs"
  ON sms_opt_outs FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- =============================================
-- FIX SMS CONSENT RECORDS TABLE POLICIES
-- =============================================

DROP POLICY IF EXISTS "Admins can view consent records" ON sms_consent_records;

CREATE POLICY "Admins can view consent records"
  ON sms_consent_records FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );