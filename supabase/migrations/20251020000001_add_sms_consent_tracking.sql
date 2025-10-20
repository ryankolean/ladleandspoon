/*
  # SMS Consent Tracking Enhancement

  1. Changes to Existing Tables
    - `profiles`
      - Add `sms_consent` (boolean) - Whether user has consented to SMS
      - Add `sms_consent_date` (timestamptz) - When consent was given
      - Add `sms_consent_method` (text) - How consent was obtained: 'web_form', 'checkout', 'phone', 'manual'
      - Add `sms_consent_ip` (text) - IP address when consent was given (for audit trail)

  2. New Tables
    - `sms_consent_records`
      - `id` (uuid, primary key)
      - `phone_number` (text) - Phone number that gave consent
      - `first_name` (text) - First name
      - `last_name` (text) - Last name
      - `email` (text) - Email address
      - `consent_given` (boolean) - Whether consent was given or revoked
      - `consent_date` (timestamptz) - Date/time of consent action
      - `consent_method` (text) - Method: 'web_form', 'checkout', 'phone', 'manual'
      - `consent_ip` (text) - IP address for audit trail
      - `user_agent` (text) - Browser user agent for audit trail
      - `created_at` (timestamptz)

  3. Security
    - Enable RLS on sms_consent_records table
    - Admin-only access to consent records for compliance auditing
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'sms_consent'
  ) THEN
    ALTER TABLE profiles ADD COLUMN sms_consent boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'sms_consent_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN sms_consent_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'sms_consent_method'
  ) THEN
    ALTER TABLE profiles ADD COLUMN sms_consent_method text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'sms_consent_ip'
  ) THEN
    ALTER TABLE profiles ADD COLUMN sms_consent_ip text;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS sms_consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  first_name text,
  last_name text,
  email text,
  consent_given boolean DEFAULT true,
  consent_date timestamptz DEFAULT now(),
  consent_method text DEFAULT 'web_form',
  consent_ip text,
  user_agent text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_consent_records_phone ON sms_consent_records(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_consent_records_date ON sms_consent_records(consent_date DESC);
CREATE INDEX IF NOT EXISTS idx_sms_consent_records_method ON sms_consent_records(consent_method);

ALTER TABLE sms_consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view consent records"
  ON sms_consent_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Anyone can insert consent records"
  ON sms_consent_records FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION log_sms_consent_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.sms_consent IS DISTINCT FROM NEW.sms_consent) THEN
    INSERT INTO sms_consent_records (
      phone_number,
      consent_given,
      consent_date,
      consent_method,
      notes
    ) VALUES (
      NEW.phone,
      NEW.sms_consent,
      now(),
      COALESCE(NEW.sms_consent_method, 'profile_update'),
      CASE
        WHEN NEW.sms_consent THEN 'Consent granted via profile update'
        ELSE 'Consent revoked via profile update'
      END
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_sms_consent_change ON profiles;

CREATE TRIGGER trigger_log_sms_consent_change
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_sms_consent_change();
