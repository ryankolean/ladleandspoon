# Batch SMS API - Personalized Campaign Sender

## Overview

This API endpoint enables sending personalized SMS messages to multiple users in a single batch operation. It handles message personalization, Twilio integration, opt-out compliance, status tracking, and comprehensive audit logging.

## Key Features

- **Personalized Messages**: Replace `[First Name]` placeholder with each user's actual first name
- **Batch Processing**: Send to up to 1000 users per request
- **Opt-Out Compliance**: Automatically skips users who have opted out
- **Consent Validation**: Only sends to users who have opted in (`sms_consent = true`)
- **Status Tracking**: Records initial Twilio status (queued, sent, failed)
- **Audit Logging**: Complete audit trail in `sms_message_audit` table
- **Error Handling**: Graceful handling of invalid numbers, missing data, and API errors
- **Rate Limiting**: 100ms delay between messages to prevent overwhelming Twilio API
- **Admin Only**: Restricted to users with admin role

## Database Schema

### sms_message_audit Table

```sql
CREATE TABLE sms_message_audit (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  phone_number text NOT NULL,
  message_body text NOT NULL,
  template_used text,
  twilio_message_sid text,
  twilio_status text DEFAULT 'queued',
  error_code text,
  error_message text,
  sent_by uuid REFERENCES profiles(id),
  batch_id uuid,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
```

## API Endpoint

### Request

**URL:** `/functions/v1/send-batch-sms`

**Method:** `POST`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Body:**
```json
{
  "userIds": ["uuid1", "uuid2", "uuid3"],
  "messageTemplate": "Hi [First Name]! We have a special offer just for you. Reply STOP to opt out."
}
```

**Parameters:**
- `userIds` (array, required): Array of user UUIDs to send messages to
  - Minimum: 1 user
  - Maximum: 1000 users per batch
- `messageTemplate` (string, required): Message template with `[First Name]` placeholder
  - `[First Name]` will be replaced with each user's actual first name
  - Falls back to "Customer" if first name is not available

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "batchId": "550e8400-e29b-41d4-a716-446655440000",
  "summary": {
    "total": 50,
    "successful": 45,
    "failed": 2,
    "skipped": 3
  },
  "results": [
    {
      "userId": "user-uuid-1",
      "phone": "+15551234567",
      "status": "success",
      "twilioSid": "SM1234567890abcdef",
      "twilioStatus": "queued"
    },
    {
      "userId": "user-uuid-2",
      "phone": "+15559876543",
      "status": "skipped",
      "reason": "User has not consented to SMS"
    },
    {
      "userId": "user-uuid-3",
      "phone": "+15555555555",
      "status": "failed",
      "error": "Invalid phone number format"
    }
  ],
  "message": "Batch SMS campaign completed. 45 sent, 2 failed, 3 skipped."
}
```

**Validation Errors (400 Bad Request):**

Empty user IDs:
```json
{
  "error": "userIds array is required and cannot be empty"
}
```

Missing template:
```json
{
  "error": "messageTemplate is required and cannot be empty"
}
```

Too many users:
```json
{
  "error": "Maximum 1000 users per batch"
}
```

**Authorization Errors:**

Missing authentication (401):
```json
{
  "error": "Authorization required"
}
```

Not an admin (403):
```json
{
  "error": "Admin access required"
}
```

**Server Errors (500):**
```json
{
  "error": "Failed to fetch users"
}
```

## Message Personalization

The API replaces the `[First Name]` placeholder with each user's actual first name:

**Template:**
```
Hi [First Name]! We're offering 20% off your next order. Use code SAVE20 at checkout.
```

**Personalized Messages:**
- For user "John Doe": `Hi John! We're offering 20% off your next order. Use code SAVE20 at checkout.`
- For user "Jane Smith": `Hi Jane! We're offering 20% off your next order. Use code SAVE20 at checkout.`
- For user with no first name: `Hi Customer! We're offering 20% off your next order. Use code SAVE20 at checkout.`

## Message Status Types

### Success Status
- `success`: Message successfully sent to Twilio
- Includes `twilioSid` and initial `twilioStatus` (typically "queued")

### Skipped Status
Messages are skipped when:
- User has no phone number on file
- User has not consented to SMS (`sms_consent = false`)
- User's phone number is in the opt-out table

### Failed Status
Messages fail when:
- Twilio API returns an error
- Invalid phone number format
- Network/connection errors
- Twilio rate limits exceeded

## Frontend Usage

### Basic Usage

