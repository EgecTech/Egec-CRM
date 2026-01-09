// lib/apiProtection.js
// Protection against direct API access via browser

/**
 * Checks if the request is coming from the application interface
 * and not from direct browser navigation
 * Works in both development and production (Vercel, etc.)
 */
export function isDirectBrowserAccess(req) {
  // Allow non-GET requests (POST, PUT, DELETE, etc.)
  if (req.method !== 'GET') {
    return false;
  }

  // Get headers (case-insensitive)
  const requestedWith = req.headers['x-requested-with'];
  const referer = req.headers['referer'] || req.headers['referrer'];
  const accept = req.headers['accept'] || '';
  const secFetchDest = req.headers['sec-fetch-dest'];
  const secFetchMode = req.headers['sec-fetch-mode'];
  const secFetchSite = req.headers['sec-fetch-site'];
  const userAgent = req.headers['user-agent'] || '';
  
  // 1️⃣ ALLOW: XMLHttpRequest (AJAX calls)
  if (requestedWith === 'XMLHttpRequest') {
    return false;
  }

  // 2️⃣ ALLOW: Modern fetch() with CORS mode
  if (secFetchMode === 'cors') {
    // In production (Vercel), same-origin fetch shows as 'same-origin'
    // In some cases it might show as 'same-site' or be undefined
    if (secFetchSite === 'same-origin' || secFetchSite === 'same-site') {
      return false;
    }
    // If sec-fetch-mode is 'cors' and there's a referer from same origin, allow
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        const host = req.headers['host'] || req.headers['x-forwarded-host'];
        if (refererUrl.host === host) {
          return false;
        }
      } catch (e) {
        // Continue checking
      }
    }
  }

  // 3️⃣ ALLOW: Valid referer from same origin
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      // Check both 'host' and 'x-forwarded-host' (Vercel uses x-forwarded-host)
      const host = req.headers['host'] || req.headers['x-forwarded-host'];
      
      if (refererUrl.host === host) {
        return false; // Same origin, it's from our app
      }
    } catch (e) {
      // Invalid referer URL, continue checking
    }
  }

  // 4️⃣ ALLOW: Accepts only JSON (not HTML)
  const acceptsJson = accept.includes('application/json');
  const acceptsHtml = accept.includes('text/html');
  
  if (acceptsJson && !acceptsHtml) {
    return false; // Explicitly requesting JSON only
  }

  // 5️⃣ BLOCK: Clear browser navigation
  if (secFetchDest === 'document' && secFetchMode === 'navigate') {
    return true; // User typed URL in browser
  }

  // 6️⃣ BLOCK: Prefers HTML without referer
  if (acceptsHtml && !referer) {
    // But check if it's a bot/crawler (they're usually harmless and don't see data)
    const botUserAgents = ['bot', 'crawler', 'spider', 'slurp', 'monitoring'];
    const isBot = botUserAgents.some(bot => userAgent.toLowerCase().includes(bot));
    
    if (!isBot && !secFetchMode) {
      return true; // Likely direct browser access
    }
  }

  // 7️⃣ ALLOW: Production fetch() that lacks some headers
  // In production (Vercel), some headers might be stripped or modified
  // If we have a referer OR sec-fetch-mode, it's likely legitimate
  if (referer || secFetchMode) {
    return false; // Has some legitimate indicators
  }

  // 8️⃣ BLOCK: No indicators at all
  if (!secFetchMode && !referer && !requestedWith && acceptsHtml) {
    return true; // Very likely direct access
  }

  // Default: ALLOW (changed to allow for production compatibility)
  // Better to allow legitimate requests than block app functionality
  return false;
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
