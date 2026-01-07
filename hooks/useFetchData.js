import { useState, useEffect, useCallback } from "react";
import axios from "axios";

function useFetchData(apiEndpoint, options = { retry: 0 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (retryCount = options.retry) => {
      if (!apiEndpoint) return;

      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const signal = controller.signal;

      try {
        const response = await axios.get(apiEndpoint, { signal });
        setData(response.data);
      } catch (err) {
        if (err.name !== "AbortError") {
          if (retryCount > 0) {
            fetchData(retryCount - 1);
          } else {
            setError(err.message || "Failed to fetch data");
          }
        }
      } finally {
        setLoading(false);
      }

      return () => controller.abort();
    },
    [apiEndpoint, options.retry]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  // console.log(data);

  return { data, loading, error, refetch: fetchData };
}

export default useFetchData;
