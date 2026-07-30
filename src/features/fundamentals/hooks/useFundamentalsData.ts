import { useCallback, useEffect, useState } from "react";
import { fetchFundamentalsData } from "../services";
import { FundamentalsDataPayload } from "../types";
import { MOCK_FUNDAMENTALS_HEADER, MOCK_FUNDAMENTALS_SUBJECTS } from "../constants";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export function useFundamentalsData(getToken?: GetToken) {
  const [data, setData] = useState<FundamentalsDataPayload>({
    subjectCount: MOCK_FUNDAMENTALS_HEADER.subjectCount,
    trackCount: MOCK_FUNDAMENTALS_HEADER.trackCount,
    subjects: MOCK_FUNDAMENTALS_SUBJECTS,
  });
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
