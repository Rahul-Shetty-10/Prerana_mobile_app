import { useCallback, useEffect, useState, useRef } from "react";
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
  EMPTY_ASSESSMENT_HISTORY_DATA,
  EMPTY_QUIZ_LANDING_DATA,
  EMPTY_QUIZZES_HOME_DATA,
} from "../constants";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export function useQuizzesHomeData(getToken?: GetToken) {
  const [data, setData] = useState<QuizzesHomePayload>(EMPTY_QUIZZES_HOME_DATA);
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
      const result = await fetchQuizzesHomeData(activeGetToken);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quizzes home data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return { data, isLoading, error, refresh: loadData };
}

export function useAssessmentHistoryData(getToken?: GetToken) {
  const [data, setData] = useState<AssessmentHistoryPayload>(EMPTY_ASSESSMENT_HISTORY_DATA);
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
      const result = await fetchAssessmentHistoryData(activeGetToken);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assessment history data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return { data, isLoading, error, refresh: loadData };
}

export function useQuizLandingData(subjectId?: string, chapterId?: string, getToken?: GetToken) {
  const [data, setData] = useState<QuizLandingPayload>(EMPTY_QUIZ_LANDING_DATA);
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
      const result = await fetchQuizLandingData(subjectId, chapterId, activeGetToken);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz landing data");
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, chapterId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return { data, isLoading, error, refresh: loadData };
}
