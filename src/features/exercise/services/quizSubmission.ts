export interface QuizQuestionAnswerInput {
  id: string;
}

export interface QuizAttemptAnswerPayload {
  questionId: string;
  studentAnswer?: unknown;
  isSkipped: boolean;
}

export function buildQuizAttemptAnswers(
  questions: QuizQuestionAnswerInput[],
  userAnswers: Record<string, unknown>,
): QuizAttemptAnswerPayload[] {
  return questions.map((question) => {
    const answer = userAnswers[question.id];
    const isSkipped = answer === undefined || answer === null || answer === "";
    return isSkipped
      ? { questionId: question.id, isSkipped: true }
      : { questionId: question.id, studentAnswer: answer, isSkipped: false };
  });
}
