# SMS Eligible Users API

## Overview

This API endpoint returns a list of users who are eligible to receive SMS messages. A user is considered eligible if they:
- Have opted in to SMS communications (`sms_consent = true`)
- Have a valid phone number (`phone IS NOT NULL`)
- Have not opted out (not present in `sms_opt_outs` table)

## Authentication & Authorization

**Access Level:** Admin only

The endpoint requires:
1. Valid authentication token in the Authorization header
2. User must have `role = 'admin'` in their profile

Non-admin users will receive a `403 Forbidden` response.

## API Endpoint

### Request

**URL:** `/functions/v1/sms-eligible-users`

**Method:** `GET`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "count": 25,
  "users": [
    {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+15551234567",
      "email": "john.doe@example.com"
    },
    ...
  ]
}
```

**Authentication Error (401 Unauthorized):**
```json
{
  "error": "Authorization required"
}
```

or

```json
{
  "error": "Invalid authentication"
}
```

**Authorization Error (403 Forbidden):**
```json
{
  "error": "Admin access required"
}
```

**Server Error (500 Internal Server Error):**
```json
{
  "error": "Failed to fetch eligible users"
}
```

## Frontend Usage

### Import the Service Function

```javascript
import { getEligibleSMSUsers } from '@/services/sms';
```

### Call the API

```javascript
try {
  const result = await getEligibleSMSUsers();

  console.log(`Found ${result.count} eligible users`);
  console.log(result.users);

  // Use the users data
  result.users.forEach(user => {
    console.log(`${user.first_name} ${user.last_name}: ${user.phone}`);
  });
} catch (error) {
  console.error('Error fetching eligible users:', error.message);

  if (error.message.includes('Admin access required')) {
    // Handle unauthorized access
  } else if (error.message.includes('Authentication required')) {
    // Redirect to login
  }
}
```

### Example Component Usage

```jsx
import React, { useState, useEffect } from 'react';
import { getEligibleSMSUsers } from '@/services/sms';

function SMSCampaignManager() {
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEligibleUsers();
  }, []);

  const loadEligibleUsers = async () => {
    try {
      setLoading(true);
      const result = await getEligibleSMSUsers();
      setEligibleUsers(result.users);
      setError(null);
    } catch (err) {
      console.error('Error loading eligible users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>SMS Campaign Recipients ({eligibleUsers.length} eligible)</h2>
      <ul>
        {eligibleUsers.map(user => (
          <li key={user.id}>
            {user.first_name} {user.last_name} - {user.phone}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Database Query

The endpoint executes the following logic:

```sql
-- Get opted-out phone numbers
SELECT phone_number FROM sms_opt_outs;

-- Get eligible users (excluding opted-out numbers)
SELECT p.id, p.first_name, p.last_name, p.phone, p.email
FROM profiles p
WHERE p.sms_consent = TRUE
  AND p.phone IS NOT NULL
  AND p.phone NOT IN (SELECT phone_number FROM sms_opt_outs)
ORDER BY p.last_name ASC;
```

## Security Features

1. **Admin-Only Access**: Only users with admin role can access this endpoint
2. **JWT Authentication**: Uses Supabase JWT tokens for authentication
3. **RLS Bypass**: Uses service role key with proper authorization checks
4. **TCPA Compliance**: Automatically excludes opted-out users
5. **CORS Enabled**: Allows cross-origin requests from the frontend

## Error Handling

The endpoint handles the following error scenarios:

1. **Missing Authorization Header**: Returns 401 with "Authorization required"
2. **Invalid Token**: Returns 401 with "Invalid authentication"
3. **Non-Admin User**: Returns 403 with "Admin access required"
4. **Database Query Errors**: Returns 500 with appropriate error message
5. **Empty Results**: Returns 200 with empty array and count of 0

## Testing

### Test as Admin User

1. Log in as an admin user
2. Open browser console
3. Run:
```javascript
const { getEligibleSMSUsers } = await import('./src/services/sms.js');
const result = await getEligibleSMSUsers();
console.log(result);
```

### Test as Non-Admin User

1. Log in as a regular customer
2. Attempt to call the API
3. Should receive "Admin access required" error

### Test with No Eligible Users

1. Ensure all users have either:
   - `sms_consent = false`, OR
   - `phone IS NULL`, OR
   - Phone number in `sms_opt_outs` table
2. Call the API
3. Should return: `{ success: true, count: 0, users: [] }`

## Implementation Files

- **Edge Function**: `/supabase/functions/sms-eligible-users/index.ts`
- **Frontend Service**: `/src/services/sms.js` (function: `getEligibleSMSUsers`)
- **Database Tables**: `profiles`, `sms_opt_outs`
- **Authentication**: Uses `get_my_profile()` RPC function

## Notes

- Results are ordered alphabetically by last name
- Phone numbers must be in E.164 format (e.g., +15551234567)
- The endpoint respects all TCPA compliance requirements
- Users who have opted out via any method are automatically excluded
- The function uses Supabase service role key for database access while maintaining user authentication
