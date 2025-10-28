# SMS Status Polling System

## Overview

This system polls Twilio for message delivery status updates and maintains accurate status tracking in the database. It provides both background polling for bulk updates and on-demand status checks for real-time queries.

## Key Features

- **Background Polling**: Automatically checks messages that need status updates
- **On-Demand Checks**: Query specific messages, batches, or Twilio SIDs
- **Smart Polling**: Only checks messages in non-terminal states
- **Rate Limiting**: Prevents API abuse and respects Twilio limits
- **Status History**: Tracks polling attempts and status changes
- **Terminal State Detection**: Stops polling once message reaches final state
- **Batch Analytics**: View status breakdown for entire campaigns

## Status Lifecycle

### Twilio Status Values

| Status | Description | Terminal? | Keep Polling? |
|--------|-------------|-----------|---------------|
| `queued` | Waiting to be sent | No | Yes |
| `sending` | Currently being sent | No | Yes |
| `sent` | Sent to carrier | No | Yes |
| `delivered` | Delivered to device | **Yes** | No |
| `undelivered` | Failed to deliver | **Yes** | No |
| `failed` | Send failed | **Yes** | No |
| `canceled` | Message canceled | **Yes** | No |

### Status Flow

```
queued → sending → sent → delivered ✓
                      ↓
                    undelivered ✗
                      ↓
                    failed ✗
```

## Database Schema

### Updated Fields in sms_message_audit

```sql
ALTER TABLE sms_message_audit ADD COLUMN
  last_status_check timestamptz,        -- Last poll time
  status_check_count int DEFAULT 0,     -- Number of checks
  final_status boolean DEFAULT false;   -- Terminal state reached
```

### Indexes

```sql
CREATE INDEX idx_sms_audit_needs_check
  ON sms_message_audit(final_status, last_status_check)
  WHERE twilio_message_sid IS NOT NULL;
```

## API Endpoints

### 1. Background Polling Endpoint

**URL:** `/functions/v1/poll-message-status`

**Method:** `GET`

**Query Parameters:**
- `limit` (optional, default: 100, max: 500): Number of messages to check

**Authentication:** Admin only

**What it does:**
1. Fetches messages that need status checking
2. Polls Twilio for each message's current status
3. Updates database if status changed
4. Increments check count for all messages
5. Marks terminal states as final

**Selection Criteria:**
- Has Twilio message SID
- Not in final status
- Less than 20 check attempts
- Last check was > 5 minutes ago OR never checked

**Response:**
```json
{
  "success": true,
  "message": "Status check completed. 25 messages updated out of 100 checked.",
  "checked": 100,
  "updated": 25,
  "results": [
    {
      "messageId": "uuid",
      "twilioSid": "SM...",
      "oldStatus": "sent",
      "newStatus": "delivered",
      "updated": true
    },
    {
      "messageId": "uuid",
      "twilioSid": "SM...",
      "oldStatus": "queued",
      "newStatus": "queued",
      "updated": false
    }
  ]
}
```

### 2. On-Demand Status Check

**URL:** `/functions/v1/check-message-status`

**Method:** `GET`

**Query Parameters (one required):**
- `sid`: Twilio message SID (e.g., `SM1234567890abcdef`)
- `messageId`: Database message UUID
- `batchId`: Check all messages in a batch (up to 100)

**Authentication:** Admin only

**Response:**
```json
{
  "success": true,
  "message": "Status retrieved for 1 message(s)",
  "statuses": [
    {
      "messageId": "uuid",
      "twilioSid": "SM1234567890abcdef",
      "status": "delivered",
      "to": "+15551234567",
      "from": "+15559876543",
      "errorCode": null,
      "errorMessage": null,
      "dateSent": "2025-10-28T12:00:00Z",
      "dateUpdated": "2025-10-28T12:01:00Z",
      "price": "-0.00750",
      "priceUnit": "USD"
    }
  ]
}
```

## Frontend Usage

### 1. Background Polling (Manual Trigger)

```javascript
import { pollMessageStatus } from '@/services/sms';

// Poll up to 100 messages
const result = await pollMessageStatus(100);

console.log(`Checked: ${result.checked}`);
console.log(`Updated: ${result.updated}`);

// View detailed results
result.results.forEach(r => {
  if (r.updated) {
    console.log(`✓ ${r.twilioSid}: ${r.oldStatus} → ${r.newStatus}`);
  }
});
```

### 2. Check Single Message by Twilio SID

```javascript
import { checkMessageStatus } from '@/services/sms';

const result = await checkMessageStatus({
  sid: 'SM1234567890abcdef'
});

const status = result.statuses[0];
console.log(`Status: ${status.status}`);
console.log(`To: ${status.to}`);
console.log(`Sent: ${status.dateSent}`);
console.log(`Price: ${status.price} ${status.priceUnit}`);
```

### 3. Check Message by Database ID

```javascript
const result = await checkMessageStatus({
  messageId: 'message-uuid-here'
});

const status = result.statuses[0];
console.log(`Current status: ${status.status}`);
```

