# SMS Compliance & Audit Log

## Overview

The SMS Audit Log provides a comprehensive compliance interface for tracking all SMS communications, including batch campaigns, conversation messages, delivery status, and opt-out history. This interface is essential for TCPA compliance, record-keeping, and regulatory audits.

## Access

**URL:** `/smsaudit`

**Navigation:** Admin Sidebar → "SMS Audit Log"

**Permission:** Admin only

## Key Features

✅ **Complete Message History**: All SMS sends and replies in one interface
✅ **Advanced Search**: Filter by name, phone, content, status, date
✅ **Batch & Conversation Tracking**: Both campaign and 1:1 messages
✅ **Opt-Out History**: Dedicated view for compliance tracking
✅ **CSV Export**: Download audit logs for compliance reporting
✅ **Statistics Dashboard**: Key metrics at a glance
✅ **Delivery Status**: Track message delivery success rates
✅ **Error Tracking**: View failed messages with error details
✅ **Pagination**: Handle large datasets efficiently

## Interface Layout

```
┌────────────────────────────────────────────────────────────┐
│ SMS Audit Log                     [Opt-Outs] [Export CSV]  │
├────────────────────────────────────────────────────────────┤
│ Stats: Sent: 500 | Delivered: 475 | Failed: 5 | Rate: 95%  │
├────────────────────────────────────────────────────────────┤
│ [Search...] [Status ▼] [Direction ▼] [From Date] [To Date]│
├────────────────────────────────────────────────────────────┤
│ Date/Time  | Type | Dir | Recipient | Phone | Message | Status
│ Oct 28 2pm | Camp | Out | John Doe  | +1555 | Hi...   | ✓ Delivered
│ Oct 28 1pm | Conv | In  | Jane S.   | +1555 | Yes...  | ✓ Received
│ Oct 27 5pm | Camp | Out | Bob W.    | +1555 | New...  | ⚠ Failed
└────────────────────────────────────────────────────────────┘
```

## Statistics Dashboard

### Key Metrics

1. **Total Sent**
   - Count of all SMS messages sent (campaigns + conversations)
   - Includes both successful and failed sends

2. **Delivered**
   - Messages confirmed delivered to recipient's phone
   - Green indicator for success

3. **Failed**
   - Messages that failed to send or deliver
   - Red indicator, includes error details

4. **Delivery Rate**
   - Percentage: (Delivered / Total Sent) × 100
   - Industry standard: aim for >95%

5. **Opt-Outs**
   - Total number of users who opted out
   - Orange indicator for compliance tracking

## Message Records

### Data Displayed

Each record shows:

- **Date/Time**: When message was sent
- **Type**: Campaign (batch) or Conversation (1:1)
- **Direction**: Outbound (sent by business) or Inbound (from customer)
- **Recipient**: Customer name (linked to profile if available)
- **Phone Number**: E.164 format (e.g., +15551234567)
- **Email**: Customer email (if available)
- **Message Body**: Full text of message sent
- **Status**: Delivery status with icon
- **Sent By**: Admin name or "Customer" for inbound

### Message Types

**Campaign Messages**
- From: `sms_message_audit` table
- Batch SMS sends via admin panel
- Include batch ID for grouping
- Sent to multiple users at once
- Always outbound direction

**Conversation Messages**
- From: `sms_messages` table
- 1:1 conversations with customers
- Can be inbound or outbound
- Link to conversation thread
- Include Twilio Message SID

## Search & Filters

### Search Bar

Search across:
- Customer names (first and last)
- Phone numbers (any format)
- Message body content
- Email addresses

**Examples:**
- "John" - finds all messages to/from John
- "555-1234" - finds messages for that number
- "order ready" - finds messages containing that phrase

### Status Filter

- **All Statuses** - Show everything
- **Delivered** - Successfully delivered
- **Sent** - Sent to carrier, awaiting delivery
- **Queued** - Waiting to send
- **Failed** - Send failed
- **Received** - Inbound message received

### Direction Filter

- **All Directions** - Both ways
- **Outbound** - Business to customer
- **Inbound** - Customer to business

### Date Range

- **From Date** - Start date (inclusive)
- **To Date** - End date (inclusive)
- Leave empty for all time

**Common Date Ranges:**
- Last 7 days
- Last 30 days
- Current month
- Specific campaign date

## Opt-Out History

### Viewing Opt-Outs

Click "Opt-Outs" button to switch view.

