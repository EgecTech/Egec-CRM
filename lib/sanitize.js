// lib/sanitize.js
/**
 * Input Sanitization Utilities
 * Protects against XSS and injection attacks
 * 
 * IMPORTANT: This adds a security layer WITHOUT breaking existing functionality
 */

import DOMPurify from "isomorphic-dompurify";
import validator from "validator";

/**
 * Sanitize general text input
 * Removes HTML tags and dangerous characters
 */
export function sanitizeInput(input) {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input !== "string") {
    return input;
  }

  // Remove HTML tags and dangerous content
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
  });

  // Trim whitespace
  return sanitized.trim();
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return false;
  }

  return validator.isEmail(email);
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== "string") {
    return email;
  }

  // Normalize and validate email
  const normalized = validator.normalizeEmail(email, {
    gmail_remove_dots: false, // Keep dots in Gmail
    gmail_remove_subaddress: false, // Keep +tags
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false,
  });

  return normalized || email;
}

/**
 * Sanitize URL
 */
export function sanitizeURL(url) {
  if (!url || typeof url !== "string") {
    return url;
  }

  // Check if valid URL
  if (validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: false,
  })) {
    return url;
  }

  return "";
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone) {
  if (!phone || typeof phone !== "string") {
    return phone;
  }

  // Remove all non-numeric characters except + and spaces
  return phone.replace(/[^\d+\s()-]/g, '').trim();
}

/**
 * Sanitize object recursively
 * Useful for sanitizing entire request bodies
 */
export function sanitizeObject(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== "object") {
    if (typeof obj === "string") {
      return sanitizeInput(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      // Special handling for specific fields
      if (key === "email") {
        sanitized[key] = sanitizeEmail(value);
      } else if (key === "website" || key === "url" || key === "livepreview") {
        sanitized[key] = sanitizeURL(value);
      } else if (key === "phone" || key === "userPhone") {
        sanitized[key] = sanitizePhone(value);
      } else if (typeof value === "string") {
        sanitized[key] = sanitizeInput(value);
      } else if (typeof value === "object") {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

/**
 * Sanitize request body
 * Use this in API routes to sanitize all incoming data
 */
export function sanitizeRequestBody(body) {
  if (!body) {
    return body;
  }

  return sanitizeObject(body);
}

/**
 * Sanitize query parameters
 */
export function sanitizeQuery(query) {
  if (!query) {
    return query;
  }

  const sanitized = {};
  for (const key in query) {
    if (query.hasOwnProperty(key)) {
      const value = query[key];
      if (typeof value === "string") {
        sanitized[key] = sanitizeInput(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(v => 
          typeof v === "string" ? sanitizeInput(v) : v
        );
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize MongoDB ObjectId
 */
export function sanitizeObjectId(id) {
  if (!id || typeof id !== "string") {
    return id;
  }

  // MongoDB ObjectId is 24 hex characters
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    return id;
  }

  return null;
}

