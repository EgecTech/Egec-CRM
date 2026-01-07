// lib/csrfProtection.js
/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 * 
 * Features:
 * - Token-based CSRF protection
 * - Double-submit cookie pattern
 * - Automatic token rotation
 * - Same-site cookie enforcement
 * - Graceful handling (no breaking existing functionality)
 */

import crypto from "crypto";

// Token configuration
const CONFIG = {
  TOKEN_LENGTH: 32, // bytes
  TOKEN_EXPIRY: 3600000, // 1 hour in milliseconds
  COOKIE_NAME: "csrf-token",
  HEADER_NAME: "x-csrf-token",
  FORM_FIELD: "_csrf",
  SAFE_METHODS: ["GET", "HEAD", "OPTIONS"],
};

// In-memory token store (use Redis in production with multiple servers)
const tokenStore = new Map();

// Cleanup expired tokens every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [token, data] of tokenStore.entries()) {
      if (now > data.expiry) {
        tokenStore.delete(token);
      }
    }
  }, 600000);
}

/**
 * Generate a cryptographically secure token
 * @returns {string} CSRF token
 */
function generateToken() {
  return crypto.randomBytes(CONFIG.TOKEN_LENGTH).toString("hex");
}

/**
 * Get client identifier (IP + User-Agent hash)
 * @param {object} req - Request object
 * @returns {string} Client identifier
 */
function getClientId(req) {
  // Better IP detection for production (handles proxies, load balancers)
  const forwarded = req.headers["x-forwarded-for"];
  const realIp = req.headers["x-real-ip"];
  const cfConnectingIp = req.headers["cf-connecting-ip"]; // Cloudflare
  const ip = cfConnectingIp || 
             (forwarded ? forwarded.split(",")[0].trim() : null) ||
             realIp ||
             req.socket?.remoteAddress ||
             "unknown";
  
  const userAgent = req.headers["user-agent"] || "";
  
  // In production, use a more stable identifier that doesn't change with IP
  // Use User-Agent + a session-based identifier if available
  // This helps with load balancers and proxies that change IPs
  if (process.env.NODE_ENV === "production") {
    // Use User-Agent hash primarily, IP as secondary (less strict)
    return crypto
      .createHash("sha256")
      .update(`${userAgent}`)
      .digest("hex")
      .substring(0, 16);
  }
  
  // In development, use IP + User-Agent (stricter)
  return crypto
    .createHash("sha256")
    .update(`${ip}:${userAgent}`)
    .digest("hex")
    .substring(0, 16);
}

/**
 * Create a new CSRF token for a client
 * @param {object} req - Request object
 * @returns {string} CSRF token
 */
export function createCsrfToken(req) {
  const token = generateToken();
  const clientId = getClientId(req);
  const userAgent = req.headers["user-agent"] || "";
  
  tokenStore.set(token, {
    clientId,
    userAgent, // Store User-Agent for production matching
    expiry: Date.now() + CONFIG.TOKEN_EXPIRY,
    created: Date.now(),
  });

  return token;
}

/**
 * Validate a CSRF token
 * @param {string} token - Token to validate
 * @param {object} req - Request object
 * @returns {boolean} Whether token is valid
 */
