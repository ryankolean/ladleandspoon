# Batch SMS Quick Start Guide

## Quick Usage

### 1. Get Eligible Users

```javascript
import { getEligibleSMSUsers } from '@/services/sms';

const { users, count } = await getEligibleSMSUsers();
console.log(`${count} eligible users found`);
```

### 2. Send Batch Campaign

```javascript
import { sendBatchSMS } from '@/services/sms';

const result = await sendBatchSMS({
  userIds: users.map(u => u.id),
  messageTemplate: 'Hi [First Name]! Special offer today only!'
});

console.log(`Sent: ${result.summary.successful}`);
console.log(`Failed: ${result.summary.failed}`);
console.log(`Skipped: ${result.summary.skipped}`);
console.log(`Batch ID: ${result.batchId}`);
```

### 3. View Campaign Results

```javascript
import { getBatchCampaignSummary } from '@/services/sms';

const summary = await getBatchCampaignSummary(result.batchId);
console.log(summary);
// {
//   total_messages: 50,
//   successful: 45,
//   failed: 2,
//   queued: 3,
//   sent_at: '2025-10-28T...',
//   sent_by_name: 'Admin User'
// }
```

## Message Template Examples

### Simple Greeting
```
Hi [First Name]! Thanks for being a loyal customer.
```

### Promotional Offer
```
[First Name], exclusive offer just for you! Get 25% off with code SAVE25. Reply STOP to opt out.
```

### Order Update
```
Hi [First Name], your order is ready for pickup! See you soon at Ladle & Spoon.
```

### Event Invitation
```
[First Name], you're invited to our VIP tasting event this Saturday! RSVP by replying YES.
```

## Common Patterns

### Send to All Eligible Users

```javascript
const { users } = await getEligibleSMSUsers();
const result = await sendBatchSMS({
  userIds: users.map(u => u.id),
  messageTemplate: 'Your message here with [First Name]'
});
```

### Send to Specific Users

```javascript
const specificUserIds = ['uuid1', 'uuid2', 'uuid3'];
const result = await sendBatchSMS({
  userIds: specificUserIds,
  messageTemplate: 'Hi [First Name]! Custom message.'
});
```

### Send and Track Results

```javascript
const result = await sendBatchSMS({
  userIds: [...],
  messageTemplate: '...'
});

// Log detailed results
result.results.forEach(r => {
  console.log(`${r.phone}: ${r.status}`);
  if (r.status === 'success') {
    console.log(`  Twilio SID: ${r.twilioSid}`);
  } else if (r.status === 'skipped') {
    console.log(`  Reason: ${r.reason}`);
  } else if (r.status === 'failed') {
    console.log(`  Error: ${r.error}`);
  }
});
```

## Response Structure

### Success Response

```javascript
{
  success: true,
  batchId: "550e8400-e29b-41d4-a716-446655440000",
  summary: {
    total: 100,
    successful: 95,
    failed: 2,
    skipped: 3
  },
  results: [
    {
      userId: "user-uuid",
      phone: "+15551234567",
      status: "success",
      twilioSid: "SM1234567890abcdef",
      twilioStatus: "queued"
    },
    {
      userId: "user-uuid",
      phone: "N/A",
      status: "skipped",
      reason: "No phone number on file"
    }
  ],
  message: "Batch SMS campaign completed. 95 sent, 2 failed, 3 skipped."
}
```

## Status Types Explained

| Status | Description | Example Reason |
|--------|-------------|----------------|
| `success` | Message sent to Twilio | - |
| `skipped` | User not eligible | No phone, no consent, opted out |
| `failed` | Twilio or API error | Invalid number, API error |

## Audit & Reporting Functions

### Get Campaign Summary
```javascript
const summary = await getBatchCampaignSummary(batchId);
```

### Get Audit History
```javascript
// All messages from a batch
const logs = await getMessageAuditHistory({ batchId });

// Messages to specific user
const userLogs = await getMessageAuditHistory({ userId });

// Failed messages only
const failed = await getMessageAuditHistory({ status: 'failed' });

// Messages in date range
const recent = await getMessageAuditHistory({
  dateFrom: '2025-10-01',
  dateTo: '2025-10-31'
});
```

### List Recent Campaigns
```javascript
const campaigns = await getBatchCampaigns(20); // Last 20 campaigns
```

## Error Handling

```javascript
try {
  const result = await sendBatchSMS({
    userIds: [...],
    messageTemplate: '...'
  });

  if (result.summary.failed > 0) {
    console.warn(`${result.summary.failed} messages failed`);
    // Check result.results for details
  }

  if (result.summary.skipped > 0) {
    console.info(`${result.summary.skipped} messages skipped`);
  }

  console.log(`Campaign successful: ${result.batchId}`);
} catch (error) {
  if (error.message.includes('Admin access required')) {
    // Handle non-admin user
  } else if (error.message.includes('Authentication required')) {
    // Redirect to login
  } else {
    console.error('Campaign error:', error.message);
  }
}
```

## Limitations & Best Practices

### Limits
- Maximum 1000 users per batch
- 100ms delay between messages (rate limiting)
- Message template required (cannot be empty)
- User IDs array required (cannot be empty)

### Best Practices
1. **Always include opt-out text**: "Reply STOP to opt out"
2. **Test with small batch first**: Try 3-5 users before full campaign
3. **Use clear, concise messages**: SMS has character limits
4. **Personalize appropriately**: Use [First Name] thoughtfully
5. **Check summary after sending**: Review successful/failed/skipped counts
6. **Save batch ID**: For later audit and reporting
7. **Monitor audit logs**: Check for patterns in failures

### TCPA Compliance Reminders
- Only send to users who have explicitly opted in
- Include opt-out instructions in every message
- Honor opt-outs immediately
- Keep audit records for compliance
- Don't send promotional messages outside business hours

## Testing Commands

```javascript
// Test with 3 users
const testUsers = users.slice(0, 3);
const result = await sendBatchSMS({
  userIds: testUsers.map(u => u.id),
  messageTemplate: 'Test message for [First Name]'
});

// Verify personalization
console.log('Messages sent:');
result.results.forEach(r => {
  if (r.status === 'success') {
    console.log(`✓ ${r.phone}`);
  }
});

// Check audit records
const auditLogs = await getMessageAuditHistory({
  batchId: result.batchId
});
console.log(`${auditLogs.length} audit records created`);
```

## Environment Setup

Ensure these environment variables are configured in Supabase:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_MESSAGING_SERVICE_SID=your_messaging_service_sid
```

## Database Migration

Run this migration to create the audit table:

```sql
-- File: supabase/migrations/20251028000000_create_sms_message_audit_table.sql
-- This creates the sms_message_audit table and related functions
```

The migration is automatically applied when you deploy or run migrations.

## Need Help?

**Common Issues:**
- "Admin access required" → You need admin role to send batch SMS
- "Authentication required" → Log in first
- "No valid users found" → Check that user IDs exist in database
- "Maximum 1000 users per batch" → Split into smaller batches

**Check Audit Logs:**
```javascript
const logs = await getMessageAuditHistory({ status: 'failed', limit: 10 });
console.table(logs);
```

**View Campaign Statistics:**
```javascript
const summary = await getBatchCampaignSummary(batchId);
console.log(`Success Rate: ${(summary.successful / summary.total_messages * 100).toFixed(1)}%`);
```
