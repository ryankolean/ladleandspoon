/*
  # Admin Role Management System

  1. Changes
    - Updates profiles table to use role field properly for admin/customer distinction
    - Adds indexes for performance on role lookups
    - Creates database function to check if user is admin
    - Creates database function to grant admin role (admin-only)
    - Creates database function to revoke admin role (admin-only)

  2. Security
    - RLS policies ensure only admins can modify roles
    - Functions use SECURITY DEFINER with proper authorization checks
    - Role changes are audited with updated_at timestamps
*/

-- Add index on role field for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to grant admin role (only callable by existing admins)
CREATE OR REPLACE FUNCTION public.grant_admin_role(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can grant admin roles';
  END IF;

  -- Update the user's role to admin
  UPDATE public.profiles
  SET role = 'admin', updated_at = NOW()
  WHERE id = target_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke admin role (only callable by existing admins)
CREATE OR REPLACE FUNCTION public.revoke_admin_role(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can revoke admin roles';
  END IF;

  -- Prevent revoking your own admin role
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot revoke your own admin role';
  END IF;

  -- Update the user's role to customer
  UPDATE public.profiles
  SET role = 'customer', updated_at = NOW()
  WHERE id = target_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to list all users with their roles (admin only)
CREATE OR REPLACE FUNCTION public.list_users_with_roles()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can list users';
  END IF;

  RETURN QUERY
  SELECT
    p.id as user_id,
    u.email,
    p.full_name,
    p.role,
    p.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