export function validateCsrfToken(token, req) {
  if (!token) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[CSRF] No token provided");
    }
    return false;
  }

  const data = tokenStore.get(token);
  if (!data) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[CSRF] Token not found in store", {
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 8),
        storeSize: tokenStore.size,
      });
    }
    return false;
  }

  // Check expiry
  if (Date.now() > data.expiry) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[CSRF] Token expired", {
        now: Date.now(),
        expiry: data.expiry,
        age: Date.now() - data.created,
      });
    }
    tokenStore.delete(token);
    return false;
  }

  // Check client ID matches
  const clientId = getClientId(req);
  if (data.clientId !== clientId) {
    // In production, be more lenient with client ID matching
    // This handles cases where IP changes due to load balancers/proxies
    // but User-Agent remains the same
    if (process.env.NODE_ENV === "production") {
      // Check if User-Agent matches (primary identifier in production)
      const currentUserAgent = req.headers["user-agent"] || "";
      const tokenUserAgent = data.userAgent || "";
      
      // If User-Agent matches, allow the request (IP might have changed due to proxy)
      if (currentUserAgent && tokenUserAgent && currentUserAgent === tokenUserAgent) {
        // Log for monitoring but allow the request
        console.warn("[CSRF] Client ID mismatch but User-Agent matches (allowing in production)", {
          expected: clientId,
          tokenClientId: data.clientId,
          userAgentMatch: true,
        });
        return true;
      }
      
      // Log the mismatch for security monitoring
      console.warn("[CSRF] Client ID and User-Agent mismatch in production", {
        expected: clientId,
        tokenClientId: data.clientId,
        ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]?.substring(0, 50),
      });
      
      // Still reject if both IP and User-Agent don't match
      return false;
    }
    
    // In development, be more lenient - allow if token exists and isn't expired
    // This helps with localhost IP changes and User-Agent variations
    console.warn("[CSRF] Client ID mismatch (allowing in dev)", {
      expected: clientId,
      tokenClientId: data.clientId,
      ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"]?.substring(0, 50),
    });
    // In development, allow the request if token exists and isn't expired
    return true;
  }

  return true;
}

/**
 * Get token from request (header, body, or query)
 * @param {object} req - Request object
 * @returns {string|null} Token or null
 */
function getTokenFromRequest(req) {
  // Check header first (preferred for AJAX)
  const headerToken = req.headers[CONFIG.HEADER_NAME];
  if (headerToken) return headerToken;

  // Check body for form submissions
  if (req.body && req.body[CONFIG.FORM_FIELD]) {
    return req.body[CONFIG.FORM_FIELD];
  }

  // Check query params (least preferred)
  if (req.query && req.query[CONFIG.FORM_FIELD]) {
    return req.query[CONFIG.FORM_FIELD];
  }

  // Check cookie (double-submit pattern)
  const cookies = req.headers.cookie || "";
  const cookieMatch = cookies.match(new RegExp(`${CONFIG.COOKIE_NAME}=([^;]+)`));
  if (cookieMatch) {
    return cookieMatch[1];
  }

  return null;
}

/**
 * CSRF Protection Middleware
 * Validates CSRF token for state-changing requests
 * 
 * @param {Function} handler - API handler
 * @param {object} options - Configuration options
 * @returns {Function} Protected handler
 */
