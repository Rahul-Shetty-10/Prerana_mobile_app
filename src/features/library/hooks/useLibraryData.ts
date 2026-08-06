import { useCallback, useEffect, useState, useRef } from "react";
import { fetchLibraryData } from "../services";
import { LibraryPayload } from "../types";
import { MOCK_LIBRARY_DATA } from "../constants";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export function useLibraryData(getToken?: GetToken) {
  const [data, setData] = useState<LibraryPayload>(MOCK_LIBRARY_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const loadData = useCallback(async () => {
    const activeGetToken = getTokenRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchLibraryData(activeGetToken);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load library data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    refresh: loadData,
  };
}
