/*
  # Create Delivery Settings System

  1. New Tables
    - `delivery_settings`
      - `id` (uuid, primary key) - Single row configuration
      - `base_delivery_fee` (numeric) - Base delivery fee in dollars
      - `is_active` (boolean) - Whether delivery fee is currently active
      - `updated_at` (timestamptz) - Last modification timestamp
      - `updated_by` (uuid) - Admin user who last updated settings

    - `delivery_settings_audit`
      - `id` (uuid, primary key) - Audit log entry ID
      - `base_delivery_fee` (numeric) - Fee value at time of change
      - `is_active` (boolean) - Active status at time of change
      - `changed_by` (uuid) - Admin user who made the change
      - `changed_at` (timestamptz) - When the change occurred
      - `change_reason` (text) - Optional reason for change

  2. Security
    - Enable RLS on both tables
    - Authenticated users can read delivery settings
    - Only admins can update delivery settings
    - Only admins can view audit logs

  3. Functions
    - `get_delivery_settings()` - Public function to retrieve current settings
    - `update_delivery_settings()` - Admin-only function to update settings with audit logging

  4. Initial Data
    - Insert default delivery settings with $5.00 base fee
*/

-- ============================================
-- CREATE TABLES
-- ============================================

-- Main delivery settings table (single row)
CREATE TABLE IF NOT EXISTS public.delivery_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 5.00 CHECK (base_delivery_fee >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for delivery settings changes
CREATE TABLE IF NOT EXISTS public.delivery_settings_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_delivery_fee NUMERIC(10, 2) NOT NULL,
  is_active BOOLEAN NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_reason TEXT
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.delivery_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_settings_audit ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Anyone authenticated can read delivery settings
CREATE POLICY "Authenticated users can read delivery settings"
  ON public.delivery_settings FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can update delivery settings
CREATE POLICY "Only admins can update delivery settings"
  ON public.delivery_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only admins can insert delivery settings (for initial setup)
CREATE POLICY "Only admins can insert delivery settings"
  ON public.delivery_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only admins can read audit logs
CREATE POLICY "Only admins can read audit logs"
  ON public.delivery_settings_audit FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only admins can insert audit logs (via function)
CREATE POLICY "Only admins can insert audit logs"
  ON public.delivery_settings_audit FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================
-- CREATE FUNCTIONS
-- ============================================

-- Function to get current delivery settings (public access)
CREATE OR REPLACE FUNCTION public.get_delivery_settings()
RETURNS TABLE (
  base_delivery_fee NUMERIC,
  is_active BOOLEAN,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ds.base_delivery_fee,
    ds.is_active,
    ds.updated_at
  FROM public.delivery_settings ds
  ORDER BY ds.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update delivery settings with audit logging (admin only)
CREATE OR REPLACE FUNCTION public.update_delivery_settings(
  new_base_fee NUMERIC,
  new_is_active BOOLEAN DEFAULT true,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  settings_id UUID;
  old_fee NUMERIC;
  old_active BOOLEAN;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update delivery settings';
  END IF;

  -- Validate fee amount
  IF new_base_fee < 0 THEN
    RAISE EXCEPTION 'Base delivery fee must be a positive number';
  END IF;

  -- Get current settings
  SELECT id, base_delivery_fee, is_active 
  INTO settings_id, old_fee, old_active
  FROM public.delivery_settings
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no settings exist, create initial record
  IF settings_id IS NULL THEN
    INSERT INTO public.delivery_settings (base_delivery_fee, is_active, updated_by)
    VALUES (new_base_fee, new_is_active, auth.uid())
    RETURNING id INTO settings_id;
  ELSE
    -- Update existing settings
    UPDATE public.delivery_settings
    SET 
      base_delivery_fee = new_base_fee,
      is_active = new_is_active,
      updated_at = NOW(),
      updated_by = auth.uid()
    WHERE id = settings_id;
  END IF;

  -- Log the change to audit table
  INSERT INTO public.delivery_settings_audit (
    base_delivery_fee,
    is_active,
    changed_by,
    change_reason
  ) VALUES (
    new_base_fee,
    new_is_active,
    auth.uid(),
    reason
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit history (admin only)
CREATE OR REPLACE FUNCTION public.get_delivery_settings_audit()
RETURNS TABLE (
  id UUID,
  base_delivery_fee NUMERIC,
  is_active BOOLEAN,
  changed_by_email TEXT,
  changed_at TIMESTAMPTZ,
  change_reason TEXT
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can view audit logs';
  END IF;

  RETURN QUERY
  SELECT 
    a.id,
    a.base_delivery_fee,
    a.is_active,
    u.email as changed_by_email,
    a.changed_at,
    a.change_reason
  FROM public.delivery_settings_audit a
  LEFT JOIN auth.users u ON u.id = a.changed_by
  ORDER BY a.changed_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION public.get_delivery_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_delivery_settings(NUMERIC, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_delivery_settings_audit() TO authenticated;

-- ============================================
-- INSERT DEFAULT SETTINGS
-- ============================================

-- Insert default delivery settings ($5.00 base fee, active)
INSERT INTO public.delivery_settings (base_delivery_fee, is_active)
VALUES (5.00, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_delivery_settings_updated_at ON public.delivery_settings(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_audit_changed_at ON public.delivery_settings_audit(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_audit_changed_by ON public.delivery_settings_audit(changed_by);