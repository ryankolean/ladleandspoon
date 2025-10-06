/*
  # Fix ordering windows table constraints

  1. Changes
    - Make day_of_week, start_time, end_time nullable since we have recurring schedule option
    - These fields are only needed for non-recurring schedules
*/

-- Make columns nullable for ordering_windows
ALTER TABLE ordering_windows 
  ALTER COLUMN day_of_week DROP NOT NULL,
  ALTER COLUMN start_time DROP NOT NULL,
  ALTER COLUMN end_time DROP NOT NULL;
