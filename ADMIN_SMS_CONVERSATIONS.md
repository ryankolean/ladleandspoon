# Admin SMS Conversation Management

## Overview

The SMS Conversation Management system provides admins with a complete interface to view all customer message threads, send replies, and manage conversations. All functionality is admin-only and fully integrated with the existing SMS infrastructure.

## Features

✅ **View All Conversations**: List all active customer conversations
✅ **Message Threading**: See complete conversation history
✅ **Send Replies**: Respond directly to customer messages
✅ **Unread Tracking**: Visual indicators for unread messages
✅ **Real-time Updates**: Live message updates via Supabase subscriptions
✅ **Search**: Find conversations by name or phone number
✅ **Archive/Unarchive**: Manage conversation status
✅ **Admin-Only Access**: Restricted to admin role
✅ **Customer Info**: View linked profile details
✅ **Message Status**: See delivery status for outbound messages

## Access

**URL:** `/sms-panel`

**Permission:** Admin only

## UI Components

### 1. SMS Panel (`/src/pages/SMSPanel.jsx`)

Main container for SMS conversation management.

**Features:**
- Two-column layout (conversations list + message thread)
- Real-time conversation updates
- Refresh button to reload data
- Settings access for phone number management

### 2. Conversation List (`/src/components/sms/ConversationList.jsx`)

Left sidebar showing all active conversations.

**Features:**
- Search by name or phone number
- Unread count badges
- Last message timestamp
- Customer name display
- Phone number formatting
- Sorted by recent activity

**Display:**
- Customer name (if linked to profile)
- Phone number (formatted)
- Unread count (red badge)
- Time since last message

### 3. Message Thread (`/src/components/sms/MessageThread.jsx`)

Right panel showing conversation details and messages.

**Features:**
- Complete message history
- Inbound/outbound message styling
- Delivery status icons
- Character counter
- Real-time message updates
- Auto-scroll to new messages
- Mark as read automatically

**Message Status Icons:**
- ⏱️ Clock: Queued/sending
- ✓✓ Gray: Sent to carrier
- ✓✓ Green: Delivered
- ⚠️ Red: Failed

### 4. Reply Interface

Built into MessageThread component.

**Features:**
- Multi-line text area
- Character count (SMS segmentation)
- Enter to send, Shift+Enter for newline
- Send button with loading state
- Error display

## API Functions

### Get Conversations

```javascript
import { getConversations } from '@/services/sms';

const conversations = await getConversations();
// Returns: Array of active conversations with customer info
```

**Response:**
```json
[
  {
    "id": "uuid",
    "customer_phone": "+15551234567",
    "customer_id": "uuid",
    "last_message_at": "2025-10-28T12:00:00Z",
    "status": "active",
    "unread_count": 2,
    "customer": {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+15551234567"
    }
  }
]
```

### Get Conversation Messages

```javascript
import { getConversationMessages } from '@/services/sms';

const messages = await getConversationMessages(conversationId);
// Returns: Array of messages sorted by time
```

**Response:**
```json
[
  {
    "id": "uuid",
    "conversation_id": "uuid",
    "twilio_message_sid": "SM...",
    "direction": "inbound",
    "from_number": "+15551234567",
    "to_number": "+15559876543",
    "body": "Hello, I'd like to order",
    "status": "received",
    "sent_at": "2025-10-28T12:00:00Z"
  },
  {
    "id": "uuid",
    "direction": "outbound",
    "body": "Hi! I'd be happy to help you order.",
    "status": "delivered",
    "sent_at": "2025-10-28T12:01:00Z"
  }
]
```

### Reply to Conversation

```javascript
import { replyToConversation } from '@/services/sms';

const result = await replyToConversation({
  conversationId: 'uuid',
  body: 'Thank you for your message!'
});
```

**What it does:**
1. Looks up conversation
2. Gets customer phone number
3. Sends SMS via Twilio
4. Stores message in database
5. Updates conversation timestamp

### Mark Conversation as Read

```javascript
import { markConversationAsRead } from '@/services/sms';

await markConversationAsRead(conversationId);
// Resets unread_count to 0
```

