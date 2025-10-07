# Google OAuth Configuration Guide

This guide explains how to enable Google sign-in for the Ladle & Spoon application.

## Current Status

✅ **Code Implementation:** Fully complete and ready to use
⚠️ **Configuration:** Requires setup in Supabase Dashboard

## Prerequisites

1. A Google Cloud Platform account
2. Access to your Supabase project dashboard
3. Your Supabase project reference: `0ec90b57d6e95fcbda19832f`

## Step 1: Create Google OAuth Credentials

### 1.1 Access Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing one

### 1.2 Enable Required APIs

1. Navigate to **APIs & Services** → **Library**
2. Search for and enable:
   - Google+ API
   - Google Identity Services

### 1.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type (or Internal if using Google Workspace)
3. Fill in the required information:
   - **App name:** Ladle & Spoon
   - **User support email:** Your email address
   - **Developer contact email:** Your email address
4. Add scopes (optional for basic auth):
   - `openid`
   - `email`
   - `profile`
5. Save and continue

### 1.4 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application** as the application type
4. Configure:
   - **Name:** Ladle & Spoon Web Client
   - **Authorized JavaScript origins:**
     ```
     http://localhost:5173
     https://your-production-domain.com
     ```
   - **Authorized redirect URIs:**
     ```
     https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback
     http://localhost:5173
     https://your-production-domain.com
     ```
5. Click **Create**
6. **IMPORTANT:** Copy your **Client ID** and **Client Secret** - you'll need these!

## Step 2: Configure Supabase

### 2.1 Access Supabase Dashboard

1. Visit [Supabase Dashboard](https://supabase.com/dashboard/project/0ec90b57d6e95fcbda19832f)
2. Sign in to your account

### 2.2 Enable Google Provider

1. Navigate to **Authentication** → **Providers**
2. Find **Google** in the list of providers
3. Click to expand the Google provider settings
4. Toggle **Enable Sign in with Google** to ON
5. Enter your credentials:
   - **Google Client ID:** (from Step 1.4)
   - **Google Client Secret:** (from Step 1.4)
6. (Optional) Configure additional settings:
   - **Skip nonce check:** Leave unchecked for better security
   - **Allowed Client IDs:** Add additional client IDs if you have iOS/Android apps
7. Click **Save**

### 2.3 Verify Configuration

1. The provider should now show as "Enabled"
2. The callback URL should be:
   ```
   https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback
   ```

## Step 3: Test Google Sign-In

### 3.1 Test in Development

1. Navigate to the login page: `http://localhost:5173/login`
2. Click **Sign in with Google** button
3. You should be redirected to Google's OAuth consent screen
4. Authorize the application
5. You'll be redirected back to the order page
6. Your profile should be created automatically with your Google name

### 3.2 Troubleshooting

**Error: "Provider not enabled"**
- Verify Google provider is toggled ON in Supabase Dashboard
- Check that Client ID and Secret are correctly entered
- Ensure no extra spaces in the credentials

**Error: "Redirect URI mismatch"**
- Verify the callback URL in Google Cloud Console matches:
  `https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback`
- Add your local development URL if testing locally

**Error: "Access blocked"**
- Check OAuth consent screen configuration
- Ensure your email is added as a test user (for External apps in testing mode)
- Verify required scopes are configured

**Profile not created**
- Check browser console for errors
- Verify the database trigger `on_auth_user_created` exists
- Check Supabase logs for any errors

## Alternative: Programmatic Configuration

If you have a Supabase Management API token, you can configure Google OAuth programmatically:

```bash
curl -X PATCH \
  https://api.supabase.com/v1/projects/0ec90b57d6e95fcbda19832f/config/auth \
  -H "Authorization: Bearer YOUR_MANAGEMENT_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "external_google_enabled": true,
    "external_google_client_id": "YOUR_GOOGLE_CLIENT_ID",
    "external_google_secret": "YOUR_GOOGLE_CLIENT_SECRET"
  }'
```

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for sensitive data in production
3. **Restrict redirect URIs** to only your actual domains
4. **Regularly rotate** your Client Secret
5. **Monitor OAuth logs** in Google Cloud Console for suspicious activity
6. **Limit scopes** to only what's necessary for your application

## How It Works

### Authentication Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Redirected to Google OAuth consent screen
   ↓
3. User authorizes the application
   ↓
4. Google redirects to Supabase callback URL with auth code
   ↓
5. Supabase exchanges code for user information
   ↓
6. Supabase creates user in auth.users table
   ↓
7. Database trigger creates profile in profiles table
   ↓
8. User redirected back to application (order page)
   ↓
9. Application loads user profile and addresses
   ↓
10. Form auto-populates with user data
```

### Profile Creation

When a user signs in with Google for the first time:

1. Supabase creates an entry in `auth.users`
2. The `on_auth_user_created` trigger automatically fires
3. A profile is created in the `profiles` table with:
   - `id`: Matches the auth user ID
   - `full_name`: Extracted from Google profile
   - `email`: From auth.users (accessible via query)
   - `role`: Set to 'customer' by default

### Data Retrieved from Google

The application receives:
- Full name
- Email address
- Profile picture URL (stored in auth.users metadata)
- Google user ID (for identity linking)

## Support

If you encounter issues:

1. Check the [Supabase Auth documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
2. Review [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2)
3. Check browser console and Supabase logs for error messages
4. Verify all URLs and credentials are correct

## Current Implementation Status

✅ Login page with Google button
✅ OAuth flow implementation
✅ Error handling for unconfigured providers
✅ Automatic profile creation via database trigger
✅ Redirect flow back to order page
✅ Auth state change listener
✅ Form auto-population with user data

Only configuration in Supabase Dashboard is needed to make it fully functional!
