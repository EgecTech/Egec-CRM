// lib/apiProtection.js
// Protection against direct API access via browser

/**
 * Checks if the request is coming from the application interface
 * and not from direct browser navigation
 */
export function isDirectBrowserAccess(req) {
  // Allow non-GET requests (POST, PUT, DELETE, etc.)
  if (req.method !== 'GET') {
    return false;
  }

  // Check for fetch/XMLHttpRequest indicators
  const requestedWith = req.headers['x-requested-with'];
  const referer = req.headers['referer'] || req.headers['referrer'];
  const accept = req.headers['accept'] || '';
  
  // If request has x-requested-with header (common for AJAX), it's from app
  if (requestedWith) {
    return false;
  }

  // If referer exists and is from same origin, it's from app
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const hostUrl = req.headers['host'];
      if (refererUrl.host === hostUrl) {
        return false;
      }
    } catch (e) {
      // Invalid referer URL, consider it direct access
    }
  }

  // If accept header prefers HTML over JSON, it's likely a browser direct access
  const prefersHtml = accept.includes('text/html') && !accept.includes('application/json');
  if (prefersHtml) {
    return true;
  }

  // If none of the above, consider it direct access
  return true;
}

/**
 * Middleware to block direct browser access to API endpoints
 * Returns standard error response if direct access is detected
 */
export function withApiProtection(handler) {
  return async (req, res) => {
    // Only check for GET requests (POST, PUT, DELETE are safe)
    if (req.method === 'GET' && isDirectBrowserAccess(req)) {
      return res.status(403).json({
        error: "Access denied",
        message: "Direct API access is not allowed. Please use the application interface.",
        code: "DIRECT_NAVIGATION_BLOCKED"
      });
    }

    // Continue to actual handler
    return handler(req, res);
  };
}

/**
 * Check and block direct access - use in existing handlers
 */
export function checkDirectAccess(req, res) {
  if (req.method === 'GET' && isDirectBrowserAccess(req)) {
    res.status(403).json({
      error: "Access denied",
      message: "Direct API access is not allowed. Please use the application interface.",
      code: "DIRECT_NAVIGATION_BLOCKED"
    });
    return true; // Blocked
  }
  return false; // Not blocked
}
