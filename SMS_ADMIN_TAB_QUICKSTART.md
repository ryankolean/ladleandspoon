# SMS Messaging Admin Tab - Quick Start

## Overview

The SMS Messaging tab in the admin sidebar provides a complete interface for managing customer SMS conversations with real-time updates and unread message tracking.

## Access

**Location:** Admin Sidebar → "SMS Messaging" (with unread badge)

**URL:** `/sms-panel`

**Permission:** Admin only

## Key Features

✅ **Unread Badge**: Red badge on sidebar tab shows total unread messages
✅ **Conversation List**: All customer conversations with search
✅ **Message Thread**: Complete conversation history
✅ **Send Replies**: Type and send messages directly
✅ **Auto Mark Read**: Opening conversation marks it as read
✅ **Real-time Updates**: New messages appear instantly
✅ **User Info**: Customer name, phone, and profile details
✅ **Message Status**: Delivery status for outbound messages
✅ **Timestamps**: All messages timestamped
✅ **Statistics**: Active conversations, unread count, authorized numbers

## UI Layout

```
Admin Sidebar                   SMS Messaging Center
┌─────────────┐    ┌────────────────────────────────────────────────┐
│ Dashboard   │    │ SMS Messaging Center              [↻] [⚙️]     │
│ Orders      │    ├───────────────────────────────────────────────┤
│ Menu        │    │ Active: 10 | Unread: 3 | Numbers: 1          │
│ Reports     │    ├───────────────┬───────────────────────────────┤
│ SMS [3]     │◄───│ [Search...]   │ John Doe                      │
│ Settings    │    │               │ (555) 123-4567                │
│             │    │ John Doe  [2] ├───────────────────────────────┤
│             │    │ (555)123-4567 │ Customer: Hi, I need help    │
│             │    │ 2 min ago     │ 10:30 AM                      │
│             │    │               │                               │
│             │    │ Jane Smith    │      Admin: Sure! How can    │
│             │    │ (555)987-6543 │      I help? ✓✓              │
│             │    │ 1 hour ago    │      10:31 AM                │
│             │    │               │                               │
└─────────────┘    │               │ [Type message...] [Send]      │
                   └───────────────┴───────────────────────────────┘
```

## Unread Badge Feature

### How It Works

1. **New inbound message arrives** → Unread count increments
2. **Badge appears on SMS tab** → Shows total unread across all conversations
3. **Admin clicks SMS tab** → Opens SMS Messaging page
4. **Admin clicks conversation** → Thread opens, marked as read automatically
5. **Badge updates** → Unread count decrements in real-time

### Badge Behavior

- **Red badge** with white text
- Shows **total unread** across all conversations
- **Updates in real-time** via Supabase subscriptions
- **Disappears** when no unread messages
- **Persists** across page navigation until messages read

## Using the SMS Tab

### Step 1: View Unread Messages

1. Look at admin sidebar
2. See "SMS Messaging" with red badge showing number (e.g., [3])
3. Badge indicates 3 total unread messages across all conversations

### Step 2: Open SMS Panel

1. Click "SMS Messaging" in sidebar
2. SMS Messaging Center opens
3. See statistics at top:
   - Active Conversations
   - Unread Messages (same as badge)
   - Authorized Numbers

### Step 3: View Conversations

Left sidebar shows all conversations:
- **Customer name** (or "Unknown Customer")
- **Phone number** (formatted)
- **Unread badge** (if conversation has unread messages)
- **Last message time** (e.g., "2 min ago")
- **Search box** to filter by name or phone

### Step 4: Open a Conversation

1. Click any conversation in list
2. Thread opens on right side
3. See complete message history:
   - **Inbound messages** (beige, left side)
   - **Outbound messages** (brown, right side)
   - **Timestamps** (e.g., "10:30 AM")
   - **Delivery status** icons
4. **Automatically marked as read**
5. Unread badge decrements

### Step 5: Send a Reply

1. Type message in text area at bottom
2. See character count (warns if > 160)
3. Press **Enter** to send (or click Send button)
4. Message appears immediately in thread
5. Customer receives SMS via Twilio
6. Status icon shows delivery progress

### Step 6: Monitor Status

Watch message status icons:
- ⏱️ **Clock**: Queued/sending
- ✓✓ **Gray**: Sent to carrier
- ✓✓ **Green**: Delivered to phone
- ⚠️ **Red**: Failed to send

## Real-time Updates

### Sidebar Badge
- Updates automatically when new messages arrive
- No page refresh needed
- Persists across admin pages

### Conversation List
- New conversations appear at top
- Unread counts update live
- Last message timestamps update

### Message Thread
- New messages appear instantly
- Sent messages show immediately
- Delivery status updates automatically

## Search Conversations

1. Type in search box at top of conversation list
2. Searches:
   - Customer first name
   - Customer last name
   - Phone number

