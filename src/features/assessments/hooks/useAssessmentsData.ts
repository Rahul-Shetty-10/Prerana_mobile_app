import { useCallback, useEffect, useState } from "react";
import {
  fetchAssessmentHistoryData,
  fetchQuizLandingData,
  fetchQuizzesHomeData,
} from "../services";
import {
  AssessmentHistoryPayload,
  QuizLandingPayload,
  QuizzesHomePayload,
} from "../types";
import {
  MOCK_ASSESSMENT_HISTORY_DATA,
  MOCK_QUIZ_LANDING_DATA,
  MOCK_QUIZZES_HOME_DATA,
} from "../constants";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export function useQuizzesHomeData(getToken?: GetToken) {
  const [data, setData] = useState<QuizzesHomePayload>(MOCK_QUIZZES_HOME_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchQuizzesHomeData(getToken);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quizzes home data");
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return { data, isLoading, error, refresh: loadData };
}

export function useAssessmentHistoryData(getToken?: GetToken) {
  const [data, setData] = useState<AssessmentHistoryPayload>(MOCK_ASSESSMENT_HISTORY_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAssessmentHistoryData(getToken);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assessment history data");
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return { data, isLoading, error, refresh: loadData };
}

export function useQuizLandingData(subjectId?: string, chapterId?: string, getToken?: GetToken) {
  const [data, setData] = useState<QuizLandingPayload>(MOCK_QUIZ_LANDING_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchQuizLandingData(subjectId, chapterId, getToken);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz landing data");
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, chapterId, getToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return { data, isLoading, error, refresh: loadData };
}
