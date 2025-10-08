# Admin Role Management System - Setup Guide

## Overview
This system allows you to manage admin roles for users in your restaurant application. Admin users have full access to the dashboard, orders, menu management, reports, and user administration.

**⚠️ CRITICAL**: You MUST complete Step 1 and Step 2 below before the admin functionality will work. The application code is ready, but requires database setup.

## Step 1: Apply Database Migration

**This step is REQUIRED** - the SQL functions must be created in your database.

### Detailed Instructions:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard/projects
   - Click on your project: `sgpsqlwggwtzmydntvny`

2. **Navigate to SQL Editor**
   - In the left sidebar, find and click on "SQL Editor"
   - Click the "+ New Query" button at the top

3. **Copy the Migration SQL**
   - Open the file: `supabase/migrations/20251008000000_add_admin_role_management.sql`
   - Select ALL the contents (all 98 lines)
   - Copy to clipboard (Ctrl/Cmd + C)

4. **Paste and Run the Migration**
   - Paste the SQL into the Supabase SQL Editor (Ctrl/Cmd + V)
   - Click the green "Run" button (or press Ctrl/Cmd + Enter)
   - You should see: "Success. No rows returned"

5. **Verify the Migration Worked**
   Run this query in the SQL Editor:
   ```sql
   SELECT routine_name
   FROM information_schema.routines
   WHERE routine_schema = 'public'
   AND routine_name LIKE '%admin%';
   ```

   You should see 4 functions returned:
   - `grant_admin_role`
   - `is_user_admin`
   - `list_users_with_roles`
   - `revoke_admin_role`

   If you don't see these functions, the migration didn't run correctly - go back to step 3.

### What the Migration Does:
- Adds an index on the `role` field in the `profiles` table for better performance
- Creates `is_user_admin()` function to check if a user has admin role
- Creates `grant_admin_role()` function (admin-only) to promote users to admin
- Creates `revoke_admin_role()` function (admin-only) to demote admins to customers
- Creates `list_users_with_roles()` function (admin-only) to view all users

## Step 2: Create Your First Admin User

After applying the migration, you need to set yourself as an admin.

### Method 1: Using SQL (REQUIRED for first admin)

**You MUST do this to create your first admin user.**

1. **Find your email address**
   First, find your registered email. In the Supabase SQL Editor, run:
   ```sql
   SELECT email FROM auth.users ORDER BY created_at DESC LIMIT 5;
   ```
   This shows your most recent users. Find YOUR email address.

2. **Set yourself as admin**
   In the Supabase SQL Editor, run this query (replace the email):
   ```sql
   -- Replace 'your-email@example.com' with your actual email from step 1
   UPDATE public.profiles
   SET role = 'admin', updated_at = NOW()
   WHERE id = (
     SELECT id FROM auth.users WHERE email = 'your-email@example.com'
   );
   ```

3. **Verify it worked**
   Run this query to confirm:
   ```sql
   SELECT p.id, u.email, p.role
   FROM public.profiles p
   JOIN auth.users u ON u.id = p.id
   WHERE u.email = 'your-email@example.com';
   ```

   You should see one row with:
   - Your email address
   - role = 'admin'

   If you see role = 'customer' or NULL, the update didn't work - check your email spelling.

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

### I can't see the User Management link or admin dashboard
**Cause**: Your role is not set to 'admin' in the database

**Solution**:
1. Verify the database migration was applied (see Step 1)
2. Check your role with this SQL:
   ```sql
   SELECT u.email, p.role
   FROM auth.users u
   LEFT JOIN profiles p ON p.id = u.id
   WHERE u.email = 'your-email@example.com';
   ```
3. If role is NULL or 'customer', run the UPDATE command from Step 2
4. Clear browser cache and log out/log in again

### Error: "Could not find the function public.is_user_admin"
**Cause**: Database migration was not applied

**Solution**:
1. Go back to Step 1 and run the migration SQL
2. Verify functions exist with the verification query in Step 1
3. If functions don't appear, check Supabase project permissions

### Error: "Only admins can grant admin roles"
**Cause**: Your account doesn't have admin privileges

**Solution**:
- Run the SQL command in Step 2 to manually set yourself as admin
- Make sure you're using the correct email address
- Log out and log back in after updating

### Error: "Cannot revoke your own admin role"
**Cause**: This is intentional security feature

**Solution**:
- This prevents accidental lockout
- Have another admin revoke your role if needed
- Or manually update the database with SQL

### View toggle doesn't appear
**Cause**: User.isAdmin() is returning false

**Solution**:
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify your role is 'admin' in database (see first troubleshooting item)
4. Try clearing browser cache and logging in again

### "Access Denied" message appears
**Cause**: Either not logged in, or not an admin

**Solution**:
1. Make sure you're logged in
2. Verify your account has role = 'admin' in database
3. Check browser console for detailed error messages
4. Ensure database functions were created (Step 1)

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