**Examples:**
- "John" → finds John Doe
- "555" → finds all numbers with 555
- "(555) 123" → finds specific number

## Statistics Dashboard

Top of SMS Panel shows:

1. **Active Conversations**
   - Total number of active conversations
   - Does not include archived

2. **Unread Messages**
   - Same count as sidebar badge
   - Sum of all unread across conversations

3. **Authorized Numbers**
   - Count of Twilio numbers configured
   - Click settings icon to manage

## Common Workflows

### Respond to Customer Inquiry

```
1. See badge [1] on SMS tab
2. Click SMS Messaging
3. See conversation with unread badge
4. Click conversation
5. Read customer message
6. Type reply
7. Press Enter
8. Customer receives SMS
9. Badge disappears
```

### Handle Multiple Unread

```
1. Badge shows [5]
2. Open SMS Panel
3. See multiple conversations with unread badges
4. Click first conversation → reads and replies
5. Badge updates to [4]
6. Click next conversation → reads and replies
7. Badge updates to [3]
8. Continue until all handled
9. Badge disappears when done
```

### Monitor Delivery

```
1. Send reply to customer
2. Watch status icon:
   - Starts as ⏱️ (queued)
   - Changes to ✓✓ gray (sent)
   - Changes to ✓✓ green (delivered)
3. If ⚠️ red appears → check error message
```

## API Endpoints Used

All functionality uses existing infrastructure:

### Get Conversations
```javascript
GET via Supabase client
Table: sms_conversations
Includes: customer profile, unread_count
```

### Get Messages
```javascript
GET via Supabase client
Table: sms_messages
Filtered by: conversation_id
```

### Send Reply
```javascript
POST /functions/v1/send-sms
Body: { to, body }
Auth: Bearer token (admin)
```

### Mark as Read
```javascript
RPC: mark_messages_as_read
Param: conversation_id
Sets: unread_count = 0, read_at = now()
```

### Real-time Subscriptions
```javascript
Supabase.channel('sms-conversations')
Events: INSERT, UPDATE
Auto-updates: badge and conversation list
```

## Keyboard Shortcuts

- **Enter**: Send message
- **Shift+Enter**: New line in message
- **Esc**: Deselect conversation (coming soon)

## Best Practices

1. **Check badge regularly** - Respond promptly to customers
2. **Read messages completely** - Ensure you understand inquiry
3. **Be professional** - All messages represent your business
4. **Keep replies brief** - SMS is for quick communication
5. **Monitor delivery** - Watch for failed messages
6. **Use search** - Find customers quickly
7. **Refresh if needed** - Click refresh icon if updates delayed

## Troubleshooting

### Badge Not Updating

**Problem:** New message received but badge doesn't update

**Solutions:**
1. Wait 2-3 seconds (real-time has slight delay)
2. Click refresh icon in SMS Panel
3. Refresh browser page
4. Check browser console for errors

### Can't Send Messages

**Problem:** Send button disabled or message fails

**Solutions:**
1. Verify you're logged in as admin
2. Check Twilio credentials configured
3. Verify customer phone number valid
4. Check error message displayed

### Conversation Not Marked Read

**Problem:** Opened conversation but badge still shows unread

**Solutions:**
1. Close and reopen conversation
2. Click refresh icon
3. Check database: `unread_count` field
4. Verify mark_messages_as_read function exists

## Technical Details

### Badge Count Calculation

```sql
SELECT COUNT(*)
FROM sms_conversations
WHERE status = 'active'
  AND unread_count > 0;
```

### Mark as Read

```sql
UPDATE sms_conversations
SET unread_count = 0
WHERE id = conversation_id;

UPDATE sms_messages
SET read_at = now()
WHERE conversation_id = conversation_id
  AND direction = 'inbound'
  AND read_at IS NULL;
```

### Real-time Subscription

```javascript
supabase
  .channel('conversations')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'sms_conversations'
  }, (payload) => {
    // Update badge count
    loadUnreadCount();
  })
  .subscribe();
```

## Implementation Files

- **Layout with Badge**: `/src/pages/Layout.jsx` (lines 88, 253-257)
- **SMS Panel**: `/src/pages/SMSPanel.jsx`
- **Conversation List**: `/src/components/sms/ConversationList.jsx`
- **Message Thread**: `/src/components/sms/MessageThread.jsx`
- **Services**: `/src/services/sms.js`
  - `getConversationStats()` - for badge count
  - `subscribeToConversations()` - for real-time updates

## Summary

The SMS Messaging admin tab provides:

✅ **Visual notification** of unread messages via badge
✅ **Quick access** from any admin page
✅ **Complete conversation management** interface
✅ **Real-time updates** for messages and badge
✅ **Professional reply interface** for customer service
✅ **Automatic read tracking** for workflow efficiency

Simply watch for the red badge, click the tab, and handle customer messages efficiently from one centralized interface.
