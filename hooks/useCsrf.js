// hooks/useCsrf.js
/**
 * React Hook for CSRF Token Management
 * 
 * Usage:
 * const { csrfToken, fetchCsrfToken, getCsrfHeaders } = useCsrf();
 * 
 * // For fetch requests:
 * fetch('/api/endpoint', {
 *   method: 'POST',
 *   headers: getCsrfHeaders(),
 *   body: JSON.stringify(data)
 * });
 * 
 * // For axios:
 * axios.post('/api/endpoint', data, { headers: getCsrfHeaders() });
 */

import { useState, useCallback, useEffect } from "react";

const CSRF_HEADER = "x-csrf-token";
const CSRF_COOKIE = "csrf-token";

/**
 * Get CSRF token from cookie
 * @returns {string|null} Token or null
 */
function getTokenFromCookie() {
  if (typeof document === "undefined") return null;
  
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === CSRF_COOKIE) {
      return value;
    }
  }
  return null;
}

/**
 * CSRF Token Hook
 * Automatically fetches and manages CSRF token
 */
export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch a new CSRF token from the server
   */
  const fetchCsrfToken = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/csrf-token", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch CSRF token");
      }

      // Get token from response header or body
      const headerToken = response.headers.get("X-CSRF-Token");
      const data = await response.json();
      
      const token = headerToken || data.token;
      setCsrfToken(token);
      
      return token;
    } catch (err) {
      setError(err.message);
      // Try to get from cookie as fallback
      const cookieToken = getTokenFromCookie();
      if (cookieToken) {
        setCsrfToken(cookieToken);
        return cookieToken;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get headers object with CSRF token
   * Use this for fetch/axios requests
   */
  const getCsrfHeaders = useCallback(() => {
    const token = csrfToken || getTokenFromCookie();
    if (!token) return {};
    
    return {
      [CSRF_HEADER]: token,
    };
  }, [csrfToken]);

  /**
   * Get current token (from state or cookie)
   */
  const getToken = useCallback(() => {
    return csrfToken || getTokenFromCookie();
  }, [csrfToken]);

  // Auto-fetch token on mount
  useEffect(() => {
    // Check if we already have a token in cookie
    const existingToken = getTokenFromCookie();
    if (existingToken) {
      setCsrfToken(existingToken);
    } else {
      // Fetch new token
      fetchCsrfToken();
    }
  }, [fetchCsrfToken]);

  return {
    csrfToken,
    loading,
    error,
    fetchCsrfToken,
    getCsrfHeaders,
    getToken,
    CSRF_HEADER,
  };
}

/**
 * Higher-order function to add CSRF token to axios instance
 * @param {object} axiosInstance - Axios instance
 * @returns {object} Enhanced axios instance
 */
export function withCsrfAxios(axiosInstance) {
  // Add request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      // Only add for non-GET requests
      if (config.method !== "get") {
        const token = getTokenFromCookie();
        if (token) {
          config.headers[CSRF_HEADER] = token;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return axiosInstance;
}

/**
 * Utility function to make CSRF-protected fetch request
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export async function csrfFetch(url, options = {}) {
  const token = getTokenFromCookie();
  
  const headers = {
    ...options.headers,
    ...(token ? { [CSRF_HEADER]: token } : {}),
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
}

export default useCsrf;