### Get Conversation with Messages

```javascript
import { getConversationWithMessages } from '@/services/sms';

const conversation = await getConversationWithMessages(conversationId);
// Returns conversation + all messages in one call
```

### Archive/Unarchive

```javascript
import { 
  archiveConversation,
  unarchiveConversation,
  getArchivedConversations 
} from '@/services/sms';

// Archive conversation
await archiveConversation(conversationId);

// Unarchive conversation
await unarchiveConversation(conversationId);

// View archived conversations
const archived = await getArchivedConversations();
```

### Get Statistics

```javascript
import { getConversationStats } from '@/services/sms';

const stats = await getConversationStats();
// { totalActive: 10, totalUnread: 3 }
```

## Real-time Updates

The system uses Supabase real-time subscriptions for live updates.

### Conversation Updates

```javascript
import { subscribeToConversations } from '@/services/sms';

const channel = subscribeToConversations((payload) => {
  if (payload.eventType === 'INSERT') {
    // New conversation created
  } else if (payload.eventType === 'UPDATE') {
    // Conversation updated (new message, marked read, etc.)
  }
});

// Cleanup
channel.unsubscribe();
```

### Message Updates

```javascript
import { subscribeToMessages } from '@/services/sms';

const channel = subscribeToMessages(conversationId, (payload) => {
  if (payload.new) {
    // New message received
  }
});

// Cleanup
channel.unsubscribe();
```

## Usage Examples

### View All Conversations

Navigate to `/sms-panel` as an admin user.

**You'll see:**
- List of conversations on the left
- Most recent conversations at top
- Unread count badges
- Search bar to filter

### Open a Conversation

Click any conversation in the list.

**You'll see:**
- Customer name and phone at top
- Complete message history
- Inbound messages on left (beige)
- Outbound messages on right (brown)
- Message timestamps
- Delivery status icons
- Reply box at bottom

### Send a Reply

1. Click conversation
2. Type message in text area
3. Press Enter or click Send button
4. Message appears immediately
5. Status icon shows delivery progress

### Search Conversations

Type in search box at top of conversation list.

**Searches:**
- Customer names
- Phone numbers

**Example searches:**
- "John"
- "555-1234"
- "(555)"

### Mark as Read

Conversations are automatically marked as read when you open them.

**Manual mark as read:**
```javascript
await markConversationAsRead(conversationId);
```

## Message Flow

### Inbound Message Flow

```
Customer sends SMS
  ↓
Twilio webhook receives
  ↓
Message stored in sms_messages
  ↓
Conversation unread_count incremented
  ↓
Real-time update triggers
  ↓
Admin sees notification badge
  ↓
Admin opens conversation
  ↓
Marked as read automatically
```

### Outbound Reply Flow

```
Admin types reply
  ↓
Clicks Send button
  ↓
POST to send-sms Edge Function
  ↓
Twilio API sends SMS
  ↓
Message stored in sms_messages
  ↓
Real-time update triggers
  ↓
Message appears in thread
  ↓
Status polling updates delivery status
```

## Security

All conversation management is admin-only:

✅ **Authentication Required**: Must be logged in
✅ **Admin Role Check**: Must have admin role
✅ **RLS Policies**: Database enforces admin-only access
✅ **Edge Function Auth**: All API calls check admin status
✅ **No Customer Access**: Customers cannot see admin interface

## Database Tables

### sms_conversations

Stores conversation metadata.

```sql
CREATE TABLE sms_conversations (
  id uuid PRIMARY KEY,
  customer_phone text NOT NULL,
  customer_id uuid REFERENCES profiles(id),
  last_message_at timestamptz,
  status text DEFAULT 'active',
  unread_count integer DEFAULT 0,
  created_at timestamptz,
  updated_at timestamptz
);
```

### sms_messages

Stores individual messages.

```sql
CREATE TABLE sms_messages (
  id uuid PRIMARY KEY,
  conversation_id uuid REFERENCES sms_conversations(id),
  twilio_message_sid text UNIQUE,
  direction text CHECK (direction IN ('inbound', 'outbound')),
  from_number text NOT NULL,
  to_number text NOT NULL,
  body text,
  status text,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  error_code text,
  error_message text,
  created_at timestamptz
);
```

