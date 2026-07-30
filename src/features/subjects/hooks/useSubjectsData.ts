import { useCallback, useEffect, useState } from "react";
import { fetchSubjectsList, fetchSubjectWorkspace } from "../services";
import { SubjectMeta, SubjectWorkspacePayload } from "../types";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export function useSubjectsList(getToken?: GetToken) {
  const [subjects, setSubjects] = useState<SubjectMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log subjects.length, loading, error, and every state update
  useEffect(() => {
    console.log(`[SUBJECTS][HOOK] useSubjectsList() - subjects.length: ${subjects.length}, loading: ${isLoading}, error: ${error}`);
  }, [subjects, isLoading, error]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSubjectsList(getToken);
      setSubjects(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load subjects";
      setError(errorMsg);
      console.log(`[SUBJECTS][ERROR] Component: useSubjectsList | Function: loadData | Error message: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return { subjects, isLoading, error, refresh: loadData };
}

export function useSubjectWorkspace(subjectId: string, getToken?: GetToken) {
  const [workspace, setWorkspace] = useState<SubjectWorkspacePayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSubjectWorkspace(subjectId, getToken);
      setWorkspace(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workspace");
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, getToken]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  return { workspace, isLoading, error, refresh: loadWorkspace };
}
