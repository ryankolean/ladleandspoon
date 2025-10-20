# Twilio SMS Integration Setup Guide

## Overview

The SMS messaging system is fully integrated with Twilio and ready to use. This guide will walk you through setting up your Twilio account and configuring the necessary environment variables.

## Prerequisites

- Active Supabase account (already configured)
- Twilio account (free trial available)
- Phone number capable of SMS (for Twilio verification)

## Step 1: Create Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free trial account
3. Verify your phone number (required by Twilio)
4. Complete the account setup wizard

## Step 2: Get Twilio Credentials

### Account SID and Auth Token

1. Log in to your Twilio Console: [https://console.twilio.com](https://console.twilio.com)
2. On the dashboard, you'll see:
   - **Account SID** (starts with "AC...")
   - **Auth Token** (click "Show" to reveal)
3. Copy both values - you'll need them shortly

### Messaging Service SID

1. In the Twilio Console, navigate to **Messaging** → **Services**
2. Click **Create Messaging Service**
3. Give it a name (e.g., "Ladle and Spoon SMS")
4. Select **Notify my users** as the use case
5. Click **Create Messaging Service**
6. On the next page, copy the **Messaging Service SID** (starts with "MG...")

### Add a Phone Number

1. Still in the Messaging Service configuration, click **Add Senders**
2. Choose **Phone Number**
3. If you don't have a phone number yet:
   - Click **Buy a Number**
   - Select a US number with SMS capabilities
   - Complete the purchase (free on trial account)
4. Add the number to your Messaging Service
5. Click **Step 3: Set up integration** (we'll configure webhooks here)

## Step 3: Configure Webhooks

In the Messaging Service configuration:

1. Under **Inbound Settings**, find **Request URL**
2. Enter your webhook URL:
   ```
   https://sgpsqlwggwtzmydntvny.supabase.co/functions/v1/sms-webhook
   ```
3. Set HTTP Method to **POST**
4. Set Encoding to **application/x-www-form-urlencoded**
5. Click **Save**

## Step 4: Set Environment Variables in Supabase

1. Go to your Supabase Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: **sgpsqlwggwtzmydntvny**
3. Navigate to **Settings** → **Edge Functions** → **Environment Variables**
4. Add the following three secrets:

### Add TWILIO_ACCOUNT_SID
- Key: `TWILIO_ACCOUNT_SID`
- Value: Your Account SID from Step 2 (starts with "AC...")

### Add TWILIO_AUTH_TOKEN
- Key: `TWILIO_AUTH_TOKEN`
- Value: Your Auth Token from Step 2

### Add TWILIO_MESSAGING_SERVICE_SID
- Key: `TWILIO_MESSAGING_SERVICE_SID`
- Value: Your Messaging Service SID from Step 2 (starts with "MG...")

5. Click **Save** for each variable

## Step 5: Deploy Edge Functions

The edge functions are already created. To deploy them:

```bash
# Deploy send-sms function
npx supabase functions deploy send-sms --project-ref sgpsqlwggwtzmydntvny

# Deploy sms-webhook function
npx supabase functions deploy sms-webhook --project-ref sgpsqlwggwtzmydntvny
```

## Step 6: Test the Integration

### Add a Test Phone Number

1. Log in to your admin panel
2. Navigate to **SMS Messaging**
3. Click **Phone Number Management** (gear icon)
4. Add your verified phone number (must be a customer in the system)
5. The system will verify:
   - Phone number exists in customer database
   - Customer has given SMS consent
   - Customer hasn't opted out

### Send a Test Message

1. In the SMS Messaging panel, find your conversation
2. Type a test message: "Hello from Ladle and Spoon! This is a test message."
3. Click **Send**
4. You should receive the SMS on your phone within a few seconds

### Test Inbound Messages

1. Reply to the test message from your phone
2. The reply should appear in the conversation thread within seconds
3. Try sending "STOP" to test opt-out functionality
   - You should be automatically removed from authorized numbers
   - Future messages will be blocked

## Twilio Free Trial Limitations

The free trial account has some limitations:

- **Can only send SMS to verified phone numbers**
  - Go to **Phone Numbers** → **Manage** → **Verified Caller IDs**
  - Add and verify any numbers you want to test with
- **Trial balance**: $15.50 credit
- **SMS cost**: ~$0.0075 per message sent/received
- **You can send ~2,000 test messages** on the trial

To remove limitations, upgrade to a paid account.

## Production Checklist

Before launching to customers:

1. **Upgrade Twilio Account**
   - Remove trial limitations
   - Add payment method
   - Set up billing alerts

2. **Register Your Brand** (Required for US A2P 10DLC)
   - Navigate to **Messaging** → **Regulatory Compliance**
   - Complete brand registration
   - Register your use case
   - This process takes 1-3 business days

3. **Compliance**
   - Ensure all customers have given explicit consent
   - SMS Terms page is accessible: `/sms-terms`
   - Privacy Policy includes SMS: `/privacy-policy`
   - Opt-in process is clear: `/sms-opt-in`

4. **Monitor Usage**
   - Set up Twilio usage alerts
   - Monitor message delivery rates
   - Check for failed messages in SMS Panel

## Troubleshooting

### Error: "Twilio credentials not configured"
- Ensure all three environment variables are set in Supabase
- Restart edge functions after adding variables

### Error: "Customer has not consented to SMS communications"
- Verify the customer has `sms_consent = true` in profiles table
- Have customer go through opt-in process at `/sms-opt-in`

### Error: "Phone number must be in E.164 format"
- Phone numbers must be in format: `+15551234567`
- US numbers: `+1` + 10 digits
- No spaces, dashes, or parentheses

### Messages not being delivered
1. Check Twilio logs: **Monitor** → **Logs** → **Messaging**
2. Verify phone number is verified (if using trial account)
3. Check message status in `sms_messages` table
4. Ensure customer hasn't opted out

### Inbound messages not appearing
1. Verify webhook URL is correct in Messaging Service
2. Check Supabase logs for edge function errors
3. Test webhook manually using Twilio's webhook debugger
4. Ensure `sms_conversations` table has correct permissions

## Support

For Twilio-specific issues:
- Twilio Support: [https://support.twilio.com](https://support.twilio.com)
- Twilio Docs: [https://www.twilio.com/docs](https://www.twilio.com/docs)

For application issues:
- Contact: ladleandspoon1024@gmail.com
- Phone: (866) 660-1976

## Architecture Overview

### Components

1. **SMSPanel** (`/smspanel`): Admin interface for managing conversations
2. **ConversationList**: Shows all active SMS conversations
3. **MessageThread**: Displays messages in a conversation
4. **PhoneNumberManager**: Add/remove authorized phone numbers

### Edge Functions

1. **send-sms**: Sends outbound messages via Twilio API
   - Validates authentication and admin status
   - Checks opt-out status
   - Creates/updates conversation records
   - Logs all messages to database

2. **sms-webhook**: Receives inbound messages from Twilio
   - Processes incoming SMS
   - Handles STOP keywords for opt-outs
   - Updates conversation records
   - Stores messages in database

### Database Tables

- **sms_conversations**: Conversation metadata
- **sms_messages**: Individual messages (inbound/outbound)
- **authorized_phone_numbers**: Compliance-verified customers
- **sms_opt_outs**: Customers who opted out
- **profiles**: Customer data with SMS consent flag

### Security Features

- Admin-only access to SMS panel
- Row-level security on all tables
- Automatic opt-out handling
- Consent verification before messaging
- Audit trail for all messages
