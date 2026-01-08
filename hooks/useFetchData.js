import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

// Simple in-memory cache for API responses
const cache = new Map();
const CACHE_DURATION = 120000; // 2 minutes

// Request deduplication - prevents multiple requests to same endpoint
const pendingRequests = new Map();

function useFetchData(apiEndpoint, options = { retry: 0 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(!!apiEndpoint); // Only loading if endpoint exists
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(
    async (retryCount = options.retry) => {
      if (!apiEndpoint) {
        setLoading(false);
        setData([]);
        return;
      }

      // Check cache first
      const cacheKey = apiEndpoint;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setData(cached.data);
        setLoading(false);
        return;
      }

      // Check if request is already pending (deduplication)
      if (pendingRequests.has(cacheKey)) {
        try {
          const pendingData = await pendingRequests.get(cacheKey);
          setData(pendingData);
          setLoading(false);
          return;
        } catch (err) {
          // If pending request failed, continue with new request
        }
      }

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setLoading(true);
      setError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const signal = controller.signal;

      // Create request promise for deduplication
      const requestPromise = (async () => {
        try {
          const response = await axios.get(apiEndpoint, {
            signal,
            timeout: 30000, // 30 second timeout
            headers: {
              "Cache-Control": "no-cache",
            },
          });

          // Handle paginated response format
          let responseData = response.data;
          if (
            responseData &&
            typeof responseData === "object" &&
            responseData.data &&
            responseData.pagination
          ) {
            // Paginated response - extract the data array
            responseData = responseData.data;
          }

          // Cache the response
          cache.set(cacheKey, {
            data: responseData,
            timestamp: Date.now(),
          });

          return responseData;
        } catch (err) {
          if (err.name !== "AbortError" && !signal.aborted) {
            if (retryCount > 0) {
              // Retry logic
              await new Promise((resolve) => setTimeout(resolve, 1000));
              return fetchData(retryCount - 1);
            } else {
              throw err;
            }
          }
          throw err;
        } finally {
          // Remove from pending requests
          pendingRequests.delete(cacheKey);
        }
      })();

      // Store pending request for deduplication
      pendingRequests.set(cacheKey, requestPromise);

      try {
        const responseData = await requestPromise;
        if (!signal.aborted) {
          setData(responseData);
        }
      } catch (err) {
        if (!signal.aborted) {
          setError(err.message || "Failed to fetch data");
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [apiEndpoint, options.retry]
  );

  useEffect(() => {
    if (!apiEndpoint) {
      setLoading(false);
      setData([]);
      return;
    }

    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [apiEndpoint, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useFetchData;
