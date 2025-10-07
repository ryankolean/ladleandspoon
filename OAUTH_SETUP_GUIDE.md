# Third-Party Authentication Setup Guide

Complete guide for configuring Google and Facebook OAuth authentication for Ladle & Spoon.

---

## Table of Contents

1. [Overview](#overview)
2. [Google OAuth Setup](#google-oauth-setup)
3. [Facebook OAuth Setup](#facebook-oauth-setup)
4. [Account Linking](#account-linking)
5. [Testing OAuth Flow](#testing-oauth-flow)
6. [Troubleshooting](#troubleshooting)

---

## Overview

### What's Included

✅ **Google OAuth 2.0** - Sign in with Google button
✅ **Facebook Login** - Sign in with Facebook button
✅ **Automatic Account Linking** - Same email links accounts automatically
✅ **Error Handling** - Comprehensive error messages and recovery
✅ **Callback Handler** - Dedicated page for OAuth redirects

### How It Works

```
1. User clicks "Sign in with Google" or "Sign in with Facebook"
   ↓
2. Redirected to OAuth provider's consent screen
   ↓
3. User authorizes the application
   ↓
4. Provider redirects to /auth/callback with auth code
   ↓
5. Callback handler processes authentication
   ↓
6. Profile created/updated automatically
   ↓
7. User redirected to order page
```

### Automatic Account Linking

Supabase **automatically links** accounts with the same email address:

- User signs up with email/password
- Later signs in with Google using same email
- → Accounts automatically merged into one user

**Benefits:**
- No duplicate accounts
- Single user profile
- Can sign in with any linked method
- Seamless user experience

---

## Google OAuth Setup

### Prerequisites

- Google Cloud Platform account
- Supabase project with admin access

### Step 1: Create Google OAuth Credentials

#### 1.1 Access Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select existing

**Project Name:** Ladle & Spoon
**Organization:** Your organization (optional)

#### 1.2 Enable Required APIs

Navigate to **APIs & Services** → **Library**

Enable these APIs:
- Google+ API
- Google Identity Services
- Google People API (for profile data)

#### 1.3 Configure OAuth Consent Screen

Go to **APIs & Services** → **OAuth consent screen**

**User Type:**
- **External:** For public app (recommended)
- **Internal:** Only if using Google Workspace

**App Information:**
```
App name: Ladle & Spoon
User support email: [your-email@example.com]
Developer contact: [your-email@example.com]
```

**App Domain:**
```
Application home page: https://your-domain.com
Privacy policy: https://your-domain.com/privacy
Terms of service: https://your-domain.com/terms
```

**Authorized Domains:**
```
your-domain.com
0ec90b57d6e95fcbda19832f.supabase.co
```

**Scopes:**
Add these scopes for basic authentication:
- `.../auth/userinfo.email`
- `.../auth/userinfo.profile`
- `openid`

**Test Users (for External apps in testing mode):**
Add your email addresses for testing

#### 1.4 Create OAuth 2.0 Client ID

Go to **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**

**Application Type:** Web application

**Name:** Ladle & Spoon Web Client

**Authorized JavaScript Origins:**
```
http://localhost:5173
https://your-production-domain.com
https://0ec90b57d6e95fcbda19832f.supabase.co
```

**Authorized Redirect URIs:**
```
https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback
http://localhost:5173/auth/callback
https://your-production-domain.com/auth/callback
```

**IMPORTANT:** Copy your:
- **Client ID:** `xxxxx.apps.googleusercontent.com`
- **Client Secret:** `GOCSPX-xxxxx`

### Step 2: Configure in Supabase

#### 2.1 Access Supabase Dashboard

1. Visit [Supabase Dashboard](https://supabase.com/dashboard/project/0ec90b57d6e95fcbda19832f)
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list

#### 2.2 Enable Google Provider

**Toggle ON:** "Enable Sign in with Google"

**Configuration:**
```
Google Client ID: [Your Client ID from Step 1.4]
Google Client Secret: [Your Client Secret from Step 1.4]

Authorized Client IDs (optional):
[Add iOS/Android client IDs if you have mobile apps]

Skip nonce check: ❌ Leave unchecked
```

**Redirect URL (auto-configured):**
```
https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback
```

**Save Changes**

### Step 3: Verify Configuration

1. Open your app: `http://localhost:5173/login`
2. Click **"Sign in with Google"**
3. You should be redirected to Google's consent screen
4. After authorization, you'll return to the app
5. Your profile should be created automatically

✅ **Success:** Welcome message shows your Google name

---

## Facebook OAuth Setup

### Prerequisites

- Facebook Developer account
- Business verified for production (optional for testing)

### Step 1: Create Facebook App

#### 1.1 Access Facebook Developers

1. Visit [Facebook for Developers](https://developers.facebook.com/)
2. Sign in with your Facebook account
3. Click **"My Apps"** → **"Create App"**

#### 1.2 Choose App Type

**Select:** Consumer
**Display Name:** Ladle & Spoon
**Contact Email:** [your-email@example.com]
**Business Account:** Optional (create if needed)

#### 1.3 Add Facebook Login Product

In your app dashboard:

1. Click **"Add Product"**
2. Find **"Facebook Login"** → Click **"Set Up"**
3. Choose platform: **"Web"**

#### 1.4 Configure Facebook Login Settings

Go to **Facebook Login** → **Settings**

**Valid OAuth Redirect URIs:**
```
https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback
http://localhost:5173/auth/callback
https://your-production-domain.com/auth/callback
```

**Allowed Domains for the JavaScript SDK:**
```
localhost
your-domain.com
0ec90b57d6e95fcbda19832f.supabase.co
```

**Settings:**
- ✅ Client OAuth Login: ON
- ✅ Web OAuth Login: ON
- ✅ Enforce HTTPS: ON
- ❌ Use Strict Mode for Redirect URIs: OFF (for testing)

**Save Changes**

#### 1.5 Get App Credentials

Go to **Settings** → **Basic**

**Copy these values:**
- **App ID:** `1234567890123456`
- **App Secret:** Click **"Show"** to reveal

**Add Platform:**
1. Click **"Add Platform"** → **"Website"**
2. **Site URL:** `https://your-domain.com`
3. Save

### Step 2: Configure in Supabase

#### 2.1 Enable Facebook Provider

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/0ec90b57d6e95fcbda19832f)
2. Navigate to **Authentication** → **Providers**
3. Find **Facebook**

#### 2.2 Configure Facebook

**Toggle ON:** "Enable Sign in with Facebook"

**Configuration:**
```
Facebook Client ID: [Your App ID from Step 1.5]
Facebook Client Secret: [Your App Secret from Step 1.5]

Skip nonce check: ❌ Leave unchecked
```

**Redirect URL (auto-configured):**
```
https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback
```

**Save Changes**

### Step 3: Configure App Permissions

#### 3.1 Set Required Permissions

In Facebook App Dashboard → **App Review** → **Permissions and Features**

**Required Permissions:**
- `email` - Access user's email address
- `public_profile` - Access basic profile info

**Request Advanced Access:**
For production, you need to submit for App Review:
1. Provide use case explanation
2. Add privacy policy URL
3. Demonstrate how data is used
4. Wait for approval (can take 1-2 days)

**For Development:**
You can test with up to 10 test users without review

### Step 4: Add Test Users (Development)

Go to **Roles** → **Test Users**

1. Click **"Add"**
2. Create test users or add existing Facebook accounts
3. Use these accounts for testing before going live

### Step 5: Verify Configuration

1. Open your app: `http://localhost:5173/login`
2. Click **"Sign in with Facebook"**
3. You should be redirected to Facebook's consent dialog
4. After authorization, you'll return to the app
5. Your profile should be created automatically

✅ **Success:** Welcome message shows your Facebook name

---

## Account Linking

### How It Works

Supabase **automatically links identities** with the same email:

**Scenario 1: Sign Up with Email, Then Google**
```
1. User signs up: email@example.com + password
   → Profile created with ID: abc-123

2. User later signs in with Google: email@example.com
   → Supabase detects same email
   → Links Google identity to existing user abc-123
   → User can now sign in with either method
```

**Scenario 2: Google First, Then Email**
```
1. User signs in with Google: email@example.com
   → Profile created with ID: xyz-789

2. User tries to sign up with email: email@example.com
   → Supabase detects existing user
   → Links email/password to existing user xyz-789
   → User can now sign in with either method
```

**Scenario 3: Multiple OAuth Providers**
```
1. User signs in with Google: email@example.com
2. User later signs in with Facebook: email@example.com
   → Both linked to same user automatically
3. User can sign in with Google OR Facebook OR email/password
```

### Viewing Linked Identities

Check which identities are linked to a user:

```sql
SELECT
  u.email,
  i.provider,
  i.identity_data
FROM auth.users u
LEFT JOIN auth.identities i ON u.id = i.user_id
WHERE u.email = 'email@example.com';
```

**Example Result:**
```
email@example.com | email    | {email: "email@example.com"}
email@example.com | google   | {email: "email@example.com", name: "John Doe", ...}
email@example.com | facebook | {email: "email@example.com", name: "John D", ...}
```

### Managing Linked Identities

**In JavaScript:**
```javascript
// Get all identities for current user
const { data: identities } = await supabase.auth.getUserIdentities();
console.log(identities); // Array of linked providers

// Unlink an identity (must have at least 2 linked)
await supabase.auth.unlinkIdentity({
  identity_id: 'xxx-xxx-xxx'
});
```

### Benefits

✅ **Single User Experience** - One profile, multiple sign-in methods
✅ **No Duplicate Accounts** - Email is the unique identifier
✅ **User Convenience** - Sign in with any linked method
✅ **Data Consistency** - All data tied to one user ID

### Important Notes

**Email Verification:**
- OAuth providers (Google, Facebook) are considered "verified"
- Email/password requires verification if enabled
- Linked accounts inherit verified status

**Provider Conflicts:**
- If emails don't match, accounts stay separate
- Users can manually link accounts by signing in with both

**Primary Identity:**
- First sign-in method becomes primary
- Doesn't affect functionality - all methods work equally

---

## Testing OAuth Flow

### Local Development Testing

#### 1. Start Development Server
```bash
npm run dev
```

#### 2. Open Login Page
```
http://localhost:5173/login
```

#### 3. Test Google OAuth
1. Click **"Sign in with Google"**
2. Browser redirects to Google consent
3. Select your Google account
4. Grant permissions
5. **Callback URL:** `http://localhost:5173/auth/callback`
6. Processing message appears
7. Redirected to order page with welcome message

#### 4. Test Facebook OAuth
1. Click **"Sign in with Facebook"**
2. Browser redirects to Facebook login
3. Enter Facebook credentials
4. Grant permissions
5. **Callback URL:** `http://localhost:5173/auth/callback`
6. Processing message appears
7. Redirected to order page with welcome message

### Testing Account Linking

#### Test Case 1: Email First
```
1. Sign up with email: test@example.com
2. Log out
3. Sign in with Google: test@example.com
4. ✅ Should link to existing account
5. Check: SELECT * FROM auth.identities WHERE user_id = '[your-id]';
6. Should see both 'email' and 'google' providers
```

#### Test Case 2: Google First
```
1. Sign in with Google: test2@example.com
2. Log out
3. Try to sign up with email: test2@example.com
4. ✅ Should link to existing Google account
5. Can now sign in with both methods
```

#### Test Case 3: Multiple OAuth
```
1. Sign in with Google: test3@example.com
2. Log out
3. Sign in with Facebook: test3@example.com
4. ✅ Both linked to same user
5. Can sign in with either provider
```

### Expected Error Messages

**Provider Not Configured:**
```
"Google sign-in is not configured yet. Please sign in with email/password instead."
```

**User Cancelled:**
```
"You cancelled the sign-in process. Please try again."
```

**Network Error:**
```
"Server error occurred. Please try again later."
```

**Invalid Configuration:**
```
"Authentication failed. Please contact support."
```

---

## Troubleshooting

### Google OAuth Issues

#### Error: "Redirect URI Mismatch"

**Cause:** Callback URL not whitelisted in Google Cloud Console

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit OAuth 2.0 Client
3. Add to **Authorized redirect URIs:**
   ```
   https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback
   ```
4. Save and wait 5 minutes for changes to propagate

#### Error: "Access Denied"

**Cause:** App is in testing mode and user not added as test user

**Solution:**
1. Go to OAuth consent screen
2. Add user email to **Test users**
3. Or publish app to production

#### Error: "App Not Verified"

**Cause:** OAuth consent screen not configured properly

**Solution:**
1. Complete all required fields in OAuth consent screen
2. Add privacy policy and terms of service URLs
3. For public use, submit for verification

### Facebook OAuth Issues

#### Error: "URL Blocked"

**Cause:** Redirect URI not whitelisted in Facebook app settings

**Solution:**
1. Go to Facebook App Dashboard
2. Facebook Login → Settings
3. Add to **Valid OAuth Redirect URIs:**
   ```
   https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback
   ```
4. Save

#### Error: "App Not Set Up"

**Cause:** Facebook Login product not added or configured

**Solution:**
1. Go to App Dashboard → Add Product
2. Add "Facebook Login"
3. Complete all required configuration

#### Error: "Permissions Not Granted"

**Cause:** Required permissions not available without App Review

**Solution:**
- **For Testing:** Use test users (no review needed)
- **For Production:** Submit app for review with required permissions

### General OAuth Issues

#### Error: "Provider not enabled"

**Cause:** OAuth provider not enabled in Supabase dashboard

**Solution:**
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable the provider (Google/Facebook)
3. Add credentials (Client ID and Secret)
4. Save changes

#### Error: "Session not found"

**Cause:** Callback handler couldn't retrieve session

**Solution:**
1. Check browser console for errors
2. Verify Supabase URL and anon key in .env
3. Check network tab for failed API calls
4. Try clearing browser cookies and retry

#### Profile Not Created

**Cause:** Database trigger not firing or RLS blocking insert

**Solution:**
1. Verify trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. Check RLS policies allow insert:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

3. Check Supabase logs for errors

#### Multiple Accounts Created

**Cause:** Emails don't match exactly (case sensitive or different domains)

**Solution:**
1. OAuth providers return the exact email
2. Ensure email match is case-insensitive
3. Check `auth.identities` table for all user identities
4. Manually merge if needed via SQL

---

## Security Best Practices

### Client Secrets

❌ **NEVER** commit client secrets to version control
✅ **ALWAYS** use environment variables
✅ **ROTATE** secrets regularly (every 90 days recommended)

### OAuth Scopes

✅ **Request minimum scopes needed** (email + profile only)
❌ **DON'T** request unnecessary permissions
✅ **Explain** why each permission is needed

### Redirect URIs

✅ **Whitelist only** your actual domains
❌ **DON'T** use wildcards in production
✅ **Use HTTPS** for all redirect URIs in production

### Testing

✅ **Test account linking** with multiple providers
✅ **Test error scenarios** (cancelled auth, denied permissions)
✅ **Test on multiple browsers** (Chrome, Firefox, Safari)
✅ **Test mobile responsive** OAuth flows

---

## Production Checklist

### Before Going Live

- [ ] Google OAuth consent screen approved (if public)
- [ ] Facebook app approved for `email` and `public_profile` permissions
- [ ] All redirect URIs use HTTPS
- [ ] Privacy policy and terms of service published
- [ ] Test users can successfully sign in
- [ ] Profile creation works correctly
- [ ] Account linking tested with same email
- [ ] Error messages are user-friendly
- [ ] OAuth secrets stored securely
- [ ] Monitoring and logging configured

### Post-Launch Monitoring

- [ ] Monitor OAuth error rates
- [ ] Track successful vs failed auth attempts
- [ ] Monitor account linking behavior
- [ ] Check for duplicate accounts
- [ ] Review user feedback on auth experience

---

## Summary

### ✅ What's Implemented

| Feature | Status | Details |
|---------|--------|---------|
| Google OAuth | ✅ Ready | Code complete, needs configuration |
| Facebook OAuth | ✅ Ready | Code complete, needs configuration |
| Account Linking | ✅ Automatic | Supabase handles automatically |
| Error Handling | ✅ Complete | User-friendly error messages |
| Callback Handler | ✅ Complete | Dedicated /auth/callback page |
| Profile Creation | ✅ Automatic | Database trigger creates profiles |
| Security | ✅ Implemented | RLS policies, secure redirects |

### 🔧 Configuration Required

Both Google and Facebook OAuth require configuration in their respective developer consoles and in the Supabase dashboard. Follow the step-by-step guides above to complete the setup.

### 📝 Key Points

1. **Automatic Account Linking:** Same email = one user account
2. **No Code Changes Needed:** Just configure providers
3. **User-Friendly:** Clear error messages and feedback
4. **Secure:** Industry-standard OAuth 2.0 flow
5. **Production-Ready:** Comprehensive error handling

---

## Support

For issues or questions:

1. Check [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
2. Review [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
3. Review [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
4. Check browser console for error messages
5. Verify all configuration steps were completed

**Configuration Complete?** Test the OAuth flow at `/login` and enjoy seamless third-party authentication!
