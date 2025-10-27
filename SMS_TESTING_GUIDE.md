# SMS Testing Quick Start Guide

## Test Configuration

The SMS Messaging Center is now ready for testing with Twilio integration.

### Test Phone Number
- **Number**: +1 (301) 820-0552
- **Status**: Authorized and verified
- **Customer**: Ryan Kolean (summitsoftwaresolutionsllc@gmail.com)
- **SMS Consent**: Enabled
- **Purpose**: Twilio integration testing

## How to Test SMS Sending

### 1. Access the SMS Panel

1. Log in as an admin user
2. Navigate to **SMS Messaging** from the admin menu
3. The SMS Messaging Center will open

### 2. View Authorized Numbers

- The test number should appear in the **Authorized Numbers** panel on the right
- Status should show as "Verified" with a green checkmark
- Verification notes: "Test number for Twilio SMS integration testing"

### 3. Send a Test Message

**Option A: Start New Conversation**
1. Click the "+" button to add an authorized number (if not already done)
2. Enter: +13018200552 or (301) 820-0552
3. The system will verify the number automatically

**Option B: Use Existing Conversation**
1. If a conversation exists, click on it from the conversation list
2. Type your test message in the message input
3. Click Send

### Test Messages to Try

```
Hello! This is a test message from Ladle and Spoon SMS system.
```

```
Testing Twilio integration. Please confirm receipt.
```

```
Order ready for pickup! Your food is fresh and waiting.
```

## What to Verify

### ✅ Successful Send Checklist

1. **Message appears in conversation thread**
   - Shows as outbound (right-aligned)
   - Displays timestamp
   - Shows "sent" status

2. **SMS received on phone**
   - Message arrives within 5-10 seconds
   - From number matches your Twilio number
   - Content is correct

3. **Database records created**
   - Check `sms_messages` table for new entry
   - Verify `twilio_message_sid` is populated
   - Status should be "sent" or "delivered"

### 🔍 Testing Inbound Messages

1. Reply to the SMS from your phone
2. Response should appear in conversation within seconds
3. Message should show as inbound (left-aligned)
4. Conversation should move to top of list

### 🚫 Testing Opt-Out

1. Reply with "STOP" from the test phone
2. Number should be automatically added to opt-outs
3. Future messages to this number should be blocked
4. Conversation status should update

## Twilio Configuration Required

Before testing, ensure Twilio is configured:

### Environment Variables (in Supabase)

```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_MESSAGING_SERVICE_SID=MG...
```

### Webhook Configuration

Set in Twilio Messaging Service:
```
https://sgpsqlwggwtzmydntvny.supabase.co/functions/v1/sms-webhook
```

### Trial Account Limitations

If using Twilio trial account:
- **Must verify phone numbers** in Twilio Console before sending
- Go to: Phone Numbers → Manage → Verified Caller IDs
- Add +13018200552 as a verified number
- Trial accounts can only send to verified numbers

## Troubleshooting

### Message Not Sending

**Check 1: Twilio Credentials**
```bash
# Verify env vars are set in Supabase Dashboard
Settings → Edge Functions → Environment Variables
```

**Check 2: Phone Number Verification**
- Number must exist in profiles table ✅
- SMS consent must be true ✅
- Number must be in E.164 format (+1...) ✅
- Number must not be in opt-outs table ✅

**Check 3: Admin Access**
- User must have role='admin' in profiles
- JWT must contain role in app_metadata

### Error: "Twilio credentials not configured"

1. Check Supabase environment variables
2. Verify all three variables are set
3. Redeploy edge function if needed

### Error: "Customer has opted out"

1. Check `sms_opt_outs` table
2. Remove opt-out record if testing:
```sql
DELETE FROM sms_opt_outs WHERE phone_number = '+13018200552';
```

### Error: "Phone number must be in E.164 format"

- Always use format: +13018200552
- Not: (301) 820-0552 or 301-820-0552
- The system auto-converts display formats

## Database Queries for Testing

### Check Message Status
```sql
SELECT
  id,
  direction,
  to_number,
  body,
  status,
  error_message,
  sent_at
FROM sms_messages
WHERE to_number = '+13018200552'
ORDER BY sent_at DESC
LIMIT 10;
```

### Check Conversation
```sql
SELECT
  c.*,
  p.first_name,
  p.last_name
FROM sms_conversations c
LEFT JOIN profiles p ON c.customer_id = p.id
WHERE c.customer_phone = '+13018200552';
```

### Check Authorized Status
```sql
SELECT * FROM authorized_phone_numbers
WHERE phone_number = '+13018200552';
```

### Check SMS Consent
```sql
SELECT
  id,
  email,
  phone,
  sms_consent,
  sms_consent_date,
  sms_consent_method
FROM profiles
WHERE phone = '+13018200552';
```

## Next Steps After Testing

### 1. Add Real Customers

- Customers must opt-in via `/sms-opt-in` page
- Or enable SMS consent in their profile settings
- Then authorize their numbers via SMS Panel

### 2. Production Deployment

- Upgrade Twilio account (remove trial limitations)
- Complete A2P 10DLC brand registration
- Set up usage alerts and monitoring
- Review compliance documentation

### 3. Monitor Usage

- Check Twilio Console for message logs
- Monitor delivery rates
- Track opt-outs and failures
- Set up billing alerts

## Support

For issues with:
- **Twilio API**: https://support.twilio.com
- **Application**: summitsoftwaresolutionsllc@gmail.com
- **SMS Compliance**: See `/sms-terms` and `/privacy-policy`

## Testing Checklist

- [ ] Twilio credentials configured in Supabase
- [ ] Test phone number verified in Twilio (if trial account)
- [ ] Test customer profile has SMS consent enabled
- [ ] Test number added to authorized_phone_numbers
- [ ] Can access SMS Panel as admin
- [ ] Can see test number in authorized list
- [ ] Can send test message successfully
- [ ] Message appears in conversation thread
- [ ] SMS received on physical phone
- [ ] Can receive reply messages
- [ ] Conversation updates in real-time
- [ ] Opt-out functionality works (STOP keyword)

---

**Last Updated**: 2025-10-27
**Test Number**: +1 (301) 820-0552
**Customer**: Ryan Kolean
**Status**: ✅ Ready for Testing
