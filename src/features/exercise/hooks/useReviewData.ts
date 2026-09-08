import { useCallback, useEffect, useState, useRef } from "react";
import { fetchQuizAttemptReview } from "../services";
import { ReviewPayload } from "../types";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export function useReviewData(attemptId: string, getToken?: GetToken) {
  const [data, setData] = useState<ReviewPayload | null>(null);
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
      const result = await fetchQuizAttemptReview(attemptId, activeGetToken);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load review data");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [attemptId]);

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
