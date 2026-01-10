// lib/rateLimit.js
// Simple in-memory rate limiting for API endpoints
// For production with multiple servers, consider using Redis

const rateLimit = new Map();
const userRateLimit = new Map(); // Separate tracking for authenticated users
const endpointStats = new Map(); // Track endpoint-specific metrics

// Enhanced cleanup: Run every 2 minutes and clean up more aggressively
setInterval(() => {
  const now = Date.now();
  
  // Clean IP-based rate limits
  for (const [key, requests] of rateLimit.entries()) {
    const recentRequests = requests.filter((time) => now - time < 120000); // 2 min window
    if (recentRequests.length === 0) {
      rateLimit.delete(key);
    } else {
      rateLimit.set(key, recentRequests);
    }
  }
  
  // Clean user-based rate limits
  for (const [key, requests] of userRateLimit.entries()) {
    const recentRequests = requests.filter((time) => now - time < 120000);
    if (recentRequests.length === 0) {
      userRateLimit.delete(key);
    } else {
      userRateLimit.set(key, recentRequests);
    }
  }
  
  // Clean endpoint stats (keep last hour)
  for (const [endpoint, data] of endpointStats.entries()) {
    if (now - data.lastAccess > 3600000) { // 1 hour
      endpointStats.delete(endpoint);
    }
  }
}, 120000); // 2 minutes

/**
 * Check if a request should be rate limited
 * @param {string} identifier - Unique identifier (IP address or user ID)
 * @param {number} limit - Maximum number of requests allowed
 * @param {number} window - Time window in milliseconds (default: 60000ms = 1 minute)
 * @param {boolean} isUser - Whether this is user-based (true) or IP-based (false)
 * @returns {Object} - { success: boolean, remaining: number, resetIn: number }
 */
export function checkRateLimit(identifier, limit = 100, window = 60000, isUser = false) {
  const now = Date.now();
  const limitMap = isUser ? userRateLimit : rateLimit;
  const userRequests = limitMap.get(identifier) || [];

  // Remove old requests outside the time window
  const recentRequests = userRequests.filter((time) => now - time < window);

  if (recentRequests.length >= limit) {
    const oldestRequest = Math.min(...recentRequests);
    const resetIn = Math.ceil((oldestRequest + window - now) / 1000);

    return {
      success: false,
      remaining: 0,
      resetIn,
      limit,
    };
  }

  // Add current request
  recentRequests.push(now);
  limitMap.set(identifier, recentRequests);

  return {
    success: true,
    remaining: limit - recentRequests.length,
    resetIn: Math.ceil(window / 1000),
    limit,
  };
}

/**
 * Enhanced rate limit check with user identification
 * @param {Object} req - Request object
 * @param {number} limit - Maximum requests
 * @param {number} window - Time window
 * @param {Object} options - Additional options
 * @returns {Object} - Rate limit result
 */
export function checkEnhancedRateLimit(req, limit = 100, window = 60000, options = {}) {
  const { userId, userRole, endpoint } = options;
  
  // Track endpoint stats
  if (endpoint) {
    const stats = endpointStats.get(endpoint) || { count: 0, lastAccess: Date.now() };
    stats.count++;
    stats.lastAccess = Date.now();
    endpointStats.set(endpoint, stats);
  }
  
  // Priority: User-based > IP-based
  if (userId) {
    // Role-based limits
    let adjustedLimit = limit;
    if (userRole === 'superadmin') adjustedLimit = limit * 5;
    else if (userRole === 'admin') adjustedLimit = limit * 3;
    else if (userRole === 'superagent') adjustedLimit = limit * 2;
    
    return checkRateLimit(`user:${userId}`, adjustedLimit, window, true);
  }
  
  // Fallback to IP-based
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.socket?.remoteAddress || "unknown";
  return checkRateLimit(`ip:${ip}`, limit, window, false);
}

/**
 * Higher-order function to wrap API handlers with rate limiting
 * @param {Function} handler - The API handler function
 * @param {Object} options - Rate limiting options
 * @returns {Function} - Wrapped handler with rate limiting
 */
