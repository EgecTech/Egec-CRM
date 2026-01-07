// lib/cache.js
/**
 * Unified Caching System
 * Supports both Redis (production) and in-memory (development/fallback)
 * 
 * Features:
 * - Automatic fallback to in-memory if Redis is unavailable
 * - No errors thrown - graceful degradation
 * - Same API for both Redis and in-memory
 * - TTL support
 * - Namespace support for key organization
 */

// In-memory cache as fallback
const memoryCache = new Map();
const memoryCacheTimestamps = new Map();

// Redis client (lazy loaded)
let redisClient = null;
let redisAvailable = false;
let redisChecked = false;

// Configuration
const CONFIG = {
  REDIS_URL: process.env.REDIS_URL,
  DEFAULT_TTL: 300, // 5 minutes
  MAX_MEMORY_ITEMS: 10000, // Prevent memory leaks
  CLEANUP_INTERVAL: 60000, // 1 minute
};

/**
 * Initialize Redis connection (lazy)
 * Only attempts connection if REDIS_URL is set
 */
async function initRedis() {
  if (redisChecked) return redisAvailable;
  redisChecked = true;

  if (!CONFIG.REDIS_URL) {
    console.log("📦 Cache: Using in-memory cache (REDIS_URL not set)");
    return false;
  }

  try {
    // Dynamic import to avoid errors if ioredis is not installed
    const Redis = (await import("ioredis")).default;
    
    // Ensure TLS is used for Upstash (convert redis:// to rediss:// if needed)
    const redisUrl = CONFIG.REDIS_URL.includes('upstash.io') && !CONFIG.REDIS_URL.startsWith('rediss://')
      ? CONFIG.REDIS_URL.replace('redis://', 'rediss://')
      : CONFIG.REDIS_URL;
    
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      connectTimeout: 10000, // Increased to 10 seconds
      lazyConnect: true,
      // TLS configuration for Upstash
      tls: {
        rejectUnauthorized: true,
      },
      // Better retry strategy
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      // Reconnect on error
      reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    // Test connection
    await redisClient.connect();
    await redisClient.ping();
    
    redisAvailable = true;
    console.log("✅ Cache: Redis connected successfully");

    // Handle disconnection and errors
    redisClient.on("error", (err) => {
      // Suppress noisy connection errors in development
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ Cache: Redis error (falling back to memory)");
      } else {
        console.warn("⚠️ Cache: Redis error, falling back to memory:", err.message);
      }
      redisAvailable = false;
    });

    redisClient.on("reconnecting", () => {
      console.log("🔄 Cache: Redis reconnecting...");
    });

    redisClient.on("ready", () => {
      redisAvailable = true;
      console.log("✅ Cache: Redis ready");
    });
    
    redisClient.on("close", () => {
      console.log("📦 Cache: Redis connection closed, using in-memory cache");
      redisAvailable = false;
    });

    return true;
  } catch (error) {
    console.log("📦 Cache: Redis unavailable, using in-memory cache");
    if (process.env.NODE_ENV === "development") {
      console.log("   Reason:", error.message);
    }
    redisAvailable = false;
    return false;
  }
}

/**
 * Memory cache cleanup - removes expired items
 */
function cleanupMemoryCache() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, timestamp] of memoryCacheTimestamps.entries()) {
    if (now > timestamp) {
      memoryCache.delete(key);
      memoryCacheTimestamps.delete(key);
      cleaned++;
    }
  }

  // If still too many items, remove oldest
  if (memoryCache.size > CONFIG.MAX_MEMORY_ITEMS) {
    const entries = Array.from(memoryCacheTimestamps.entries())
      .sort((a, b) => a[1] - b[1]);
    
    const toRemove = entries.slice(0, memoryCache.size - CONFIG.MAX_MEMORY_ITEMS);
    for (const [key] of toRemove) {
      memoryCache.delete(key);
      memoryCacheTimestamps.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0 && process.env.NODE_ENV === "development") {
    console.log(`🧹 Cache: Cleaned ${cleaned} expired items`);
  }
}

// Start cleanup interval
if (typeof setInterval !== "undefined") {
  setInterval(cleanupMemoryCache, CONFIG.CLEANUP_INTERVAL);
}

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @param {string} namespace - Optional namespace prefix
 * @returns {Promise<any|null>} Cached value or null
 */