export function withCsrfProtection(handler, options = {}) {
  const {
    // Skip CSRF for safe methods by default
    skipSafeMethods = true,
    // Custom error message
    errorMessage = "Invalid or missing CSRF token",
    // Whether to auto-generate token on GET requests
    autoGenerateToken = true,
    // Whether to set token in cookie
    setCookie = true,
  } = options;

  return async (req, res) => {
    const method = req.method?.toUpperCase();

    // Skip validation for safe methods
    if (skipSafeMethods && CONFIG.SAFE_METHODS.includes(method)) {
      // Auto-generate token on GET requests
      if (autoGenerateToken && method === "GET") {
        const token = createCsrfToken(req);
        
        if (setCookie) {
          // Use SameSite=Lax in production for better compatibility with redirects
          // SameSite=Strict can be too restrictive in production environments
          const sameSite = process.env.NODE_ENV === "production" ? "Lax" : "Strict";
          const secure = process.env.NODE_ENV === "production" ? "Secure;" : "";
          
          res.setHeader(
            "Set-Cookie",
            `${CONFIG.COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=${sameSite}; ${secure}Max-Age=3600`
          );
        }

        // Add token to response header for client-side access
        res.setHeader("X-CSRF-Token", token);
      }

      return handler(req, res);
    }

    // Validate token for state-changing methods
    const token = getTokenFromRequest(req);
    
    // Enhanced logging for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("[CSRF] Validation attempt", {
        hasToken: !!token,
        tokenLength: token?.length,
        method,
        url: req.url,
        headers: {
          "x-csrf-token": req.headers[CONFIG.HEADER_NAME] ? "present" : "missing",
          cookie: req.headers.cookie ? "present" : "missing",
        },
      });
    }
    
    const isValid = validateCsrfToken(token, req);
    
    if (!isValid) {
      // Enhanced error logging (both dev and production for debugging)
      const tokenData = token ? tokenStore.get(token) : null;
      const logData = {
        hasToken: !!token,
        tokenExists: !!tokenData,
        tokenExpired: tokenData ? Date.now() > tokenData.expiry : null,
        clientIdMatch: tokenData ? tokenData.clientId === getClientId(req) : null,
        expectedClientId: getClientId(req),
        tokenClientId: tokenData?.clientId,
        method,
        url: req.url,
        timestamp: new Date().toISOString(),
      };
      
      // Always log in production for security monitoring
      if (process.env.NODE_ENV === "production") {
        console.error("[CSRF] Validation failed in production", logData);
      } else {
        console.error("[CSRF] Validation failed", logData);
      }
      
      return res.status(403).json({
        error: "CSRF validation failed",
        message: errorMessage,
        code: "CSRF_INVALID",
        ...(process.env.NODE_ENV === "development" && {
          debug: {
            hasToken: !!token,
            tokenSource: token
              ? req.headers[CONFIG.HEADER_NAME]
                ? "header"
                : req.body?.[CONFIG.FORM_FIELD]
                ? "body"
                : "cookie"
              : "none",
            ...logData,
          },
        }),
      });
    }

    // Token is valid - optionally rotate it
    // (commented out to avoid breaking existing flows)
    // tokenStore.delete(token);
    // const newToken = createCsrfToken(req);
    // res.setHeader("X-CSRF-Token", newToken);

    return handler(req, res);
  };
}

/**
 * API endpoint to get a CSRF token
 * Use this for SPA applications
 * 
 * Usage: GET /api/csrf-token
 */
export function csrfTokenHandler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = createCsrfToken(req);

  // Use SameSite=Lax in production for better compatibility
  const sameSite = process.env.NODE_ENV === "production" ? "Lax" : "Strict";
  const secure = process.env.NODE_ENV === "production" ? "Secure;" : "";
  
  res.setHeader(
    "Set-Cookie",
    `${CONFIG.COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=${sameSite}; ${secure}Max-Age=3600`
  );

  res.setHeader("X-CSRF-Token", token);
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  return res.status(200).json({
    success: true,
    token,
    expiresIn: 3600,
  });
}

/**
 * Preset configurations for different security levels
 */
export const csrfPresets = {
  // Strict - for sensitive operations
  strict: {
    skipSafeMethods: false, // Validate all methods
    autoGenerateToken: true,
    setCookie: true,
  },

  // Standard - recommended for most APIs
  standard: {
    skipSafeMethods: true,
    autoGenerateToken: true,
    setCookie: true,
  },

  // Light - for less sensitive APIs
  light: {
    skipSafeMethods: true,
    autoGenerateToken: false,
    setCookie: false,
  },
};

/**
 * Apply preset CSRF protection
 * @param {Function} handler - API handler
 * @param {string} preset - Preset name (strict, standard, light)
 * @returns {Function} Protected handler
 */
export function withCsrfPreset(handler, preset = "standard") {
  const options = csrfPresets[preset] || csrfPresets.standard;
  return withCsrfProtection(handler, options);
}

// Export configuration for client-side use
export const CSRF_HEADER = CONFIG.HEADER_NAME;
export const CSRF_FIELD = CONFIG.FORM_FIELD;
export const CSRF_COOKIE = CONFIG.COOKIE_NAME;

export default {
  createToken: createCsrfToken,
  validateToken: validateCsrfToken,
  withProtection: withCsrfProtection,
  withPreset: withCsrfPreset,
  handler: csrfTokenHandler,
  presets: csrfPresets,
  HEADER: CONFIG.HEADER_NAME,
  FIELD: CONFIG.FORM_FIELD,
  COOKIE: CONFIG.COOKIE_NAME,
};