export function withRateLimit(handler, options = {}) {
  const {
    limit = 100,
    window = 60000,
    message = "Too many requests. Please try again later.",
    skipSuccessfulAuth = false,
    useEnhanced = true, // Use enhanced rate limiting by default
  } = options;

  return async (req, res) => {
    let rateLimitResult;
    
    if (useEnhanced) {
      // Try to get user info from session (if available)
      const session = req.session || req.user; // Support different auth patterns
      const userId = session?.id || session?.userId;
      const userRole = session?.role;
      
      rateLimitResult = checkEnhancedRateLimit(req, limit, window, {
        userId,
        userRole,
        endpoint: req.url?.split('?')[0], // Track endpoint without query params
      });
    } else {
      // Legacy IP-based rate limiting
      const forwarded = req.headers["x-forwarded-for"];
      const ip = forwarded
        ? forwarded.split(",")[0].trim()
        : req.socket?.remoteAddress || "unknown";
      const identifier = `${ip}:${req.url}`;
      
      rateLimitResult = checkRateLimit(identifier, limit, window);
    }

    const { success, remaining, resetIn, limit: maxLimit } = rateLimitResult;

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", maxLimit);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetIn);

    if (!success) {
      res.setHeader("Retry-After", resetIn);
      return res.status(429).json({
        error: message,
        retryAfter: resetIn,
        limit: maxLimit,
      });
    }

    // Call the original handler
    return handler(req, res);
  };
}

/**
 * Preset rate limit configurations for different endpoint types
 */
export const rateLimitPresets = {
  // Strict limits for authentication endpoints
  auth: {
    limit: 5,
    window: 60000, // 5 requests per minute
    message:
      "Too many authentication attempts. Please try again in a few minutes.",
  },

  // Moderate limits for public read operations
  public: {
    limit: 100,
    window: 60000, // 100 requests per minute
    message: "Too many requests. Please slow down.",
  },

  // Generous limits for authenticated users
  authenticated: {
    limit: 500,
    window: 60000, // 500 requests per minute
    message: "Request limit exceeded. Please try again shortly.",
  },

  // Strict limits for write operations
  write: {
    limit: 30,
    window: 60000, // 30 requests per minute
    message: "Too many write operations. Please slow down.",
  },

  // Very strict limits for admin operations
  admin: {
    limit: 100,
    window: 60000, // 100 requests per minute
    message: "Admin operation limit exceeded.",
  },

  // File upload limits
  upload: {
    limit: 10,
    window: 60000, // 10 uploads per minute
    message: "Too many upload attempts. Please wait before uploading again.",
  },
};

/**
 * Helper to apply preset rate limits
 */
export function withPresetRateLimit(handler, preset = "public") {
  const options = rateLimitPresets[preset] || rateLimitPresets.public;
  return withRateLimit(handler, options);
}

/**
 * Get current rate limit statistics (for monitoring)
 * @returns {Object} - Statistics object
 */
export function getRateLimitStats() {
  return {
    ipBasedTracking: rateLimit.size,
    userBasedTracking: userRateLimit.size,
    endpointsTracked: endpointStats.size,
    topEndpoints: Array.from(endpointStats.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([endpoint, stats]) => ({ endpoint, ...stats })),
  };
}

/**
 * Clear rate limits for a specific identifier (for testing or manual override)
 * @param {string} identifier - The identifier to clear
 * @param {boolean} isUser - Whether it's a user-based limit
 */
export function clearRateLimit(identifier, isUser = false) {
  const limitMap = isUser ? userRateLimit : rateLimit;
  limitMap.delete(identifier);
}

/**
 * Get remaining requests for an identifier
 * @param {string} identifier - The identifier to check
 * @param {number} limit - The limit to check against
 * @param {boolean} isUser - Whether it's user-based
 * @returns {number} - Number of remaining requests
 */
export function getRemainingRequests(identifier, limit, isUser = false) {
  const now = Date.now();
  const limitMap = isUser ? userRateLimit : rateLimit;
  const requests = limitMap.get(identifier) || [];
  const recentRequests = requests.filter((time) => now - time < 60000);
  return Math.max(0, limit - recentRequests.length);
}
