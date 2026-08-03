import { useCallback, useEffect, useState } from "react";
import { fetchSubjectsList, fetchSubjectWorkspace, SubjectsError } from "../services";
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
    if (!getToken) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSubjectsList(getToken);
      setSubjects(data);
    } catch (err) {
      console.error("[SUBJECTS][HOOK] useSubjectsList caught error:", err);
      if (err instanceof SubjectsError) {
        if (err.code === 'NETWORK_FAILURE') {
          setError("Network connection issue. Please check your connection and retry.");
        } else if (err.code === 'UNAUTHORIZED') {
          setError("Session expired. Please sign in again.");
        } else {
          setError("Failed to load subjects. Please try again later.");
        }
      } else {
        setError("Failed to load subjects. Please try again later.");
      }
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
      console.error("[SUBJECTS][HOOK] useSubjectWorkspace caught error:", err);
      if (err instanceof SubjectsError) {
        if (err.code === 'NETWORK_FAILURE') {
          setError("Network connection issue. Please check your connection and retry.");
        } else if (err.code === 'UNAUTHORIZED') {
          setError("Session expired. Please sign in again.");
        } else {
          setError("Failed to load subject workspace. Please try again later.");
        }
      } else {
        setError("Failed to load subject workspace. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, getToken]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  return { workspace, isLoading, error, refresh: loadWorkspace };
}
