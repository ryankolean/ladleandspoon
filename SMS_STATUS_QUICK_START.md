# SMS Status Polling - Quick Start Guide

## Overview

Automatically track message delivery status by polling Twilio's API. Messages transition from `queued` → `sent` → `delivered` (or `failed`).

## Quick Setup

### 1. Database Migration

The migration has been created. It adds:
- `last_status_check` - When status was last polled
- `status_check_count` - Number of polling attempts
- `final_status` - Whether message reached terminal state

### 2. API Endpoints Available

Two endpoints for status polling:

#### Background Polling (Bulk Updates)
```
GET /functions/v1/poll-message-status?limit=100
```

#### On-Demand Check (Real-time)
```
GET /functions/v1/check-message-status?sid=SM...
GET /functions/v1/check-message-status?batchId=uuid
```

## Basic Usage

### Check All Messages Needing Update

```javascript
import { pollMessageStatus } from '@/services/sms';

const result = await pollMessageStatus(100);
console.log(`Updated ${result.updated} of ${result.checked} messages`);
```

### Check Specific Batch

```javascript
import { checkMessageStatus } from '@/services/sms';

const result = await checkMessageStatus({
  batchId: 'your-batch-uuid'
});

result.statuses.forEach(s => {
  console.log(`${s.to}: ${s.status}`);
});
```

### Check Single Message

```javascript
// By Twilio SID
const result = await checkMessageStatus({
  sid: 'SM1234567890abcdef'
});

// By Database ID
const result = await checkMessageStatus({
  messageId: 'message-uuid'
});

console.log(result.statuses[0].status); // 'delivered', 'sent', etc.
```

### Get Status Breakdown

```javascript
import { getBatchStatusBreakdown } from '@/services/sms';

const breakdown = await getBatchStatusBreakdown('batch-uuid');

// Example output:
// [
//   { status: 'delivered', count: 45 },
//   { status: 'sent', count: 3 },
//   { status: 'failed', count: 2 }
// ]
```

## Automated Polling Options

### Option 1: Manual Button (Simplest)

Add a button to your admin dashboard:

```javascript
import { useState } from 'react';
import { pollMessageStatus } from '@/services/sms';

function StatusRefreshButton() {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await pollMessageStatus(100);
      alert('Status updated!');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleRefresh} disabled={loading}>
      {loading ? 'Updating...' : 'Refresh Status'}
    </button>
  );
}
```

### Option 2: Auto-Poll When Dashboard Open

```javascript
import { useEffect } from 'react';
import { pollMessageStatus } from '@/services/sms';

function AdminDashboard() {
  useEffect(() => {
    // Poll every 5 minutes
    const interval = setInterval(() => {
      pollMessageStatus(100).catch(console.error);
    }, 5 * 60 * 1000);

    // Initial poll
    pollMessageStatus(100);

    return () => clearInterval(interval);
  }, []);

  return <div>Dashboard</div>;
}
```

### Option 3: External Cron Service (Recommended)

Use a service like EasyCron, cron-job.org, or GitHub Actions:

**URL to call:**
```
https://your-project.supabase.co/functions/v1/poll-message-status?limit=200
```

**Method:** GET

**Headers:**
```
Authorization: Bearer YOUR_SUPABASE_SERVICE_KEY
```

**Schedule:** Every 5 minutes

**Using curl:**
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  "https://your-project.supabase.co/functions/v1/poll-message-status?limit=200"
```

## Status Types

| Status | Meaning | Terminal? |
|--------|---------|-----------|
| `queued` | Waiting in Twilio queue | No - Keep checking |
| `sending` | Being sent to carrier | No - Keep checking |
| `sent` | Accepted by carrier | No - Keep checking |
| `delivered` | Delivered to phone | **Yes - Stop checking** |
| `undelivered` | Failed to deliver | **Yes - Stop checking** |
| `failed` | Send failed | **Yes - Stop checking** |

## Complete Example: Track Campaign Status

```javascript
import {
  sendBatchSMS,
  checkMessageStatus,
  getBatchStatusBreakdown
} from '@/services/sms';

async function sendAndTrack() {
  // 1. Send campaign
  const campaign = await sendBatchSMS({
    userIds: [...],
    messageTemplate: 'Hi [First Name]!'
  });

  console.log(`Sent to ${campaign.summary.successful} users`);
  console.log(`Batch ID: ${campaign.batchId}`);

  // 2. Wait 2 minutes
  await new Promise(r => setTimeout(r, 120000));

  // 3. Check status
  const status = await checkMessageStatus({
    batchId: campaign.batchId
  });

  console.log(`Status check: ${status.statuses.length} messages`);

  // 4. Get breakdown
  const breakdown = await getBatchStatusBreakdown(campaign.batchId);

  breakdown.forEach(item => {
    console.log(`${item.status}: ${item.count}`);
  });

  return { campaign, status, breakdown };
}
```

## Display Status in UI

```javascript
function MessageStatus({ status }) {
  const statusConfig = {
    delivered: { color: 'green', label: 'Delivered' },
    sent: { color: 'blue', label: 'Sent' },
    queued: { color: 'yellow', label: 'Queued' },
    failed: { color: 'red', label: 'Failed' },
    undelivered: { color: 'red', label: 'Undelivered' }
  };

  const config = statusConfig[status] || { color: 'gray', label: status };

  return (
    <span className={`px-2 py-1 rounded bg-${config.color}-100 text-${config.color}-800`}>
      {config.label}
    </span>
  );
}
```

## Polling Rules

### Smart Polling Logic

The system automatically:
- ✅ Only polls messages with Twilio SID
- ✅ Skips messages in terminal state (`delivered`, `failed`, etc.)
- ✅ Stops after 20 check attempts
- ✅ Waits at least 5 minutes between checks
- ✅ Processes messages in order (newest first)

### Polling Frequency Recommendations

**Just sent (0-5 min):**
- Check every 1-2 minutes
- Most messages move from `queued` to `sent`

**Recently sent (5-30 min):**
- Check every 5 minutes
- Messages usually reach `delivered` or `failed`

**Old messages (30+ min):**
- Check every 15-30 minutes
- Catch delayed deliveries

**Delivered/Failed:**
- Stop checking (automatic)

## Common Patterns

### Poll After Sending Batch

```javascript
const campaign = await sendBatchSMS({...});

