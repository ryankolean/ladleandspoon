import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68b9e6ea0a82df47a4e72e7f", 
  requiresAuth: true // Ensure authentication is required for all operations
});