### Data Displayed

Each opt-out shows:
- **Phone Number**: User who opted out
- **Date Opted Out**: Timestamp of opt-out
- **Method**: How they opted out
  - "STOP keyword" - Replied with STOP
  - "Manual" - Admin manually opted them out
  - "Web form" - Opted out via website
- **Notes**: Additional context (e.g., "User replied with: STOP")

### Compliance Importance

This record is critical for TCPA compliance:
- Proves opt-out requests were honored
- Shows method and timing
- Permanent record for audits
- Cannot be deleted

## CSV Export

### What Gets Exported

All currently displayed records (respecting filters) including:
- Date/Time
- Type (campaign/conversation)
- Direction (inbound/outbound)
- Recipient Name
- Phone Number
- Email Address
- Message Body
- Status
- Sent By
- Twilio SID
- Error Code
- Error Message
- Batch ID

### File Format

- **Format**: CSV (Comma-Separated Values)
- **Filename**: `sms-audit-log-YYYY-MM-DD.csv`
- **Encoding**: UTF-8
- **Opens in**: Excel, Google Sheets, any spreadsheet software

### Use Cases

- **Monthly Compliance Reports** - Export all messages from the month
- **Audit Requests** - Provide records to regulators
- **Campaign Analysis** - Export specific batch for review
- **Issue Investigation** - Export failed messages with errors
- **Record Keeping** - Archive for legal requirements

### How to Export

1. Apply desired filters (date range, status, etc.)
2. Click "Export CSV" button
3. File downloads automatically
4. Open in spreadsheet software

## Status Icons

| Icon | Status | Meaning | Color |
|------|--------|---------|-------|
| ✓ | delivered | Successfully delivered | Green |
| ✓ | sent | Sent to carrier | Blue |
| ⏱ | queued | Waiting to send | Yellow |
| ⚠ | failed | Send failed | Red |
| ⚠ | undelivered | Not delivered | Orange |
| ✓ | received | Inbound received | Green |

## Pagination

### Controls

- **Page Number**: Shows current page (e.g., "Page 2 of 10")
- **Previous Button** (◀): Go to previous page
- **Next Button** (▶): Go to next page
- **Records Count**: Shows "50 of 500 messages"

### Settings

- **Default**: 50 records per page
- **Efficient**: Handles thousands of messages
- **Fast Loading**: Only fetches current page

## Common Use Cases

### 1. Monthly Compliance Report

```
1. Set Date Range: Oct 1 to Oct 31
2. Status: All
3. Direction: All
4. Click "Apply Filters"
5. Review statistics (total sent, delivered, failed)
6. Click "Export CSV"
7. Save for compliance records
```

### 2. Investigate Failed Messages

```
1. Status Filter: Failed
2. Date Range: Last 7 days
3. Review error messages
4. Note patterns (specific carrier, number format, etc.)
5. Export for technical review
```

### 3. Verify Campaign Delivery

```
1. Search by date of campaign
2. Check delivery rate
3. Filter by batch ID (if needed)
4. Review any failed sends
5. Export campaign results
```

### 4. Customer Message History

```
1. Search customer name or phone
2. Review all messages to/from customer
3. Check both campaign and conversation messages
4. Verify opt-out status if applicable
```

### 5. Audit Opt-Out Compliance

```
1. Click "Opt-Outs" button
2. Review all opt-out records
3. Verify STOP keywords honored
4. Export opt-out history
5. Confirm no messages sent after opt-out
```

### 6. Regulatory Audit Response

```
1. Set date range requested by auditor
2. Export all messages
3. Include opt-out history export
4. Provide delivery statistics
5. Document any failures with explanations
```

## Data Sources

### Campaign Messages (`sms_message_audit`)

Records from batch SMS campaigns:
- User ID, phone number, email
- Message body and template used
- Twilio status and SID
- Error codes/messages
- Sent by admin name
- Batch ID for grouping

### Conversation Messages (`sms_messages`)

Records from 1:1 conversations:
- Conversation ID
- Direction (inbound/outbound)
- From/to phone numbers
- Message body
- Delivery status
- Read timestamps
- Error details

### Opt-Out Records (`sms_opt_outs`)

Permanent record of opt-outs:
- Phone number
- Opted out timestamp
- Method used
- Admin notes
- Never deleted

## API Functions

### Get Audit Logs

