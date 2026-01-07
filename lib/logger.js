/**
 * Enhanced Logging System
 * 
 * This module provides a centralized logging system using Winston.
 * 
 * Features:
 * - Multiple log levels (error, warn, info, debug)
 * - File-based logging with rotation
 * - Console logging in development
 * - Structured JSON logs
 * - Automatic error tracking
 * - Performance monitoring
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = '\n' + JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: {
    service: 'info-system',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Error logs - only errors
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined logs - all levels
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Warning logs
    new winston.transports.File({
      filename: path.join(logsDir, 'warn.log'),
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    }),
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    }),
  ],
  
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

/**
 * Log API request
 * @param {Object} req - Request object
 * @param {Object} meta - Additional metadata
 */
export function logRequest(req, meta = {}) {
  logger.info('API Request', {
    method: req.method,
    url: req.url,
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    ...meta,
  });
}

/**
 * Log API response
 * @param {Object} req - Request object
 * @param {number} statusCode - Response status code
 * @param {number} duration - Request duration in ms
 * @param {Object} meta - Additional metadata
 */
export function logResponse(req, statusCode, duration, meta = {}) {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  
  logger[level]('API Response', {
    method: req.method,
    url: req.url,
    statusCode,
    duration: `${duration}ms`,
    ...meta,
  });
}

/**
 * Log authentication event
 * @param {string} event - Event type (login, logout, signup, etc.)
 * @param {Object} user - User information
 * @param {Object} meta - Additional metadata
 */
export function logAuth(event, user, meta = {}) {
  logger.info('Authentication Event', {
    event,
    userId: user?.id,
    email: user?.email,
    role: user?.role,
    ...meta,
  });
}

/**
 * Log database operation
 * @param {string} operation - Operation type (find, create, update, delete)
 * @param {string} collection - Collection name
 * @param {Object} meta - Additional metadata
 */
export function logDatabase(operation, collection, meta = {}) {
  logger.info('Database Operation', {
    operation,
    collection,
    ...meta,
  });
}

/**
 * Log security event
 * @param {string} event - Event type (rate_limit, blocked_ip, etc.)
 * @param {Object} meta - Additional metadata
 */
export function logSecurity(event, meta = {}) {
  logger.warn('Security Event', {
    event,
    timestamp: new Date().toISOString(),
    ...meta,
  });
}

/**
 * Log performance metric
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 * @param {Object} meta - Additional metadata
 */
export function logPerformance(metric, value, meta = {}) {
  logger.info('Performance Metric', {
    metric,
    value,
    ...meta,
  });
}

/**
 * Log error with context
 * @param {Error} error - Error object
 * @param {Object} context - Error context
 */
export function logError(error, context = {}) {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
  });
}

/**
 * Create a child logger with additional default metadata
 * @param {Object} meta - Default metadata for child logger
 * @returns {Object} Child logger
 */
export function createChildLogger(meta) {
  return logger.child(meta);
}

/**
 * Middleware to log all API requests and responses
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with logging
 */
export function withLogging(handler) {
  return async (req, res) => {
    const startTime = Date.now();
    
    // Log request
    logRequest(req);
    
    // Capture the original res.json and res.status
    const originalJson = res.json;
    const originalStatus = res.status;
    let statusCode = 200;
    
    // Override res.status to capture status code
    res.status = function (code) {
      statusCode = code;
      return originalStatus.call(this, code);
    };
    
    // Override res.json to log response
    res.json = function (data) {
      const duration = Date.now() - startTime;
      logResponse(req, statusCode, duration);
      return originalJson.call(this, data);
    };
    
    try {
      return await handler(req, res);
    } catch (error) {
      const duration = Date.now() - startTime;
      logError(error, {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
      });
      throw error;
    }
  };
}

// Export the logger instance
export default logger;