// Poll immediately after 2 minutes
setTimeout(async () => {
  await pollMessageStatus(100);
}, 120000);
```

### Real-time Status Dashboard

```javascript
import { useState, useEffect } from 'react';

function RealtimeDashboard({ batchId }) {
  const [breakdown, setBreakdown] = useState([]);

  const refresh = async () => {
    // Update status from Twilio
    await checkMessageStatus({ batchId });

    // Get new breakdown
    const data = await getBatchStatusBreakdown(batchId);
    setBreakdown(data);
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000); // Every 30s
    return () => clearInterval(interval);
  }, [batchId]);

  return (
    <div>
      {breakdown.map(item => (
        <div key={item.status}>
          {item.status}: {item.count}
        </div>
      ))}
    </div>
  );
}
```

### Export Status Report

```javascript
import { getMessageAuditHistory } from '@/services/sms';

async function exportStatusReport(batchId) {
  const logs = await getMessageAuditHistory({
    batchId,
    limit: 1000
  });

  const csv = [
    ['Phone', 'Status', 'Sent At', 'Twilio SID'].join(','),
    ...logs.map(log => [
      log.phone_number,
      log.twilio_status,
      log.sent_at,
      log.twilio_message_sid
    ].join(','))
  ].join('\n');

  // Download CSV
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sms-status-${batchId}.csv`;
  a.click();
}
```

## Troubleshooting

### Status Not Updating

**Problem:** Status still shows "sent" after 10 minutes

**Solutions:**
1. Manually trigger poll: `await pollMessageStatus(100)`
2. Check Twilio dashboard directly
3. Some carriers take 30+ minutes for delivery confirmation
4. Message may be stuck at carrier level

### Too Many API Calls

**Problem:** Hitting Twilio rate limits

**Solutions:**
1. Reduce polling frequency (check every 10-15 min instead of 5)
2. Lower limit per poll (50 instead of 100)
3. Only poll recent messages (< 24 hours old)

### Messages Never Reach "Delivered"

**Problem:** Messages stuck in "sent" status

**Explanation:** Some carriers don't send delivery receipts. "sent" means successfully handed off to carrier - this is normal for some networks.

**Solution:** Consider "sent" as success if no error after 1 hour.

## Testing

### Test Status Polling

```javascript
// 1. Send test message
const result = await sendBatchSMS({
  userIds: ['test-user-id'],
  messageTemplate: 'Test [First Name]'
});

console.log('Batch ID:', result.batchId);

// 2. Wait 1 minute
await new Promise(r => setTimeout(r, 60000));

// 3. Check status
const status = await checkMessageStatus({
  batchId: result.batchId
});

console.log('Current statuses:', status.statuses);

// 4. Check again after 5 minutes
await new Promise(r => setTimeout(r, 300000));
const finalStatus = await checkMessageStatus({
  batchId: result.batchId
});

console.log('Final statuses:', finalStatus.statuses);
```

### Monitor Polling

```javascript
// Enable verbose logging
const result = await pollMessageStatus(50);

console.log('=== POLLING RESULTS ===');
console.log(`Total checked: ${result.checked}`);
console.log(`Status updated: ${result.updated}`);
console.log(`No change: ${result.checked - result.updated}`);

result.results.forEach(r => {
  if (r.updated) {
    console.log(`✓ ${r.twilioSid}: ${r.oldStatus} → ${r.newStatus}`);
  } else if (r.error) {
    console.log(`✗ ${r.twilioSid}: ERROR - ${r.error}`);
  }
});
```

## Next Steps

1. **Set up automated polling**: Choose Option 1, 2, or 3 above
2. **Add status display**: Show current status in UI
3. **Monitor delivery rates**: Track % of delivered messages
4. **Set up alerts**: Alert if too many failures
5. **Archive old data**: Clean up messages > 30 days old

## API Reference

### Frontend Functions

```javascript
// Poll messages needing status update
pollMessageStatus(limit = 100)

// Check specific message(s)
checkMessageStatus({ sid?, messageId?, batchId? })

// Get status breakdown for batch
getBatchStatusBreakdown(batchId)

// Get audit history with filters
getMessageAuditHistory({ batchId?, status?, dateFrom?, dateTo? })
```

### Database Functions

```sql
-- Get messages needing check
SELECT * FROM get_messages_needing_status_check(100, 20);

-- Update message status
SELECT update_message_status(
  'message-uuid',
  'delivered',
  null,
  null
);

-- Get batch breakdown
SELECT * FROM get_batch_status_breakdown('batch-uuid');
```

## Summary

- **Background Polling**: Use external cron or client-side interval
- **On-Demand Checks**: Query specific messages/batches anytime
- **Smart Logic**: Only polls non-terminal states
- **Terminal States**: `delivered`, `failed`, `undelivered`, `canceled`
- **Recommended Frequency**: Every 5 minutes for active campaigns
- **Max Checks**: 20 per message (prevents infinite polling)
- **Admin Only**: All endpoints require admin authentication