```javascript
import { sendBatchSMS } from '@/services/sms';

async function sendCampaign() {
  try {
    const result = await sendBatchSMS({
      userIds: ['uuid1', 'uuid2', 'uuid3'],
      messageTemplate: 'Hi [First Name]! Check out our new menu items.'
    });

    console.log(`Campaign sent! Batch ID: ${result.batchId}`);
    console.log(`Summary: ${result.summary.successful} sent, ${result.summary.failed} failed`);

    // View detailed results
    result.results.forEach(r => {
      if (r.status === 'success') {
        console.log(`✓ Sent to ${r.phone} (${r.twilioSid})`);
      } else if (r.status === 'skipped') {
        console.log(`⊘ Skipped ${r.phone}: ${r.reason}`);
      } else {
        console.log(`✗ Failed ${r.phone}: ${r.error}`);
      }
    });
  } catch (error) {
    console.error('Campaign failed:', error.message);
  }
}
```

### Send to All Eligible Users

```javascript
import { getEligibleSMSUsers, sendBatchSMS } from '@/services/sms';

async function sendToAllEligible() {
  try {
    // Get all eligible users
    const { users } = await getEligibleSMSUsers();
    const userIds = users.map(u => u.id);

    console.log(`Sending to ${userIds.length} eligible users...`);

    // Send batch SMS
    const result = await sendBatchSMS({
      userIds,
      messageTemplate: 'Hi [First Name]! We have exciting news for you!'
    });

    console.log(`Campaign complete: ${result.summary.successful} sent`);
    return result;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}
```

### Get Campaign Summary

```javascript
import { getBatchCampaignSummary } from '@/services/sms';

async function viewCampaignStats(batchId) {
  try {
    const summary = await getBatchCampaignSummary(batchId);

    console.log(`Campaign Statistics:`);
    console.log(`Total Messages: ${summary.total_messages}`);
    console.log(`Successful: ${summary.successful}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Queued: ${summary.queued}`);
    console.log(`Sent By: ${summary.sent_by_name}`);
    console.log(`Sent At: ${summary.sent_at}`);

    return summary;
  } catch (error) {
    console.error('Error fetching summary:', error.message);
  }
}
```

### View Audit History

```javascript
import { getMessageAuditHistory } from '@/services/sms';

async function viewAuditLogs(batchId) {
  try {
    const logs = await getMessageAuditHistory({
      batchId: batchId,
      limit: 100
    });

    logs.forEach(log => {
      console.log(`${log.user.first_name} ${log.user.last_name}`);
      console.log(`  Phone: ${log.phone_number}`);
      console.log(`  Status: ${log.twilio_status}`);
      console.log(`  Message: ${log.message_body}`);
      console.log(`  Sent: ${log.sent_at}`);
    });

    return logs;
  } catch (error) {
    console.error('Error fetching audit logs:', error.message);
  }
}
```

### List Recent Campaigns

```javascript
import { getBatchCampaigns } from '@/services/sms';

async function listRecentCampaigns() {
  try {
    const campaigns = await getBatchCampaigns(20);

    campaigns.forEach(campaign => {
      console.log(`Batch ID: ${campaign.batch_id}`);
      console.log(`Template: ${campaign.template_used}`);
      console.log(`Sent By: ${campaign.profiles.first_name} ${campaign.profiles.last_name}`);
      console.log(`Sent At: ${campaign.sent_at}`);
      console.log('---');
    });

    return campaigns;
  } catch (error) {
    console.error('Error fetching campaigns:', error.message);
  }
}
```

## Complete React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import { getEligibleSMSUsers, sendBatchSMS } from '@/services/sms';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