### 4. Check Entire Batch

```javascript
const result = await checkMessageStatus({
  batchId: 'batch-uuid-here'
});

console.log(`Checked ${result.statuses.length} messages`);

result.statuses.forEach(s => {
  console.log(`${s.to}: ${s.status}`);
});
```

### 5. Get Batch Status Breakdown

```javascript
import { getBatchStatusBreakdown } from '@/services/sms';

const breakdown = await getBatchStatusBreakdown('batch-uuid');

breakdown.forEach(item => {
  console.log(`${item.status}: ${item.count} messages`);
});

// Example output:
// delivered: 45
// sent: 3
// failed: 2
```

### 6. View Messages Needing Updates

```javascript
import { supabase } from '@/lib/supabase';

const { data } = await supabase.rpc('get_messages_needing_status_check', {
  p_limit: 50,
  p_max_checks: 20
});

console.log(`${data.length} messages need status check`);
```

## Automated Background Worker

### Option 1: Supabase Edge Function with Cron (Recommended)

While Supabase doesn't have built-in cron for Edge Functions, you can use external services:

**Using GitHub Actions:**
```yaml
name: Poll SMS Status
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
jobs:
  poll:
    runs-on: ubuntu-latest
    steps:
      - name: Poll Twilio Status
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}" \
            "${{ secrets.SUPABASE_URL }}/functions/v1/poll-message-status?limit=100"
```

**Using Vercel Cron:**
```json
{
  "crons": [
    {
      "path": "/api/cron/poll-sms-status",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Using EasyCron or similar:**
- URL: `https://your-project.supabase.co/functions/v1/poll-message-status?limit=100`
- Method: GET
- Headers: `Authorization: Bearer YOUR_SERVICE_KEY`
- Schedule: Every 5 minutes

### Option 2: Client-Side Polling

For smaller deployments, trigger polling from the admin dashboard:

```javascript
// In admin component
import { useEffect } from 'react';
import { pollMessageStatus } from '@/services/sms';

function AdminDashboard() {
  useEffect(() => {
    // Poll every 5 minutes when dashboard is open
    const interval = setInterval(async () => {
      try {
        const result = await pollMessageStatus(100);
        console.log(`Status polling: ${result.updated} updates`);
      } catch (error) {
        console.error('Polling failed:', error);
      }
    }, 5 * 60 * 1000);

    // Initial poll
    pollMessageStatus(100);

    return () => clearInterval(interval);
  }, []);

  return <div>Admin Dashboard</div>;
}
```

### Option 3: Manual Polling Button

```javascript
import { useState } from 'react';
import { pollMessageStatus } from '@/services/sms';
import { Button } from '@/components/ui/button';

function SMSStatusManager() {
  const [polling, setPolling] = useState(false);
  const [result, setResult] = useState(null);

  const handlePoll = async () => {
    setPolling(true);
    try {
      const pollResult = await pollMessageStatus(200);
      setResult(pollResult);
    } catch (error) {
      console.error('Polling error:', error);
    } finally {
      setPolling(false);
    }
  };

  return (
    <div>
      <Button onClick={handlePoll} disabled={polling}>
        {polling ? 'Polling...' : 'Update Message Statuses'}
      </Button>

      {result && (
        <div className="mt-4">
          <p>Checked: {result.checked} messages</p>
          <p>Updated: {result.updated} statuses</p>
        </div>
      )}
    </div>
  );
}
```

## Complete React Component Example

```javascript
import React, { useState, useEffect } from 'react';
import {
  checkMessageStatus,
  getBatchStatusBreakdown,
  pollMessageStatus
} from '@/services/sms';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function BatchStatusTracker({ batchId }) {
  const [statuses, setStatuses] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBatchStatus();
  }, [batchId]);

  const loadBatchStatus = async () => {
    setLoading(true);
    try {
      // Get status breakdown
      const breakdownData = await getBatchStatusBreakdown(batchId);
      setBreakdown(breakdownData);
    } catch (error) {
      console.error('Error loading status:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStatuses = async () => {
    setLoading(true);
    try {
      // Poll Twilio for latest statuses
      const result = await checkMessageStatus({ batchId });
      setStatuses(result.statuses);

      // Reload breakdown
      await loadBatchStatus();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Batch Status</h2>
        <Button onClick={refreshStatuses} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Status'}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {breakdown.map(item => (
          <Card key={item.status} className="p-4">
            <div className="text-sm text-gray-500">{item.status}</div>
            <div className="text-3xl font-bold">{item.count}</div>
          </Card>
        ))}
      </div>

      {statuses.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Detailed Status</h3>
          <div className="space-y-2">
            {statuses.map(s => (
              <div key={s.messageId} className="p-3 border rounded">
                <div className="flex justify-between">
                  <span className="font-medium">{s.to}</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    s.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    s.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {s.status}
                  </span>
                </div>
                {s.errorMessage && (
                  <div className="text-sm text-red-600 mt-1">
                    Error: {s.errorMessage}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BatchStatusTracker;
```

