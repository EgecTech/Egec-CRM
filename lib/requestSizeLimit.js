/**
 * Request Size Limit Middleware
 * 
 * This middleware protects against large payload attacks by limiting
 * the size of incoming requests.
 * 
 * Features:
 * - Configurable size limits
 * - JSON body size validation
 * - File upload size limits
 * - Protection against DoS attacks
 */

/**
 * Check if request body size exceeds limit
 * @param {Object} req - Next.js request object
 * @param {number} maxSize - Maximum size in bytes
 * @returns {boolean} True if size is within limit
 */
export function checkRequestSize(req, maxSize = 1024 * 1024) {
  // 1MB default
  const contentLength = req.headers["content-length"];

  if (!contentLength) {
    return true; // No content-length header, let it through
  }

  const size = parseInt(contentLength, 10);

  if (isNaN(size)) {
    return true; // Invalid content-length, let it through
  }

  return size <= maxSize;
}

/**
 * Middleware to enforce request size limits
 * @param {Function} handler - API route handler
 * @param {Object} options - Configuration options
 * @returns {Function} Wrapped handler with size limit enforcement
 */
export function withRequestSizeLimit(handler, options = {}) {
  const {
    maxSize = 1024 * 1024, // 1MB default
    maxFileSize = 10 * 1024 * 1024, // 10MB for file uploads
  } = options;

  return async (req, res) => {
    // Determine which limit to use based on content type
    const contentType = req.headers["content-type"] || "";
    const isFileUpload = contentType.includes("multipart/form-data");
    const limit = isFileUpload ? maxFileSize : maxSize;

    // Check request size
    if (!checkRequestSize(req, limit)) {
      const maxSizeMB = (limit / (1024 * 1024)).toFixed(2);
      return res.status(413).json({
        error: "Request too large",
        message: `Request body exceeds maximum size of ${maxSizeMB}MB`,
        maxSize: limit,
      });
    }

    // Continue to the handler
    return handler(req, res);
  };
}

/**
 * Preset configurations for different types of endpoints
 */
export const sizeLimitPresets = {
  // Small JSON payloads (auth, simple updates)
  small: {
    maxSize: 100 * 1024, // 100KB
  },

  // Medium JSON payloads (most API endpoints)
  medium: {
    maxSize: 1024 * 1024, // 1MB
  },

  // Large JSON payloads (bulk operations)
  large: {
    maxSize: 5 * 1024 * 1024, // 5MB
  },

  // File uploads
  fileUpload: {
    maxSize: 1024 * 1024, // 1MB for JSON
    maxFileSize: 10 * 1024 * 1024, // 10MB for files
  },

  // Image uploads
  imageUpload: {
    maxSize: 1024 * 1024, // 1MB for JSON
    maxFileSize: 5 * 1024 * 1024, // 5MB for images
  },
};

/**
 * Helper to apply preset size limits
 * @param {Function} handler - API route handler
 * @param {string} preset - Preset name
 * @returns {Function} Wrapped handler
 */
export function withPresetSizeLimit(handler, preset = "medium") {
  const config = sizeLimitPresets[preset] || sizeLimitPresets.medium;
  return withRequestSizeLimit(handler, config);
}

/**
 * Next.js API config for body size limits
 * Use this in your API routes:
 * 
 * export const config = {
 *   api: {
 *     bodyParser: {
 *       sizeLimit: '1mb',
 *     },
 *   },
 * };
 */
export const apiConfigs = {
  small: {
    api: {
      bodyParser: {
        sizeLimit: "100kb",
      },
    },
  },

  medium: {
    api: {
      bodyParser: {
        sizeLimit: "1mb",
      },
    },
  },

  large: {
    api: {
      bodyParser: {
        sizeLimit: "5mb",
      },
    },
  },

  fileUpload: {
    api: {
      bodyParser: false, // Disable for multipart/form-data
    },
  },
};

