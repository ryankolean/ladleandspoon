/*
  # Add TextBee Integration for SMS Campaigns

  1. Changes to sms_campaigns table
    - Add `recipients` jsonb column to store selected phone numbers
    - Add `textbee_response` jsonb column to store API response
    - Add `sent_count` integer column to track successful sends
    - Add `failed_count` integer column to track failed sends
    - Add `error_message` text column for error tracking

  2. Security
    - Maintains existing RLS policies
    - Admin users can manage campaigns
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sms_campaigns' AND column_name = 'recipients'
  ) THEN
    ALTER TABLE sms_campaigns ADD COLUMN recipients jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sms_campaigns' AND column_name = 'textbee_response'
  ) THEN
    ALTER TABLE sms_campaigns ADD COLUMN textbee_response jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sms_campaigns' AND column_name = 'sent_count'
  ) THEN
    ALTER TABLE sms_campaigns ADD COLUMN sent_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sms_campaigns' AND column_name = 'failed_count'
  ) THEN
    ALTER TABLE sms_campaigns ADD COLUMN failed_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sms_campaigns' AND column_name = 'error_message'
  ) THEN
    ALTER TABLE sms_campaigns ADD COLUMN error_message text;
  END IF;
END $$;
