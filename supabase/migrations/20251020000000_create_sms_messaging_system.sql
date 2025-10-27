/*
  # SMS Messaging System

  1. New Tables
    - `sms_conversations`
      - `id` (uuid, primary key)
      - `customer_phone` (text) - Customer's phone number in E.164 format
      - `customer_id` (uuid) - Optional reference to profiles table
      - `last_message_at` (timestamptz) - Timestamp of most recent message
      - `status` (text) - Conversation status: 'active', 'archived'
      - `unread_count` (integer) - Count of unread inbound messages
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `sms_messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid) - Reference to sms_conversations
      - `twilio_message_sid` (text) - Twilio's unique message identifier
      - `direction` (text) - 'inbound' or 'outbound'
      - `from_number` (text) - Sender's phone number
      - `to_number` (text) - Recipient's phone number
      - `body` (text) - Message content
      - `status` (text) - Message status from Twilio
      - `sent_at` (timestamptz)
      - `delivered_at` (timestamptz)
      - `read_at` (timestamptz)
      - `error_code` (text) - Twilio error code if failed
      - `error_message` (text) - Error details if failed
      - `created_at` (timestamptz)

    - `authorized_phone_numbers`
      - `id` (uuid, primary key)
      - `phone_number` (text) - Phone number in E.164 format
      - `twilio_phone_sid` (text) - Twilio phone number SID
      - `is_active` (boolean) - Whether number is currently active
      - `compliance_verified` (boolean) - Passed compliance checks
      - `verification_date` (timestamptz)
      - `verification_notes` (text)
      - `added_by` (uuid) - Admin user who added the number
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `sms_opt_outs`
      - `id` (uuid, primary key)
      - `phone_number` (text) - Phone number that opted out
      - `opted_out_at` (timestamptz)
      - `method` (text) - How they opted out: 'STOP keyword', 'manual', 'web form'
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Admin-only access policies for all SMS tables
    - Policies check for admin role via role field in profiles
*/

CREATE TABLE IF NOT EXISTS sms_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_phone text NOT NULL,
  customer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  last_message_at timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  unread_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_conversations_phone ON sms_conversations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_customer_id ON sms_conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_last_message ON sms_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_status ON sms_conversations(status);

CREATE TABLE IF NOT EXISTS sms_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES sms_conversations(id) ON DELETE CASCADE,
  twilio_message_sid text UNIQUE,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_number text NOT NULL,
  to_number text NOT NULL,
  body text,
  status text DEFAULT 'queued',
  sent_at timestamptz DEFAULT now(),
  delivered_at timestamptz,
  read_at timestamptz,
  error_code text,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_messages_conversation ON sms_messages(conversation_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_messages_twilio_sid ON sms_messages(twilio_message_sid);
CREATE INDEX IF NOT EXISTS idx_sms_messages_direction ON sms_messages(direction);
CREATE INDEX IF NOT EXISTS idx_sms_messages_status ON sms_messages(status);

CREATE TABLE IF NOT EXISTS authorized_phone_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text UNIQUE NOT NULL,
  twilio_phone_sid text,
  is_active boolean DEFAULT true,
  compliance_verified boolean DEFAULT false,
  verification_date timestamptz,
  verification_notes text,
  added_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_authorized_phone_numbers_active ON authorized_phone_numbers(is_active);
CREATE INDEX IF NOT EXISTS idx_authorized_phone_numbers_phone ON authorized_phone_numbers(phone_number);

CREATE TABLE IF NOT EXISTS sms_opt_outs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text UNIQUE NOT NULL,
  opted_out_at timestamptz DEFAULT now(),
  method text DEFAULT 'STOP keyword',
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_opt_outs_phone ON sms_opt_outs(phone_number);

ALTER TABLE sms_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorized_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_opt_outs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all conversations"
  ON sms_conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert conversations"
  ON sms_conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update conversations"
  ON sms_conversations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all messages"
  ON sms_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert messages"
  ON sms_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update messages"
  ON sms_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view authorized numbers"
  ON authorized_phone_numbers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert authorized numbers"
  ON authorized_phone_numbers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update authorized numbers"
  ON authorized_phone_numbers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view opt-outs"
  ON sms_opt_outs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert opt-outs"
  ON sms_opt_outs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE OR REPLACE FUNCTION update_conversation_on_new_message()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_on_new_message
  AFTER INSERT ON sms_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_new_message();

CREATE OR REPLACE FUNCTION mark_messages_as_read(p_conversation_id uuid)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
