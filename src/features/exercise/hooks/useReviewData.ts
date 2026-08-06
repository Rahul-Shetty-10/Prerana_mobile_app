import { useCallback, useEffect, useState, useRef } from "react";
import { fetchQuizAttemptReview } from "../services";
import { ReviewPayload } from "../types";
import { MOCK_REVIEW_DATA } from "../constants";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export function useReviewData(attemptId: string, getToken?: GetToken) {
  const [data, setData] = useState<ReviewPayload>(MOCK_REVIEW_DATA);
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
      setData(MOCK_REVIEW_DATA);
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
