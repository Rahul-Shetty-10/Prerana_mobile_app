import { useCallback, useEffect, useState } from "react";
import { fetchExerciseSession, fetchFundamentalsTrack } from "../services";
import { ExerciseSessionPayload, TrackType } from "../types";
import { MOCK_EXERCISE_EXPLORER } from "../constants";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export function useExerciseSession(
  trackType: TrackType = "explorer",
  subjectId: string = "subj-science",
  chapterId: string = "chap-1",
  getToken?: GetToken,
  subjectSlug?: string,
  trackSlug?: string
) {
  const [session, setSession] = useState<ExerciseSessionPayload>({
    ...MOCK_EXERCISE_EXPLORER,
    trackType,
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [flaggedIndices, setFlaggedIndices] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const payload = subjectSlug && trackSlug
        ? await fetchFundamentalsTrack(subjectSlug, trackSlug, getToken)
        : await fetchExerciseSession(trackType, subjectId, chapterId, getToken);
      setSession(payload);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setFlaggedIndices([]);
      setIsSubmitted(false);
    } catch (err) {
      setSession({
        ...MOCK_EXERCISE_EXPLORER,
        trackType,
      });
    } finally {
      setIsLoading(false);
    }
  }, [trackType, subjectId, chapterId, getToken, subjectSlug, trackSlug]);

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
    setAnswer,
    toggleFlagIndex,
    goToNextQuestion,
    goToPrevQuestion,
    jumpToQuestion,
    submitSession,
  };
}
