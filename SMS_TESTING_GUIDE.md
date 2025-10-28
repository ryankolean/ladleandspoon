# SMS Testing Guide

## Overview

This guide provides step-by-step instructions for testing the complete SMS system including outbound batch campaigns, inbound replies, STOP/START keywords, and status polling.

## Prerequisites

- Twilio account with SMS-enabled phone number
- Supabase project with all migrations applied
- Edge Functions deployed
- Webhook configured in Twilio Console
- Admin access to the application

## Quick Test Summary

1. Send batch SMS to 3 test users
2. Wait 2 minutes and poll status
3. Reply from phone
4. Send STOP to opt out
5. Send START to opt back in

## Detailed Testing Steps

See full testing procedures in TWILIO_WEBHOOK_SETUP.md

## Test Commands

```javascript
// Get eligible users
const { users } = await getEligibleSMSUsers();

// Send test campaign
const result = await sendBatchSMS({
  userIds: users.slice(0, 3).map(u => u.id),
  messageTemplate: 'Hi [First Name]! Test message.'
});

// Poll status after 2 min
const pollResult = await pollMessageStatus(10);

// Check conversations
const convos = await getConversations();
```

## Success Criteria

✅ Messages delivered
✅ Status polling works
✅ Replies stored
✅ STOP opts out
✅ START opts back in

