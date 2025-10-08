# Quick Start: Enable Admin Role Management

## 🚀 5-Minute Setup

Follow these steps to enable admin functionality in your restaurant app.

### Step 1: Run Database Migration (2 minutes)

1. **Open Supabase Dashboard**: https://supabase.com/dashboard/projects
2. **Click** on project: `sgpsqlwggwtzmydntvny`
3. **Click** "SQL Editor" in left sidebar
4. **Click** "+ New Query"
5. **Open file** in your project: `supabase/migrations/20251008000000_add_admin_role_management.sql`
6. **Copy ALL content** (98 lines) and paste into Supabase SQL Editor
7. **Click** green "Run" button
8. **Verify** you see: "Success. No rows returned"

### Step 2: Make Yourself Admin (2 minutes)

1. **Find your email** - Run this in SQL Editor:
   ```sql
   SELECT email FROM auth.users ORDER BY created_at DESC LIMIT 5;
   ```

2. **Set yourself as admin** - Run this (replace email):
   ```sql
   UPDATE public.profiles
   SET role = 'admin', updated_at = NOW()
   WHERE id = (
     SELECT id FROM auth.users WHERE email = 'YOUR-EMAIL@example.com'
   );
   ```

3. **Verify it worked** - Run this:
   ```sql
   SELECT u.email, p.role
   FROM auth.users u
   JOIN profiles p ON p.id = u.id
   WHERE u.email = 'YOUR-EMAIL@example.com';
   ```

   Should show: `role = 'admin'`

### Step 3: Test Admin Access (1 minute)

1. **Log out** of your app
2. **Log back in** with the email you made admin
3. **You should see:**
   - View toggle button (Admin/Customer) in top-right
   - Admin sidebar with navigation
   - "User Management" link in sidebar

4. **Click User Management** to see all users and manage roles

## ✅ Done!

You can now:
- Access the admin dashboard at `/dashboard`
- Manage users at `/users`
- Switch between admin and customer views
- Grant/revoke admin access to other users

## 🆘 Troubleshooting

### Can't see admin features?
1. Verify role='admin' in database (see Step 2 verification)
2. Clear browser cache (Ctrl+Shift+R)
3. Check browser console (F12) for errors

### Database function errors?
1. Make sure Step 1 migration was successful
2. Run this to verify functions exist:
   ```sql
   SELECT routine_name FROM information_schema.routines
   WHERE routine_schema = 'public' AND routine_name LIKE '%admin%';
   ```
   Should return 4 functions

## 📚 More Information

- **Full Setup Guide**: `ADMIN_SETUP_GUIDE.md`
- **Testing Guide**: `ADMIN_TESTING_CHECKLIST.md`
- **Implementation Details**: `ADMIN_IMPLEMENTATION_SUMMARY.md`

---

**Need help?** Check `ADMIN_SETUP_GUIDE.md` for detailed troubleshooting steps.
