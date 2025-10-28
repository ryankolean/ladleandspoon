/*
  # Add Status Polling Support to SMS Message Audit

  1. Changes
    - Add `last_status_check` timestamp to track when status was last polled
    - Add `status_check_count` to track number of polling attempts
    - Add `final_status` boolean to mark messages that have reached terminal state
    - Add indexes for efficient polling queries

  2. Terminal States
    - delivered, undelivered, failed, canceled - stop polling these
    - queued, sent, sending - continue polling these

  3. Functions
    - `get_messages_needing_status_check()` - Returns messages that need polling
    - `update_message_status()` - Updates message status from Twilio response
*/

-- Add status polling columns to sms_message_audit
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sms_message_audit' AND column_name = 'last_status_check'
  ) THEN
    ALTER TABLE sms_message_audit
    ADD COLUMN last_status_check timestamptz,
    ADD COLUMN status_check_count int DEFAULT 0,
    ADD COLUMN final_status boolean DEFAULT false;
  END IF;
END $$;

-- Create index for efficient polling queries
CREATE INDEX IF NOT EXISTS idx_sms_audit_needs_check
  ON sms_message_audit(final_status, last_status_check)
  WHERE twilio_message_sid IS NOT NULL;

-- Function to get messages that need status checking
CREATE OR REPLACE FUNCTION get_messages_needing_status_check(
  p_limit int DEFAULT 100,
  p_max_checks int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  twilio_message_sid text,
  twilio_status text,
  phone_number text,
  user_id uuid,
  batch_id uuid,
  sent_at timestamptz,
  status_check_count int
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.twilio_message_sid,
    a.twilio_status,
    a.phone_number,
    a.user_id,
    a.batch_id,
    a.sent_at,
    a.status_check_count
  FROM sms_message_audit a
  WHERE
    a.twilio_message_sid IS NOT NULL
    AND a.final_status = false
    AND a.status_check_count < p_max_checks
    AND (
      a.last_status_check IS NULL
      OR a.last_status_check < now() - interval '5 minutes'
    )
  ORDER BY a.sent_at DESC
  LIMIT p_limit;
END;
$$;

-- Function to update message status from Twilio response
CREATE OR REPLACE FUNCTION update_message_status(
  p_message_id uuid,
  p_new_status text,
  p_error_code text DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_is_final boolean;
BEGIN
  -- Determine if status is final (terminal state)
  v_is_final := p_new_status IN ('delivered', 'undelivered', 'failed', 'canceled');

  -- Update the message record
  UPDATE sms_message_audit
  SET
    twilio_status = p_new_status,
    error_code = COALESCE(p_error_code, error_code),
    error_message = COALESCE(p_error_message, error_message),
    last_status_check = now(),
    status_check_count = status_check_count + 1,
    final_status = v_is_final
  WHERE id = p_message_id;
END;
$$;

-- Function to get status statistics for a batch
CREATE OR REPLACE FUNCTION get_batch_status_breakdown(p_batch_id uuid)
RETURNS TABLE (
  status text,
  count bigint
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    twilio_status as status,
    COUNT(*)::bigint as count
  FROM sms_message_audit
  WHERE batch_id = p_batch_id
  GROUP BY twilio_status
  ORDER BY count DESC;
END;
$$;

-- Initialize existing records
UPDATE sms_message_audit
SET
  final_status = CASE
    WHEN twilio_status IN ('delivered', 'undelivered', 'failed', 'canceled') THEN true
    ELSE false
  END,
  status_check_count = CASE
    WHEN twilio_status IN ('delivered', 'undelivered', 'failed', 'canceled') THEN 1
    ELSE 0
  END
WHERE twilio_message_sid IS NOT NULL;

COMMENT ON COLUMN sms_message_audit.last_status_check IS 'Last time Twilio status was polled for this message';
COMMENT ON COLUMN sms_message_audit.status_check_count IS 'Number of times status has been checked (max 20)';
COMMENT ON COLUMN sms_message_audit.final_status IS 'True if message has reached terminal state (delivered, failed, etc.)';
