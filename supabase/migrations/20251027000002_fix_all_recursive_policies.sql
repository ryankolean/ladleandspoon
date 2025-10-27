/*
  # Fix All Recursive RLS Policies

  1. Problem
    - Multiple tables have RLS policies with recursive queries that cause 500 errors
    - Policies were checking is_admin field which causes infinite recursion
    - Need to use non-recursive approach for admin checks

  2. Solution
    - Drop and recreate all problematic policies
    - Use simple subquery for admin checks: (SELECT role FROM profiles WHERE id = auth.uid())
    - This avoids triggering RLS policies during the check

  3. Tables Fixed
    - profiles: User profile data access
    - sms_conversations: SMS conversation access
    - sms_messages: SMS message access
    - authorized_phone_numbers: Phone number management
    - sms_opt_outs: Opt-out management
    - sms_consent_records: Consent tracking
*/

-- =============================================
-- FIX PROFILES TABLE POLICIES
-- =============================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

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
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can insert conversations"
  ON sms_conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update conversations"
  ON sms_conversations FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
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
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can insert messages"
  ON sms_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update messages"
  ON sms_messages FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
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
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can insert authorized numbers"
  ON authorized_phone_numbers FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update authorized numbers"
  ON authorized_phone_numbers FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
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
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can insert opt-outs"
  ON sms_opt_outs FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- =============================================
-- FIX SMS CONSENT RECORDS TABLE POLICIES
-- =============================================

DROP POLICY IF EXISTS "Admins can view consent records" ON sms_consent_records;
DROP POLICY IF EXISTS "Anyone can insert consent records" ON sms_consent_records;

CREATE POLICY "Admins can view consent records"
  ON sms_consent_records FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Anyone can insert consent records"
  ON sms_consent_records FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
