// pages/api/csrf-token.js
/**
 * CSRF Token Endpoint
 * Returns a new CSRF token for client-side use
 * 
 * Usage:
 * - GET /api/csrf-token
 * - Returns: { success: true, token: "...", expiresIn: 3600 }
 * - Token is also set in cookie and X-CSRF-Token header
 */

import { csrfTokenHandler } from "@/lib/csrfProtection";
import { withRateLimit } from "@/lib/rateLimit";

// Apply rate limiting: 30 requests per minute
export default withRateLimit(csrfTokenHandler, {
  limit: 30,
  window: 60000,
  message: "Too many CSRF token requests. Please slow down.",
});