## Testing

### Test Conversation View

1. Have a customer reply to an SMS
2. Go to `/sms-panel`
3. Verify conversation appears in list
4. Verify unread count shows
5. Click conversation
6. Verify messages display correctly

### Test Reply

1. Open conversation
2. Type test message: "Test reply from admin"
3. Click Send
4. Verify message appears in thread
5. Check phone - verify SMS received
6. Wait 2 minutes
7. Verify delivery status updates

### Test Real-time Updates

1. Open SMS Panel in browser
2. Send SMS from phone to Twilio number
3. Verify conversation updates immediately
4. Verify new message appears without refresh
5. Verify unread count increments

### Test Mark as Read

1. Have unread conversation
2. Note unread count badge
3. Click conversation
4. Verify badge disappears
5. Check database: `unread_count = 0`

### Test Search

1. Have multiple conversations
2. Type customer name in search
3. Verify filtered results
4. Try phone number search
5. Verify both work

## Common Use Cases

### Respond to Customer Inquiry

```
Customer: "Hi, do you have gluten-free options?"
Admin: "Yes! We have several gluten-free items. Would you like to see the menu?"
Customer: "Yes please!"
Admin: "I'll text you our gluten-free menu link..."
```

### Handle Order Issue

```
Customer: "My order is late"
Admin: "I'm so sorry! Let me check on that for you right now."
Admin: "Your order is on its way and should arrive in 10 minutes. Thanks for your patience!"
Customer: "Thank you!"
```

### Confirm Pickup

```
Customer: "Is my order ready?"
Admin: "Yes! Your order is ready for pickup. See you soon!"
Customer: "Great, on my way"
```

## Best Practices

1. **Respond Promptly**: Check unread messages frequently
2. **Be Professional**: All messages represent your business
3. **Keep it Brief**: SMS is for quick communication
4. **Use Templates**: Create common responses for efficiency
5. **Mark as Read**: Open conversations to clear unread count
6. **Archive Old**: Archive resolved conversations
7. **Monitor Status**: Watch for failed messages
8. **Follow TCPA**: Respect opt-outs immediately

## Implementation Files

- **SMS Panel**: `/src/pages/SMSPanel.jsx`
- **Conversation List**: `/src/components/sms/ConversationList.jsx`
- **Message Thread**: `/src/components/sms/MessageThread.jsx`
- **Phone Manager**: `/src/components/sms/PhoneNumberManager.jsx`
- **Services**: `/src/services/sms.js`
- **Send SMS Function**: `/supabase/functions/send-sms/index.ts`
- **Database Schema**: `/supabase/migrations/20251020000000_create_sms_messaging_system.sql`

## Troubleshooting

### Messages Not Appearing

**Problem:** Sent message but not showing in thread

**Solutions:**
1. Check browser console for errors
2. Verify send-sms function deployed
3. Check Twilio credentials configured
4. Look at Edge Function logs

### Real-time Not Working

**Problem:** New messages don't appear without refresh

**Solutions:**
1. Check Supabase real-time enabled
2. Verify RLS policies allow subscriptions
3. Check browser console for subscription errors
4. Refresh page to reconnect

### Cannot Send Messages

**Problem:** Send button disabled or fails

**Solutions:**
1. Verify admin role assigned
2. Check Twilio credentials
3. Verify conversation exists
4. Check phone number format

### Unread Count Wrong

**Problem:** Unread count doesn't match actual

**Solutions:**
1. Mark conversation as read
2. Refresh page
3. Check database directly
4. Verify webhook processing messages

## Summary

The Admin SMS Conversation Management system provides:

✅ Complete conversation management
✅ Real-time message updates
✅ Professional reply interface
✅ Unread tracking and notifications
✅ Search and filtering
✅ Archive management
✅ Admin-only security
✅ Full integration with SMS system

Admins can effectively manage all customer SMS communications through a centralized, user-friendly interface.
