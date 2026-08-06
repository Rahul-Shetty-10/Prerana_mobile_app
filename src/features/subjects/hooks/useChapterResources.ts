import { useCallback, useEffect, useState } from "react";
import { ChapterResourcesPayload, fetchChapterResources, ChapterResourcesError } from "../services";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export function useChapterResources(
  subjectId: string,
  chapterId: string,
  getToken?: GetToken
) {
  const [resources, setResources] = useState<ChapterResourcesPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadResources = useCallback(async () => {
    if (!getToken) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchChapterResources(subjectId, chapterId, getToken);
      setResources(result);
    } catch (err) {
      console.error("[SUBJECTS][HOOK] useChapterResources caught error:", err);
      if (err instanceof ChapterResourcesError) {
        if (err.code === 'NETWORK_FAILURE') {
          setError("Network connection issue. Please check your connection and retry.");
        } else if (err.code === 'UNAUTHORIZED') {
          setError("Session expired. Please sign in again.");
        } else if (err.code === 'EMPTY_DATA') {
          setError("No resources are configured for this chapter yet.");
        } else {
          setError("Failed to load chapter resources. Please try again later.");
        }
      } else {
        setError("Failed to load chapter resources. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, chapterId, getToken]);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  return {
    resources,
    isLoading,
    error,
    refresh: loadResources,
  };
}
