/*
  # Add formatted_address field to user_addresses table

  1. Changes
    - Add `formatted_address` column to user_addresses table
    - This field will store the complete formatted address string from Google Places API
    - Makes the schema compatible with the application code which expects formatted_address

  2. Notes
    - The existing full_address field will remain for backward compatibility
    - Applications should use formatted_address going forward
    - Both fields can be populated with the same value
*/

-- Add formatted_address column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_addresses' AND column_name = 'formatted_address'
  ) THEN
    ALTER TABLE user_addresses ADD COLUMN formatted_address text;
  END IF;
END $$;

-- Copy existing full_address values to formatted_address for existing records
UPDATE user_addresses
SET formatted_address = full_address
WHERE formatted_address IS NULL AND full_address IS NOT NULL;