export async function cacheGet(key, namespace = "app") {
  const fullKey = `${namespace}:${key}`;

  try {
    // Try Redis first
    if (redisAvailable && redisClient) {
      const value = await redisClient.get(fullKey);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    }
  } catch (error) {
    // Redis failed, fall through to memory
  }

  // Memory cache fallback
  const expiry = memoryCacheTimestamps.get(fullKey);
  if (expiry && Date.now() < expiry) {
    return memoryCache.get(fullKey);
  }

  // Expired or not found
  memoryCache.delete(fullKey);
  memoryCacheTimestamps.delete(fullKey);
  return null;
}

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 300)
 * @param {string} namespace - Optional namespace prefix
 * @returns {Promise<boolean>} Success status
 */
export async function cacheSet(key, value, ttl = CONFIG.DEFAULT_TTL, namespace = "app") {
  const fullKey = `${namespace}:${key}`;

  try {
    // Try Redis first
    if (redisAvailable && redisClient) {
      await redisClient.setex(fullKey, ttl, JSON.stringify(value));
      return true;
    }
  } catch (error) {
    // Redis failed, fall through to memory
  }

  // Memory cache fallback
  memoryCache.set(fullKey, value);
  memoryCacheTimestamps.set(fullKey, Date.now() + ttl * 1000);

  // Trigger cleanup if too many items
  if (memoryCache.size > CONFIG.MAX_MEMORY_ITEMS) {
    cleanupMemoryCache();
  }

  return true;
}

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @param {string} namespace - Optional namespace prefix
 * @returns {Promise<boolean>} Success status
 */
export async function cacheDelete(key, namespace = "app") {
  const fullKey = `${namespace}:${key}`;

  try {
    if (redisAvailable && redisClient) {
      await redisClient.del(fullKey);
    }
  } catch (error) {
    // Ignore Redis errors
  }

  // Always clean memory cache too
  memoryCache.delete(fullKey);
  memoryCacheTimestamps.delete(fullKey);

  return true;
}

/**
 * Delete all keys matching a pattern
 * @param {string} pattern - Pattern to match (e.g., "user:*")
 * @param {string} namespace - Optional namespace prefix
 * @returns {Promise<number>} Number of deleted keys
 */
export async function cacheDeletePattern(pattern, namespace = "app") {
  const fullPattern = `${namespace}:${pattern}`;
  let deleted = 0;

  try {
    if (redisAvailable && redisClient) {
      const keys = await redisClient.keys(fullPattern);
      if (keys.length > 0) {
        deleted = await redisClient.del(...keys);
      }
    }
  } catch (error) {
    // Ignore Redis errors
  }

  // Clean memory cache
  const regex = new RegExp(`^${fullPattern.replace(/\*/g, ".*")}$`);
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key);
      memoryCacheTimestamps.delete(key);
      deleted++;
    }
  }

  return deleted;
}

/**
 * Check if cache is using Redis
 * @returns {boolean}
 */
export function isUsingRedis() {
  return redisAvailable;
}

/**
 * Get cache statistics
 * @returns {object} Cache stats
 */
export function getCacheStats() {
  return {
    type: redisAvailable ? "redis" : "memory",
    memoryItems: memoryCache.size,
    maxMemoryItems: CONFIG.MAX_MEMORY_ITEMS,
  };
}

/**
 * Initialize cache (call on app startup)
 * @returns {Promise<void>}
 */
export async function initCache() {
  await initRedis();
}

/**
 * Cache wrapper for functions
 * Automatically caches function results
 * @param {string} key - Cache key
 * @param {Function} fn - Function to execute if cache miss
 * @param {number} ttl - Time to live in seconds
 * @param {string} namespace - Optional namespace
 * @returns {Promise<any>} Cached or fresh result
 */
export async function cacheWrap(key, fn, ttl = CONFIG.DEFAULT_TTL, namespace = "app") {
  // Try to get from cache
  const cached = await cacheGet(key, namespace);
  if (cached !== null) {
    return cached;
  }

  // Execute function and cache result
  const result = await fn();
  await cacheSet(key, result, ttl, namespace);
  return result;
}

// Export default object for convenience
export default {
  get: cacheGet,
  set: cacheSet,
  delete: cacheDelete,
  deletePattern: cacheDeletePattern,
  wrap: cacheWrap,
  init: initCache,
  isUsingRedis,
  getStats: getCacheStats,
};

