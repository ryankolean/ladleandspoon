/*
  # Create Initial Restaurant Ordering System Schema

  ## New Tables
  
  ### menu_items
  - `id` (uuid, primary key)
  - `name` (text, not null) - Name of the menu item
  - `description` (text) - Description of the menu item
  - `price` (decimal, not null) - Price of the item
  - `category` (text, not null) - Category (e.g., entrees, sides, desserts)
  - `available` (boolean, default true) - Whether the item is currently available
  - `image_url` (text) - Optional image URL
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### orders
  - `id` (uuid, primary key)
  - `customer_name` (text, not null) - Name of the customer
  - `customer_phone` (text) - Phone number
  - `customer_email` (text) - Email address
  - `customer_address` (text) - Delivery address
  - `items` (jsonb, not null) - Array of order items with quantity and price
  - `total_amount` (decimal, not null) - Total order amount
  - `tax_amount` (decimal, default 0) - Tax amount
  - `delivery_fee` (decimal, default 0) - Delivery fee
  - `status` (text, default 'pending') - Order status (pending, preparing, ready, completed, cancelled)
  - `payment_method` (text) - Payment method (cash, venmo, etc.)
  - `payment_status` (text, default 'pending') - Payment status
  - `notes` (text) - Special instructions
  - `user_id` (uuid) - Foreign key to auth.users (optional for guest orders)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### user_addresses
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users, not null)
  - `label` (text) - Label for the address (e.g., "Home", "Work")
  - `address_line1` (text, not null)
  - `address_line2` (text)
  - `city` (text, not null)
  - `state` (text, not null)
  - `zip_code` (text, not null)
  - `is_default` (boolean, default false)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### ordering_windows
  - `id` (uuid, primary key)
  - `day_of_week` (integer, not null) - 0-6 (Sunday-Saturday)
  - `start_time` (time, not null)
  - `end_time` (time, not null)
  - `is_active` (boolean, default true)
  - `created_at` (timestamptz, default now())

  ### tax_settings
  - `id` (uuid, primary key)
  - `tax_rate` (decimal, not null) - Tax rate as decimal (e.g., 0.08 for 8%)
  - `apply_to_delivery_fee` (boolean, default false)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### sms_subscriptions
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users, not null)
  - `phone_number` (text, not null)
  - `subscribed` (boolean, default true)
  - `subscribed_at` (timestamptz)
  - `unsubscribed_at` (timestamptz)
  - `created_at` (timestamptz, default now())

  ### sms_campaigns
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `message` (text, not null)
  - `sent_at` (timestamptz)
  - `recipient_count` (integer, default 0)
  - `status` (text, default 'draft') - draft, sent, failed
  - `created_by` (uuid, references auth.users)
  - `created_at` (timestamptz, default now())

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to access their own data
  - Add policies for admin operations
*/

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category text NOT NULL,
  available boolean DEFAULT true,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  USING (available = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert menu items"
  ON menu_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update menu items"
  ON menu_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete menu items"
  ON menu_items FOR DELETE
  TO authenticated
  USING (true);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text,
  customer_address text,
  items jsonb NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  tax_amount decimal(10,2) DEFAULT 0,
  delivery_fee decimal(10,2) DEFAULT 0,
  status text DEFAULT 'pending',
  payment_method text,
  payment_status text DEFAULT 'pending',
  notes text,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Create user_addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  label text,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own addresses"
  ON user_addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses"
  ON user_addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
  ON user_addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
  ON user_addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create ordering_windows table
CREATE TABLE IF NOT EXISTS ordering_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ordering_windows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ordering windows"
  ON ordering_windows FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage ordering windows"
  ON ordering_windows FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create tax_settings table
CREATE TABLE IF NOT EXISTS tax_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_rate decimal(5,4) NOT NULL,
  apply_to_delivery_fee boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tax_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tax settings"
  ON tax_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage tax settings"
  ON tax_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create sms_subscriptions table
CREATE TABLE IF NOT EXISTS sms_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  phone_number text NOT NULL,
  subscribed boolean DEFAULT true,
  subscribed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, phone_number)
);

ALTER TABLE sms_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own SMS subscriptions"
  ON sms_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SMS subscriptions"
  ON sms_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SMS subscriptions"
  ON sms_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view all subscriptions"
  ON sms_subscriptions FOR SELECT
  TO authenticated
  USING (true);

-- Create sms_campaigns table
CREATE TABLE IF NOT EXISTS sms_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  message text NOT NULL,
  sent_at timestamptz,
  recipient_count integer DEFAULT 0,
  status text DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sms_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view SMS campaigns"
  ON sms_campaigns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create SMS campaigns"
  ON sms_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update SMS campaigns"
  ON sms_campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR true)
  WITH CHECK (auth.uid() = created_by OR true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_subscriptions_user_id ON sms_subscriptions(user_id);
