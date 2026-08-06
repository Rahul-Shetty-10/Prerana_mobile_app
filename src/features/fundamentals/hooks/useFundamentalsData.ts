import { useCallback, useEffect, useState } from "react";
import { fetchFundamentalsData } from "../services";
import { FundamentalsDataPayload } from "../types";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

const EMPTY_FUNDAMENTALS: FundamentalsDataPayload = {
  subjectCount: 0,
  trackCount: 0,
  subjects: [],
};

export function useFundamentalsData(getToken?: GetToken) {
  const [data, setData] = useState<FundamentalsDataPayload>(EMPTY_FUNDAMENTALS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFundamentalsData(getToken);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load fundamentals data");
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
