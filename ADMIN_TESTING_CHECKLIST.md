# Admin Role Testing Checklist

## Prerequisites (MUST BE COMPLETED FIRST)

Before testing, ensure you have completed:

- [ ] **Step 1**: Applied database migration in Supabase SQL Editor
  - File: `supabase/migrations/20251008000000_add_admin_role_management.sql`
  - Verified 4 functions exist: `is_user_admin`, `grant_admin_role`, `revoke_admin_role`, `list_users_with_roles`

- [ ] **Step 2**: Created your first admin user via SQL
  - Updated your profile role to 'admin'
  - Verified with SELECT query

## Testing Admin Role Verification

### Test 1: Admin User Can See Admin Features
**Steps:**
1. Log in with an account that has `role = 'admin'` in the database
2. After login, you should see:
   - [ ] View toggle button in top-right (Admin/Customer switch)
   - [ ] Can toggle to "Admin View"
   - [ ] Admin sidebar appears with navigation links
   - [ ] "User Management" link appears in sidebar

**Expected Result:** Admin user sees all admin features immediately

**Troubleshooting:**
- If view toggle doesn't appear, check browser console for errors
- Verify `User.isAdmin()` is returning true (check console)
- Confirm role='admin' in database with SQL query

### Test 2: Non-Admin User Cannot See Admin Features
**Steps:**
1. Create or log in with a regular customer account (role='customer')
2. After login, you should see:
   - [ ] NO view toggle button
   - [ ] Only customer ordering interface visible
   - [ ] Cannot access `/dashboard` URL directly
   - [ ] Cannot access `/users` URL directly

**Expected Result:** Customer sees only ordering interface, no admin features

**Troubleshooting:**
- If customer can see admin features, their role might be 'admin' in database
- Check their profile role with SQL

### Test 3: Admin Dashboard Access
**Steps:**
1. Log in as admin
2. Navigate to each admin page:
   - [ ] `/dashboard` - Dashboard loads successfully
   - [ ] `/orders` - Orders page loads
   - [ ] `/menu` - Menu management loads
   - [ ] `/reports` - Reports page loads
   - [ ] `/users` - User Management loads
   - [ ] `/settings` - Ordering Settings loads

**Expected Result:** All admin pages load without "Access Denied" errors

### Test 4: User Management Functionality
**Steps:**
1. Log in as admin
2. Navigate to `/users`
3. Verify:
   - [ ] See list of all registered users
   - [ ] See email, name, role, and join date for each user
   - [ ] See "Make Admin" button for customers
   - [ ] See "Revoke Admin" button for other admins
   - [ ] Cannot see "Revoke Admin" button for yourself

**Expected Result:** User list displays correctly with appropriate actions

### Test 5: Grant Admin Role
**Steps:**
1. Log in as admin
2. Navigate to `/users`
3. Find a customer user
4. Click "Make Admin" button
5. Verify:
   - [ ] Success message appears
   - [ ] User's role badge changes to "Admin"
   - [ ] Button changes to "Revoke Admin"
6. Have that user log in and verify they see admin features

**Expected Result:** User successfully promoted to admin

### Test 6: Revoke Admin Role
**Steps:**
1. Log in as admin
2. Navigate to `/users`
3. Find an admin user (NOT yourself)
4. Click "Revoke Admin" button
5. Verify:
   - [ ] Success message appears
   - [ ] User's role badge changes to "Customer"
   - [ ] Button changes to "Make Admin"
6. Have that user log in and verify they no longer see admin features

**Expected Result:** Admin role successfully revoked

### Test 7: Cannot Revoke Own Admin Role
**Steps:**
1. Log in as admin
2. Navigate to `/users`
3. Find your own user in the list
4. Verify:
   - [ ] You do NOT see a "Revoke Admin" button for yourself
   - [ ] Only see your role badge as "Admin"

**Expected Result:** Safety mechanism prevents self-revocation

### Test 8: View Toggle Works Correctly
**Steps:**
1. Log in as admin
2. Verify toggle shows "Admin" and "Customer" options
3. Click "Customer" view:
   - [ ] Interface switches to customer ordering page
   - [ ] View toggle still visible
   - [ ] Can place orders as a customer would
4. Click "Admin" view:
   - [ ] Interface switches back to admin dashboard
   - [ ] Admin sidebar appears
   - [ ] Can access all admin features

**Expected Result:** Seamless switching between admin and customer views

## Database Verification Queries

Run these in Supabase SQL Editor to verify database state:

### Check All User Roles
```sql
SELECT u.email, p.role, p.created_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY p.created_at DESC;
```

### Check Specific User's Admin Status
```sql
SELECT public.is_user_admin(
  (SELECT id FROM auth.users WHERE email = 'user@example.com')
);
```
Returns `true` for admin, `false` for non-admin

### Verify Functions Exist
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%admin%';
```
Should return 4 functions

## Common Issues and Solutions

### Issue: "Could not find the function public.is_user_admin"
**Solution:** Database migration not applied. Run Step 1 from ADMIN_SETUP_GUIDE.md

### Issue: Admin user doesn't see admin features
**Solution:**
1. Verify role='admin' in database
2. Clear browser cache
3. Log out and log back in
4. Check browser console for JavaScript errors

### Issue: Error when clicking "Make Admin" button
**Solution:**
1. Verify all 4 database functions exist
2. Check Supabase logs for detailed error
3. Ensure your account has admin role
4. Verify RLS policies are working

### Issue: View toggle doesn't appear
**Solution:**
1. User must have role='admin' in database
2. Check browser console for `User.isAdmin()` call errors
3. Verify database functions are accessible
4. Try hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

## Success Criteria

All tests should pass with these results:
- ✅ Admin users see and can use all admin features
- ✅ Customer users only see ordering interface
- ✅ Admin can grant/revoke admin roles to other users
- ✅ Admin cannot revoke their own admin role
- ✅ View toggle works for switching between admin and customer views
- ✅ All admin pages are protected and accessible only to admins
- ✅ Database functions work correctly
- ✅ No console errors during normal operation

## Testing Complete

If all tests pass:
- ✅ Admin role management system is working correctly
- ✅ Security is properly enforced at database and application level
- ✅ Users can be promoted/demoted as needed
- ✅ Admins can test customer experience with view toggle

Document any failures and refer to ADMIN_SETUP_GUIDE.md for troubleshooting steps.
