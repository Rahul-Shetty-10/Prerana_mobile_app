import { useCallback, useEffect, useState, useRef } from "react";
import { fetchExerciseSession, fetchFundamentalsTrack, mapBackendQuestionToQuestionItem } from "../services";
import { ExerciseSessionPayload, TrackType } from "../types";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

const EMPTY_SESSION: ExerciseSessionPayload = {
  id: "",
  subjectName: "",
  trackName: "",
  trackType: "explorer",
  title: "",
  totalQuestions: 0,
  questions: [],
};

export function useExerciseSession(
  trackType: TrackType = "explorer",
  subjectId: string = "subj-science",
  chapterId: string = "chap-1",
  getToken?: GetToken,
  subjectSlug?: string,
  trackSlug?: string
) {
  const [session, setSession] = useState<ExerciseSessionPayload>({
    ...EMPTY_SESSION,
    trackType,
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [flaggedIndices, setFlaggedIndices] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const currentAttemptIdRef = useRef<string | null>(null);

  const loadSession = useCallback(async () => {
    const activeGetToken = getTokenRef.current;
    if (!activeGetToken) {
      setError("Authentication required. Please sign in.");
      return;
    }

    const startTime = Date.now();
    setQuizStartTime(startTime);
    console.log("[PERF][QUIZ] Quiz start");

    setIsLoading(true);
    setError(null);

    try {
      currentAttemptIdRef.current = null;
      if (subjectSlug && trackSlug) {
        const payload = await fetchFundamentalsTrack(subjectSlug, trackSlug, activeGetToken);
        setSession(payload);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setFlaggedIndices([]);
        setIsSubmitted(false);
      } else {
        const res = await fetchExerciseSession(trackType, subjectId, chapterId, activeGetToken, startTime);
        currentAttemptIdRef.current = res.attemptId;
        setSession(res.session);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setFlaggedIndices([]);
        setIsSubmitted(false);
        // All questions are fully loaded at once — no background fetching needed
      }
    } catch (err) {
      console.warn("[EXERCISE][useExerciseSession] Track not loaded:", err instanceof Error ? err.message : String(err));
      setError(err instanceof Error ? err.message : "Failed to load exercise session.");
      setSession({ ...EMPTY_SESSION, trackType });
    } finally {
      setIsLoading(false);
    }
  }, [trackType, subjectId, chapterId, subjectSlug, trackSlug]);


  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const currentQuestion = session.questions[currentQuestionIndex] || session.questions[0];

  const setAnswer = (questionId: string, answer: any) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const toggleFlagIndex = (index: number) => {
    setFlaggedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const jumpToQuestion = (index: number) => {
    if (index >= 0 && index < session.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const answeredIndices = session.questions
    .map((q, idx) => (userAnswers[q.id] !== undefined && userAnswers[q.id] !== "" ? idx : null))
    .filter((idx): idx is number => idx !== null);

  const submitSession = () => {
    setIsSubmitted(true);
  };

  return {
    session,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions: session.questions.length,
    userAnswers,
    answeredIndices,
    flaggedIndices,
    isSubmitted,
    isLoading,
    error,
    quizStartTime,
    setAnswer,
    toggleFlagIndex,
    goToNextQuestion,
    goToPrevQuestion,
    jumpToQuestion,
    submitSession,
    attemptId: currentAttemptIdRef.current,
  };
}