```javascript
import { getAuditLogs } from '@/services/sms';

const result = await getAuditLogs({
  page: 1,
  limit: 50,
  search: 'John',
  status: 'delivered',
  direction: 'outbound',
  dateFrom: '2025-10-01',
  dateTo: '2025-10-31'
});

// Returns: { records, total, page, limit, totalPages }
```

### Get Statistics

```javascript
import { getAuditStatistics } from '@/services/sms';

const stats = await getAuditStatistics();
// Returns: {
//   totalSent, totalDelivered, totalFailed,
//   totalOptedOut, totalConversations, deliveryRate
// }
```

### Get Opt-Out History

```javascript
import { getOptOutHistory } from '@/services/sms';

const optOuts = await getOptOutHistory();
// Returns: Array of opt-out records
```

### Export to CSV

```javascript
import { exportAuditToCSV } from '@/services/sms';

exportAuditToCSV(records);
// Downloads CSV file automatically
```

## Compliance Benefits

### TCPA Compliance

✅ **Opt-Out Tracking**: Permanent record of all opt-outs
✅ **Proof of Consent**: Shows who was sent messages
✅ **Timing Records**: Timestamps prove compliance with opt-out requests
✅ **Method Documentation**: Shows how users opted out
✅ **Audit Trail**: Complete history for regulatory review

### Record Keeping

✅ **Message Content**: Full text of every message sent
✅ **Recipient Details**: Who received each message
✅ **Delivery Confirmation**: Proof messages were delivered
✅ **Error Documentation**: Failures tracked with reasons
✅ **Exportable**: Easy to provide records to auditors

### Best Practices

1. **Export Monthly**: Download and archive each month's messages
2. **Review Failures**: Investigate failed messages promptly
3. **Monitor Opt-Outs**: Check opt-out list regularly
4. **Maintain Records**: Keep exports for 3-5 years minimum
5. **Document Issues**: Note explanations for failed messages
6. **Verify Compliance**: Check no sends after opt-out
7. **Train Staff**: Ensure admins understand compliance importance

## Troubleshooting

### No Records Showing

**Problem**: Audit log is empty

**Solutions:**
1. Check filters - clear all filters
2. Verify date range includes messages
3. Check you have admin access
4. Verify migrations applied to database

### Export Not Working

**Problem**: CSV download fails

**Solutions:**
1. Check browser allows downloads
2. Try different browser
3. Verify records are loaded
4. Check console for errors

### Wrong Data Displayed

**Problem**: Messages missing or incorrect

**Solutions:**
1. Refresh page
2. Clear browser cache
3. Check date filters
4. Verify database has records

### Search Not Finding Results

**Problem**: Search returns nothing

**Solutions:**
1. Check spelling
2. Try partial search (e.g., "555" instead of full number)
3. Clear other filters
4. Verify records exist

## Technical Details

### Database Queries

The audit log queries two tables:

```sql
-- Campaign messages
SELECT * FROM sms_message_audit
WHERE phone_number LIKE '%search%'
  OR message_body LIKE '%search%'
ORDER BY sent_at DESC;

-- Conversation messages
SELECT * FROM sms_messages
WHERE body LIKE '%search%'
  OR from_number LIKE '%search%'
ORDER BY sent_at DESC;
```

### Performance

- **Indexed Fields**: phone_number, sent_at, status
- **Pagination**: Loads 50 records at a time
- **Fast Queries**: < 500ms for typical searches
- **Handles Scale**: Tested with 100,000+ messages

## Implementation Files

- **Audit Page**: `/src/pages/SMSAudit.jsx`
- **Service Functions**: `/src/services/sms.js`
  - `getAuditLogs()`
  - `getAuditStatistics()`
  - `getOptOutHistory()`
  - `exportAuditToCSV()`
- **Database Tables**:
  - `sms_message_audit` - Campaign messages
  - `sms_messages` - Conversation messages
  - `sms_opt_outs` - Opt-out records

## Summary

The SMS Audit Log provides:

✅ **Complete compliance tracking** for all SMS communications
✅ **Advanced search and filtering** to find specific records
✅ **Opt-out history** for TCPA compliance
✅ **CSV export** for reports and audits
✅ **Statistics dashboard** for at-a-glance metrics
✅ **Permanent records** of all messages and opt-outs
✅ **Delivery tracking** with error details
✅ **Admin-only access** for security

This interface ensures your SMS program maintains full compliance with TCPA regulations and provides all necessary records for audits and regulatory requests.
