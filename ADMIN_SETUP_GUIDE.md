# Admin Role Management System - Setup Guide

## Overview
This system allows you to manage admin roles for users in your restaurant application. Admin users have full access to the dashboard, orders, menu management, reports, and user administration.

## Step 1: Apply Database Migration

You need to run the SQL migration in your Supabase project to enable admin role functionality.

### Instructions:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Navigate to your project: `sgpsqlwggwtzmydntvny`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration**
   - Copy the contents of `supabase/migrations/20251008000000_add_admin_role_management.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the migration

### What the Migration Does:
- Adds an index on the `role` field in the `profiles` table for better performance
- Creates `is_user_admin()` function to check if a user has admin role
- Creates `grant_admin_role()` function (admin-only) to promote users to admin
- Creates `revoke_admin_role()` function (admin-only) to demote admins to customers
- Creates `list_users_with_roles()` function (admin-only) to view all users

## Step 2: Create Your First Admin User

After applying the migration, you need to set yourself as an admin.

### Method 1: Using SQL (Recommended for first admin)

1. In the Supabase SQL Editor, run this query:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

2. Verify it worked:

```sql
SELECT p.id, u.email, p.role
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'your-email@example.com';
```

You should see your email with role = 'admin'.

### Method 2: Using the Application (for subsequent admins)

Once you have at least one admin user:

1. Log in as an admin
2. Navigate to "User Management" in the admin sidebar
3. Click "Make Admin" next to any user to grant them admin privileges
4. Click "Revoke Admin" to remove admin privileges

## Step 3: Verify Admin Access

1. **Log out** (if currently logged in)
2. **Log back in** with your admin account
3. You should now see:
   - Admin dashboard with all management features
   - "User Management" link in the sidebar
   - View toggle in top-right to switch between admin and customer views

## Features

### Admin Dashboard Access
Admin users can access:
- **Dashboard**: Overview of orders, revenue, and statistics
- **Orders**: View and manage all orders
- **Delivery Route**: Plan delivery routes
- **Menu**: Manage menu items and inventory
- **SMS Marketing**: Send campaigns to customers
- **Reports**: View sales reports and analytics
- **Ordering Settings**: Configure ordering windows and tax settings
- **User Management**: Manage user roles (NEW)

### User Management Page
Located at `/users`, this page allows admins to:
- View all registered users
- See each user's role (Admin or Customer)
- Grant admin privileges to customers
- Revoke admin privileges from other admins
- See when users joined

### Security Features
- Only admins can access the User Management page
- Only admins can grant or revoke admin roles
- Admins cannot revoke their own admin role (prevents accidental lockout)
- All role changes are logged with timestamps
- RLS policies enforce admin-only access at the database level

### View Toggle
Admin users see a view toggle that allows them to:
- Switch between "Admin View" (dashboard) and "Customer View" (ordering interface)
- Test the customer experience while logged in as admin
- Quickly switch back to admin tasks

## Troubleshooting

### I can't see the User Management link
- Make sure you ran the database migration
- Verify your account has `role = 'admin'` in the profiles table
- Try logging out and back in

### Error: "Only admins can grant admin roles"
- This means your account doesn't have admin privileges
- Run the SQL command in Step 2 to manually set yourself as admin

### Error: "Cannot revoke your own admin role"
- This is intentional to prevent accidental lockout
- Have another admin revoke your role if needed

### Admin functions returning errors
- Ensure the database migration was applied successfully
- Check the Supabase logs for detailed error messages
- Verify RLS policies are enabled on the profiles table

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] First admin user created
- [ ] Can log in as admin and see full dashboard
- [ ] User Management page is accessible at `/users`
- [ ] Can view list of all users
- [ ] Can grant admin role to a customer
- [ ] Can revoke admin role from another admin
- [ ] Cannot revoke own admin role
- [ ] View toggle works to switch between admin/customer views
- [ ] Non-admin users cannot access admin pages

## API Functions Available

The following functions are now available in the auth service:

```javascript
import { User } from '@/services';

// Check if current user is admin
const isAdmin = await User.isAdmin();

// List all users with their roles (admin only)
const users = await User.listUsersWithRoles();

// Grant admin role to a user (admin only)
await User.grantAdminRole(userId);

// Revoke admin role from a user (admin only)
await User.revokeAdminRole(userId);
```

## Support

If you encounter issues not covered in this guide:
1. Check the browser console for JavaScript errors
2. Check Supabase logs for database errors
3. Verify all migration files in `supabase/migrations/` have been applied
4. Ensure your Supabase project is active and accessible

---

**Important Security Note**: Only grant admin access to trusted individuals. Admin users have full control over orders, menu, pricing, and user management.