## Polling Strategy

### When to Poll

**High Priority (Poll frequently):**
- First 5 minutes after send: Every 1-2 minutes
- Status: `queued`, `sending`

**Medium Priority:**
- 5-30 minutes after send: Every 5 minutes
- Status: `sent`

**Low Priority:**
- 30+ minutes after send: Every 15-30 minutes
- Status: Still `sent` (may indicate carrier delay)

**Stop Polling:**
- Status: `delivered`, `undelivered`, `failed`, `canceled`
- After 20 check attempts (configurable)

### Polling Limits

**Built-in Limits:**
- Maximum 500 messages per API call
- Maximum 20 status checks per message
- Minimum 5 minutes between checks for same message
- 50ms delay between Twilio API calls

**Recommended Schedule:**
- Every 5 minutes for active campaigns
- Every 15 minutes for background maintenance
- On-demand for real-time dashboard views

## Error Handling

### Twilio API Errors

```javascript
try {
  const result = await checkMessageStatus({ sid: 'SM...' });
  const status = result.statuses[0];

  if (status.error) {
    console.error('Twilio error:', status.error);
    // Handle: Invalid SID, deleted message, etc.
  }
} catch (error) {
  if (error.message.includes('Admin access required')) {
    // Handle: User not authorized
  } else if (error.message.includes('Message not found')) {
    // Handle: Message doesn't exist in database
  } else {
    // Handle: Network or other errors
  }
}
```

### Rate Limiting

The system includes built-in rate limiting:
- 50ms delay between Twilio requests
- Maximum 500 messages per poll request
- Automatic retry isn't implemented (rely on next poll cycle)

## Monitoring & Analytics

### Query Messages Needing Updates

```sql
SELECT COUNT(*)
FROM sms_message_audit
WHERE twilio_message_sid IS NOT NULL
  AND final_status = false
  AND status_check_count < 20;
```

### View Status Distribution

```sql
SELECT twilio_status, COUNT(*)
FROM sms_message_audit
GROUP BY twilio_status
ORDER BY COUNT(*) DESC;
```

### Find Stuck Messages

```sql
SELECT *
FROM sms_message_audit
WHERE twilio_message_sid IS NOT NULL
  AND final_status = false
  AND status_check_count >= 10
  AND sent_at < now() - interval '1 hour';
```

## Best Practices

1. **Start Polling Immediately**: Begin checking status 1-2 minutes after sending batch
2. **Use Batch Checks**: Check entire batches instead of individual messages
3. **Monitor Terminal States**: Track delivery rates and failed messages
4. **Set Up Alerts**: Alert if too many failures or undelivered messages
5. **Archive Old Data**: Move terminal-state messages to archive after 30 days
6. **Use External Cron**: Don't rely on client-side polling for production
7. **Track Costs**: Monitor Twilio API usage and costs
8. **Handle Failures**: Retry failed status checks in next poll cycle

## Security

- ✅ Admin-only access for all status endpoints
- ✅ JWT authentication required
- ✅ Service role key used securely
- ✅ Rate limiting prevents API abuse
- ✅ No sensitive data in query params
- ✅ Audit trail maintained

## Implementation Files

- **Migration**: `/supabase/migrations/20251028000001_add_status_polling_to_audit.sql`
- **Polling Function**: `/supabase/functions/poll-message-status/index.ts`
- **Status Check Function**: `/supabase/functions/check-message-status/index.ts`
- **Frontend Service**: `/src/services/sms.js`
  - `pollMessageStatus()`
  - `checkMessageStatus()`
  - `getBatchStatusBreakdown()`

## Testing

### Test Manual Polling

```javascript
// Send a test batch
const result = await sendBatchSMS({
  userIds: ['test-user-id'],
  messageTemplate: 'Test message for [First Name]'
});

// Wait 2 minutes
await new Promise(resolve => setTimeout(resolve, 120000));

// Poll for status
const pollResult = await pollMessageStatus(10);
console.log(pollResult);

// Check specific batch
const batchStatus = await checkMessageStatus({
  batchId: result.batchId
});
console.log(batchStatus.statuses);
```

### Test Status Progression

```javascript
const sid = 'SM1234567890abcdef';

// Check every 30 seconds for 5 minutes
for (let i = 0; i < 10; i++) {
  const result = await checkMessageStatus({ sid });
  console.log(`[${i}] Status:`, result.statuses[0].status);
  await new Promise(resolve => setTimeout(resolve, 30000));
}
```

## Troubleshooting

**Problem:** Messages stuck in "sent" status
**Solution:** Check carrier delays. Messages can take 5-30 minutes to deliver.

**Problem:** "Too many status checks" error
**Solution:** Message has been checked 20 times. Check Twilio dashboard directly.

**Problem:** Status not updating in dashboard
**Solution:** Manually trigger `pollMessageStatus()` or refresh the page.

**Problem:** High API costs
**Solution:** Reduce polling frequency or limit number of messages checked per poll.