function BatchSMSCampaign() {
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [messageTemplate, setMessageTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEligibleUsers();
  }, []);

  const loadEligibleUsers = async () => {
    try {
      const { users } = await getEligibleSMSUsers();
      setEligibleUsers(users);
      setSelectedUserIds(users.map(u => u.id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendCampaign = async () => {
    if (!messageTemplate.trim()) {
      setError('Please enter a message template');
      return;
    }

    if (selectedUserIds.length === 0) {
      setError('Please select at least one user');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const campaignResult = await sendBatchSMS({
        userIds: selectedUserIds,
        messageTemplate: messageTemplate
      });

      setResult(campaignResult);
      setMessageTemplate('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Send Batch SMS Campaign</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Eligible Recipients: {eligibleUsers.length}
        </h2>
        <p className="text-gray-600 mb-4">
          All selected users have opted in and are eligible to receive SMS messages.
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Message Template
        </label>
        <Textarea
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
          placeholder="Hi [First Name]! We have exciting news for you..."
          rows={4}
          className="w-full"
        />
        <p className="text-sm text-gray-500 mt-1">
          Use [First Name] to personalize the message. It will be replaced with each user's name.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Alert variant="success" className="mb-4">
          <AlertDescription>
            Campaign sent! {result.summary.successful} successful, {result.summary.failed} failed, {result.summary.skipped} skipped.
            <br />
            Batch ID: {result.batchId}
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleSendCampaign}
        disabled={loading || selectedUserIds.length === 0}
        className="w-full"
      >
        {loading ? 'Sending...' : `Send to ${selectedUserIds.length} Users`}
      </Button>
    </div>
  );
}

export default BatchSMSCampaign;
```

## Processing Logic

The batch SMS endpoint follows this workflow:

1. **Authentication & Authorization**
   - Validate JWT token
   - Verify user has admin role

2. **Input Validation**
   - Check userIds array is present and not empty
   - Verify messageTemplate is provided
   - Ensure batch size doesn't exceed 1000 users

3. **User Data Retrieval**
   - Fetch user profiles for provided IDs
   - Include: id, first_name, last_name, phone, email, sms_consent

4. **Opt-Out List Retrieval**
   - Fetch all opted-out phone numbers from `sms_opt_outs` table

5. **Per-User Processing**
   - **Skip if:** No phone number
   - **Skip if:** sms_consent is false
   - **Skip if:** Phone is in opt-out list
   - **Send if:** All checks pass

6. **Message Personalization**
   - Replace `[First Name]` with user's first_name
   - Fall back to "Customer" if first_name is null

7. **Twilio API Call**
   - Use Messaging Service SID
   - Send personalized message
   - Capture response and status

8. **Audit Logging**
   - Store all attempts in `sms_message_audit` table
   - Include: user, phone, message, status, errors
   - Group by batch_id for reporting

9. **Rate Limiting**
   - 100ms delay between messages
   - Prevents overwhelming Twilio API

10. **Response Generation**
    - Compile summary statistics
    - Include detailed per-user results
    - Return batch ID for tracking

## Error Handling

### Graceful Degradation

The API handles errors gracefully:

- **User Not Found**: Skips and continues with next user
- **Invalid Phone**: Logs error, marks as failed
- **Twilio Error**: Logs error code and message, continues
- **Network Error**: Retries aren't automatic (handled by Twilio)
- **Database Error**: Logs error but doesn't stop campaign

### Audit Trail Integrity

All attempts are logged, including:
- Successful sends
- Failed sends (with error details)
- Skipped users (with skip reason)

This ensures complete TCPA compliance and accountability.

## Rate Limiting

**Built-in Rate Limiting:**
- 100ms delay between messages
- Processes sequentially (not parallel)
- Maximum 1000 users per batch

**Twilio Rate Limits:**
- Twilio enforces its own rate limits
- Messaging Service handles queuing
- Failed messages due to rate limits will be logged

**Recommended Approach:**
For campaigns > 1000 users, split into multiple batches with delays between them.

## Security Features

1. **Admin-Only Access**: Only admin users can send batch SMS
2. **JWT Authentication**: Requires valid session token
3. **Opt-Out Compliance**: Automatically respects opt-outs
4. **Consent Validation**: Only sends to users who opted in
5. **Audit Logging**: Complete audit trail for compliance
6. **Input Validation**: Prevents malformed requests
7. **Service Role Key**: Secure database access with user context

## TCPA Compliance

This endpoint is designed for TCPA compliance:

- ✅ Requires explicit consent (`sms_consent = true`)
- ✅ Respects opt-outs (checks `sms_opt_outs` table)
- ✅ Complete audit trail of all messages
- ✅ Records consent method and date
- ✅ Allows users to opt out via STOP keyword
- ✅ Admin-only access for accountability
- ✅ Batch tracking for campaign management

## Implementation Files

- **Edge Function**: `/supabase/functions/send-batch-sms/index.ts`
- **Migration**: `/supabase/migrations/20251028000000_create_sms_message_audit_table.sql`
- **Frontend Service**: `/src/services/sms.js`
  - `sendBatchSMS()`
  - `getBatchCampaignSummary()`
  - `getMessageAuditHistory()`
  - `getBatchCampaigns()`

## Testing Checklist

- [ ] Send batch to 3 eligible users
- [ ] Verify personalization works correctly
- [ ] Confirm skipped users are not sent messages
- [ ] Check audit records are created
- [ ] Verify admin-only access (non-admin gets 403)
- [ ] Test with user who has no phone number
- [ ] Test with user who has opted out
- [ ] Test with invalid user IDs
- [ ] Verify batch summary is accurate
- [ ] Check Twilio statuses are recorded correctly
- [ ] Test maximum batch size (1000 users)
- [ ] Verify rate limiting delay (100ms between sends)
