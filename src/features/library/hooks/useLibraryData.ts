import { useCallback, useEffect, useState } from "react";
import { fetchLibraryData } from "../services";
import { LibraryPayload } from "../types";
import { MOCK_LIBRARY_DATA } from "../constants";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export function useLibraryData(getToken?: GetToken) {
  const [data, setData] = useState<LibraryPayload>(MOCK_LIBRARY_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchLibraryData(getToken);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load library data");
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

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
