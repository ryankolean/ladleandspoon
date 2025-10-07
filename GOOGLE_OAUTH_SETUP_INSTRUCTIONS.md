# Google OAuth Setup Instructions

## Current Status
✅ **Code Implementation**: Complete - The application has Google OAuth fully implemented in the codebase.
❌ **Configuration**: Not Set Up - Google OAuth is currently disabled in Supabase and requires configuration.

## Test Results
When testing the "Sign in with Google" button, the application correctly detects that Google OAuth is not configured and displays the error message:
> "Google sign-in is not configured yet. Please sign in with email/password instead."

## Setup Instructions

To enable Google OAuth sign-in, you need to configure both Google Cloud Console and Supabase.

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click on the project dropdown at the top
   - Either select an existing project or create a new one
   - Click "New Project" if needed and give it a name (e.g., "Ladle & Spoon")

3. **Enable Google+ API**
   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "External" user type (unless you have a Google Workspace)
   - Click "Create"
   - Fill in the required information:
     - **App name**: Ladle & Spoon
     - **User support email**: Your email
     - **Developer contact email**: Your email
   - Click "Save and Continue"
   - Skip the "Scopes" section (click "Save and Continue")
   - Skip "Test users" (click "Save and Continue")
   - Review and click "Back to Dashboard"

5. **Create OAuth Client ID**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application" as the application type
   - **Name**: Ladle & Spoon Web Client
   - **Authorized JavaScript origins**:
     - Add: `https://sgpsqlwggwtzmydntvny.supabase.co`
   - **Authorized redirect URIs**:
     - Add: `https://sgpsqlwggwtzmydntvny.supabase.co/auth/v1/callback`
   - Click "Create"

6. **Copy Your Credentials**
   - A dialog will show your **Client ID** and **Client Secret**
   - Copy both of these - you'll need them in the next step
   - You can always access them later from the Credentials page

### Step 2: Configure Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Navigate to your project: sgpsqlwggwtzmydntvny

2. **Enable Google Provider**
   - Go to "Authentication" in the left sidebar
   - Click on "Providers"
   - Find "Google" in the list
   - Toggle it to "Enabled"

3. **Add Google Credentials**
   - **Client ID**: Paste the Client ID from Google Cloud Console
   - **Client Secret**: Paste the Client Secret from Google Cloud Console
   - Click "Save"

### Step 3: Test the Integration

1. **Clear Browser Cache** (optional but recommended)
   - This ensures you're testing with fresh credentials

2. **Visit Your Application**
   - Go to the login page
   - Click "Sign in with Google"

3. **Expected Flow**
   - You'll be redirected to Google's sign-in page
   - Select your Google account
   - Grant permissions to the app
   - You'll be redirected back to your application, now signed in

### Step 4: Production Setup (When Ready)

When deploying to production with your own domain:

1. **Update Google OAuth Settings**
   - Go back to Google Cloud Console > Credentials
   - Edit your OAuth client ID
   - Add your production domain to:
     - **Authorized JavaScript origins**: `https://yourdomain.com`
     - **Authorized redirect URIs**: `https://sgpsqlwggwtzmydntvny.supabase.co/auth/v1/callback`

2. **Update OAuth Consent Screen**
   - Consider publishing your OAuth consent screen for public use
   - Add privacy policy and terms of service URLs

## Important Notes

- **Security**: Keep your Client Secret confidential. Never commit it to version control.
- **Testing**: The OAuth consent screen starts in "Testing" mode, limiting to 100 users. You can publish it when ready for production.
- **Callback URL**: The callback URL must always point to your Supabase project URL, not your frontend URL.
- **Email Verification**: Email confirmation is currently disabled in your Supabase project (auto-confirm is enabled), so Google sign-in users will have immediate access.

## Troubleshooting

### "Sign in with Google" button shows error
- Verify Google provider is enabled in Supabase
- Check that Client ID and Client Secret are correctly entered
- Ensure there are no trailing spaces in the credentials

### Redirect URI mismatch error
- Verify the redirect URI in Google Cloud Console exactly matches: `https://sgpsqlwggwtzmydntvny.supabase.co/auth/v1/callback`
- Check for typos or missing slashes

### "Access denied" error
- Make sure your OAuth consent screen is configured
- If in testing mode, ensure your Google account is added as a test user

### Still having issues?
- Check the browser console for detailed error messages
- Review Supabase logs in the Dashboard > Logs section
- Verify your Google Cloud project has the Google+ API enabled

## Current Workaround

Until Google OAuth is configured, users can:
- ✅ Sign up with email and password
- ✅ Sign in with email and password
- ✅ Reset password via email
- ✅ Continue as guest for placing orders

The application handles the unconfigured OAuth gracefully with user-friendly error messages.
