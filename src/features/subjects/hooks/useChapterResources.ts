import { useCallback, useEffect, useState } from "react";
import { ChapterResourcesPayload, fetchChapterResources } from "../services";

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
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchChapterResources(subjectId, chapterId, getToken);
      setResources(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chapter resources");
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
