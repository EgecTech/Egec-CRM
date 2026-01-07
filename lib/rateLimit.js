// lib/rateLimit.js
// Simple in-memory rate limiting for API endpoints
// For production with multiple servers, consider using Redis

const rateLimit = new Map();

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, requests] of rateLimit.entries()) {
    const recentRequests = requests.filter((time) => now - time < 60000);
    if (recentRequests.length === 0) {
      rateLimit.delete(key);
    } else {
      rateLimit.set(key, recentRequests);
    }
  }
}, 300000); // 5 minutes

/**
 * Check if a request should be rate limited
 * @param {string} identifier - Unique identifier (IP address or user ID)
 * @param {number} limit - Maximum number of requests allowed
 * @param {number} window - Time window in milliseconds (default: 60000ms = 1 minute)
 * @returns {Object} - { success: boolean, remaining: number, resetIn: number }
 */
export function checkRateLimit(identifier, limit = 100, window = 60000) {
  const now = Date.now();
  const userRequests = rateLimit.get(identifier) || [];

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
  rateLimit.set(identifier, recentRequests);

  return {
    success: true,
    remaining: limit - recentRequests.length,
    resetIn: Math.ceil(window / 1000),
    limit,
  };
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
  } = options;

  return async (req, res) => {
    // Get identifier from IP address or session
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : req.socket.remoteAddress;
    const identifier = `${ip}:${req.url}`;

    // Check rate limit
    const { success, remaining, resetIn, limit: maxLimit } = checkRateLimit(
      identifier,
      limit,
      window
    );

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

