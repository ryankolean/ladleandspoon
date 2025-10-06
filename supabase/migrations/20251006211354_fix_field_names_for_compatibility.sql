/*
  # Fix field names for code compatibility

  1. Changes to orders table
    - Add fields that the code expects (phone, delivery_address, subtotal, tax, total)
    - Add fields for address coordinates and guest status
    - Add inventory tracking fields to menu_items

  2. Updates
    - Add missing columns to support existing application code
    - Maintain backward compatibility with total_amount
*/

-- Add missing fields to orders table that the code expects
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'phone'
  ) THEN
    ALTER TABLE orders ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'delivery_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'address_lat'
  ) THEN
    ALTER TABLE orders ADD COLUMN address_lat decimal(10, 8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'address_lng'
  ) THEN
    ALTER TABLE orders ADD COLUMN address_lng decimal(11, 8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'is_guest'
  ) THEN
    ALTER TABLE orders ADD COLUMN is_guest boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'subtotal'
  ) THEN
    ALTER TABLE orders ADD COLUMN subtotal decimal(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'tax'
  ) THEN
    ALTER TABLE orders ADD COLUMN tax decimal(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'total'
  ) THEN
    ALTER TABLE orders ADD COLUMN total decimal(10,2);
  END IF;
END $$;

-- Add inventory tracking fields to menu_items
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menu_items' AND column_name = 'units_available'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN units_available integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menu_items' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN low_stock_threshold integer DEFAULT 5;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menu_items' AND column_name = 'variants'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN variants jsonb;
  END IF;
END $$;

-- Add missing fields to user_addresses
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_addresses' AND column_name = 'full_address'
  ) THEN
    ALTER TABLE user_addresses ADD COLUMN full_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_addresses' AND column_name = 'lat'
  ) THEN
    ALTER TABLE user_addresses ADD COLUMN lat decimal(10, 8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_addresses' AND column_name = 'lng'
  ) THEN
    ALTER TABLE user_addresses ADD COLUMN lng decimal(11, 8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_addresses' AND column_name = 'delivery_instructions'
  ) THEN
    ALTER TABLE user_addresses ADD COLUMN delivery_instructions text;
  END IF;
END $$;

-- Add missing fields to ordering_windows for the code to work properly
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordering_windows' AND column_name = 'is_open'
  ) THEN
    ALTER TABLE ordering_windows ADD COLUMN is_open boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordering_windows' AND column_name = 'use_recurring_schedule'
  ) THEN
    ALTER TABLE ordering_windows ADD COLUMN use_recurring_schedule boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordering_windows' AND column_name = 'days_of_week'
  ) THEN
    ALTER TABLE ordering_windows ADD COLUMN days_of_week text[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordering_windows' AND column_name = 'open_time'
  ) THEN
    ALTER TABLE ordering_windows ADD COLUMN open_time text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordering_windows' AND column_name = 'close_time'
  ) THEN
    ALTER TABLE ordering_windows ADD COLUMN close_time text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordering_windows' AND column_name = 'open_date'
  ) THEN
    ALTER TABLE ordering_windows ADD COLUMN open_date text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordering_windows' AND column_name = 'close_date'
  ) THEN
    ALTER TABLE ordering_windows ADD COLUMN close_date text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordering_windows' AND column_name = 'message'
  ) THEN
    ALTER TABLE ordering_windows ADD COLUMN message text;
  END IF;
END $$;

-- Add missing fields to tax_settings
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tax_settings' AND column_name = 'is_tax_enabled'
  ) THEN
    ALTER TABLE tax_settings ADD COLUMN is_tax_enabled boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tax_settings' AND column_name = 'tax_percentage'
  ) THEN
    ALTER TABLE tax_settings ADD COLUMN tax_percentage decimal(5,4);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tax_settings' AND column_name = 'tax_display_name'
  ) THEN
    ALTER TABLE tax_settings ADD COLUMN tax_display_name text DEFAULT 'Tax';
  END IF;
END $$;

-- Add missing fields to sms_subscriptions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sms_subscriptions' AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE sms_subscriptions ADD COLUMN customer_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sms_subscriptions' AND column_name = 'customer_email'
  ) THEN
    ALTER TABLE sms_subscriptions ADD COLUMN customer_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sms_subscriptions' AND column_name = 'is_subscribed'
  ) THEN
    ALTER TABLE sms_subscriptions ADD COLUMN is_subscribed boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sms_subscriptions' AND column_name = 'consent_method'
  ) THEN
    ALTER TABLE sms_subscriptions ADD COLUMN consent_method text;
  END IF;
END $$;
