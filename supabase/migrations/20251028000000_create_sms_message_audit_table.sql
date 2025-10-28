/*
  # SMS Message Audit Table for Batch Campaigns

  1. New Tables
    - `sms_message_audit`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to the user who received the message
      - `phone_number` (text) - Phone number the message was sent to
      - `message_body` (text) - The actual personalized message sent
      - `template_used` (text) - The original template before personalization
      - `twilio_message_sid` (text) - Twilio's unique message identifier
      - `twilio_status` (text) - Initial status from Twilio (queued, sent, failed, etc.)
      - `error_code` (text) - Twilio error code if failed
      - `error_message` (text) - Error details if failed
      - `sent_by` (uuid) - Admin user who triggered the batch send
      - `batch_id` (uuid) - Groups messages from the same batch send
      - `sent_at` (timestamptz) - When the message was sent
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `sms_message_audit` table
    - Admin-only access for viewing audit logs
    - System can insert records (for batch sending)

  3. Indexes
    - Index on user_id for quick user message history lookup
    - Index on batch_id for batch campaign reporting
    - Index on sent_at for time-based queries
    - Index on twilio_status for filtering by status
*/

CREATE TABLE IF NOT EXISTS sms_message_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  phone_number text NOT NULL,
  message_body text NOT NULL,
  template_used text,
  twilio_message_sid text,
  twilio_status text DEFAULT 'queued',
  error_code text,
  error_message text,
  sent_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  batch_id uuid,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_audit_user_id ON sms_message_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_audit_batch_id ON sms_message_audit(batch_id);
CREATE INDEX IF NOT EXISTS idx_sms_audit_sent_at ON sms_message_audit(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_audit_status ON sms_message_audit(twilio_status);
CREATE INDEX IF NOT EXISTS idx_sms_audit_phone ON sms_message_audit(phone_number);

ALTER TABLE sms_message_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
  ON sms_message_audit FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'role'),
      (auth.jwt() -> 'user_metadata' ->> 'role')
    ) = 'admin'
  );

CREATE POLICY "Admins can insert audit logs"
  ON sms_message_audit FOR INSERT
  TO authenticated
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'role'),
      (auth.jwt() -> 'user_metadata' ->> 'role')
    ) = 'admin'
  );

CREATE OR REPLACE FUNCTION get_batch_campaign_summary(p_batch_id uuid)
RETURNS TABLE (
  total_messages bigint,
  successful bigint,
  failed bigint,
  queued bigint,
  sent_at timestamptz,
  sent_by_name text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total_messages,
    COUNT(*) FILTER (WHERE twilio_status IN ('sent', 'delivered'))::bigint as successful,
    COUNT(*) FILTER (WHERE twilio_status IN ('failed', 'undelivered'))::bigint as failed,
    COUNT(*) FILTER (WHERE twilio_status = 'queued')::bigint as queued,
    MIN(a.sent_at) as sent_at,
    CONCAT(p.first_name, ' ', p.last_name) as sent_by_name
  FROM sms_message_audit a
  LEFT JOIN profiles p ON a.sent_by = p.id
  WHERE a.batch_id = p_batch_id
  GROUP BY p.first_name, p.last_name;
END;
$$;
