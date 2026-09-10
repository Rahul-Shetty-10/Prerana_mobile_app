import React, { useState } from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View, Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FillBlankQuestion,
  MatchFollowingQuestion,
  MCQQuestion,
  ProgressCard,
  QuestionNavigator,
  ReorderQuestion,
  TrueFalseQuestion,
} from "./components";
import { useExerciseSession } from "./hooks";
import { ExerciseResultData, QuestionItem, ReviewPayload, TrackType } from "./types";
import { Button } from "../../shared/components";
import { gradeExercise, submitQuizAttempt } from "./services";
import { markQuizCompleted } from "../../shared/services/chapterProgressService";
import { colors, radius, shadows, spacing, typography } from "../../shared/theme";
import { Header } from "../../shared/components/Header";
import { AppIcon } from "../../shared/icons";
import { useAuth } from "@clerk/expo";
import { useActiveLearningTracker } from "../../shared/hooks/useActiveLearningTracker";
import { recordBatchAttempts } from "../../shared/services/attemptTracker";
type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface ExerciseScreenProps {
  trackType?: TrackType;
  subjectId?: string;
  chapterId?: string;
  subjectSlug?: string;
  trackSlug?: string;
  getToken?: GetToken;
  onBackPress?: () => void;
  onSubmitSuccess?: (resultData: ExerciseResultData, reviewData: ReviewPayload, attemptId?: string) => void;
}

export function ExerciseScreen({
  trackType = "explorer",
  subjectId = "subj-science",
  chapterId = "chap-1",
  subjectSlug,
  trackSlug,
  getToken,
  onBackPress,
  onSubmitSuccess,
}: ExerciseScreenProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId } = useAuth();
  useActiveLearningTracker();
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: "",
    message: "",
    confirmText: "",
    cancelText: "",
    onConfirm: () => {},
  });

  const {
    session,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
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
    attemptId,
  } = useExerciseSession(trackType, subjectId, chapterId, getToken, subjectSlug, trackSlug);

  const firstRenderLogged = React.useRef(false);
  React.useEffect(() => {
    if (!isLoading && totalQuestions > 0 && currentQuestion && !firstRenderLogged.current && quizStartTime) {
      firstRenderLogged.current = true;
      console.log(`[PERF][QUIZ] First question rendered: ${Date.now() - quizStartTime}ms`);
    }
  }, [isLoading, totalQuestions, currentQuestion, quizStartTime]);

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isCurrentFlagged = flaggedIndices.includes(currentQuestionIndex);
  const currentAnswer = currentQuestion ? userAnswers[currentQuestion.id] : undefined;

  const handleSubmit = () => {
    setConfirmModal({
      visible: true,
      title: "Submit Exercise",
      message: `You have answered ${answeredIndices.length} of ${totalQuestions} questions. Are you ready to finish?`,
      confirmText: "Submit",
      cancelText: "Cancel",
      onConfirm: async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
          if (attemptId) {
            await submitQuizAttempt(attemptId, session, userAnswers, getToken);
          }
        } catch (submissionError) {
          Alert.alert(
            "Could not submit quiz",
            submissionError instanceof Error
              ? submissionError.message
              : "Please check your connection and try again.",
          );
          return;
        } finally {
          setIsSubmitting(false);
        }

        submitSession();
        const { resultData, reviewData } = gradeExercise(
          session,
          userAnswers,
          quizStartTime == null ? undefined : Date.now() - quizStartTime,
        );
        
        if (userId) {
          void recordBatchAttempts(userId, resultData.correctCount, resultData.incorrectCount);
        }

        void markQuizCompleted(
          chapterId,
          subjectId,
          resultData.percentage,
          resultData.attemptedCount
        );
        onSubmitSuccess?.(resultData, reviewData, attemptId || undefined);
      },
    });
  };

  const renderQuestionBody = (question: QuestionItem) => {
    if (question.isLoaded === false) {
      return (
        <View style={{ padding: 40, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary.main} size="small" />
          <Text style={{ marginTop: 8, color: themeColors.textMuted, fontSize: 12 }}>
            Loading question details...
          </Text>
        </View>
      );
    }

    switch (question.type) {
      case "mcq":
        return (
          <MCQQuestion
            onSelectOption={(optionId) => setAnswer(question.id, optionId)}
            question={question}
            selectedOptionId={currentAnswer}
          />
        );

      case "true_false":
        return (
          <TrueFalseQuestion
            onSelectValue={(val) => setAnswer(question.id, val)}
            question={question}
            selectedValue={currentAnswer}
          />
        );

      case "match":
        return (
          <MatchFollowingQuestion
            onSelectValue={(val) => setAnswer(question.id, val)}
            question={question}
            selectedValue={currentAnswer}
          />
        );

      case "fill_blank":
        return (
          <FillBlankQuestion
            onChangeValue={(text) => setAnswer(question.id, text)}
            question={question}
            value={currentAnswer || ""}
          />
        );

      case "reorder":
        return (
          <ReorderQuestion
            onSelectValue={(val) => setAnswer(question.id, val)}
            question={question}
            selectedValue={currentAnswer}
          />
        );

      default:
        return (
          <MCQQuestion
            onSelectOption={(optionId) => setAnswer(question.id, optionId)}
            question={question}
            selectedOptionId={currentAnswer}
          />
        );
    }
  };

  const handleBackPress = () => {
    setConfirmModal({
      visible: true,
      title: "Are you sure to exit?",
      message: "If you exit, the test will be complete.",
      confirmText: "Yes, exit",
      cancelText: "No, continue",
      onConfirm: () => {
        if (onBackPress) {
          onBackPress();
        }
      },
    });
  };

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      {/* 1. Sticky Header */}
      <Header
        title="Quiz"
        onBackPress={handleBackPress}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary.main} size="large" />
            <Text style={styles.loadingText}>Loading Exercise Session...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyStateContainer}>
            <View style={[styles.emptyStateCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
              <View style={[styles.emptyStateIconCircle, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                <AppIcon name="alert-circle-outline" size={36} color={colors.status.error} />
              </View>
              <Text style={[styles.emptyStateTitle, { color: themeColors.textPrimary }]}>Questions Not Available</Text>
              <Text style={[styles.emptyStateMessage, { color: themeColors.textMuted }]}>{error}</Text>
              <Pressable
                onPress={onBackPress}
                style={({ pressed }) => [{ backgroundColor: colors.primary.main, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, marginTop: 8, opacity: pressed ? 0.8 : 1 }]}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Go Back</Text>
              </Pressable>
            </View>
          </View>
        ) : totalQuestions === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={[styles.emptyStateCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
              <View style={[styles.emptyStateIconCircle, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                <AppIcon name="time-outline" size={36} color={colors.primary.main} />
              </View>
              <Text style={[styles.emptyStateTitle, { color: themeColors.textPrimary }]}>No Questions Yet</Text>
              <Text style={[styles.emptyStateMessage, { color: themeColors.textMuted }]}>Questions for this chapter are being prepared by our team.</Text>
              <Pressable
                onPress={onBackPress}
                style={({ pressed }) => [{ backgroundColor: colors.primary.main, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, marginTop: 8, opacity: pressed ? 0.8 : 1 }]}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Go Back</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            {/* Session Meta Info Banner */}
            <View style={styles.sessionMetaBanner}>
              <Text style={styles.subjectText}>{session.subjectName} • {session.trackName}</Text>
            </View>

            {/* 2. Progress Summary Card */}
            <ProgressCard
              answeredCount={answeredIndices.length}
              currentQuestionIndex={currentQuestionIndex}
              flaggedCount={flaggedIndices.length}
              totalQuestions={totalQuestions}
              onQuestionNavPress={() => setIsNavDrawerOpen(true)}
            />

            {/* 3. Question Card Area */}
            {currentQuestion ? (
              <View style={styles.questionCard}>
                <View style={styles.questionHeaderRow}>
                  <Text style={styles.questionNumberBadge}>
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </Text>
                  <Button
                    iconName={isCurrentFlagged ? "flag" : "flag-outline"}
                    onPress={() => toggleFlagIndex(currentQuestionIndex)}
                    title={isCurrentFlagged ? "Flagged" : "Flag"}
                    variant={isCurrentFlagged ? "secondary" : "outline"}
                  />
                </View>

                {(() => {
                  const q = currentQuestion;
                  const rawQ = (q as any)._rawBackendPayload || q;
                  const backendQuestion = rawQ.question || rawQ;
                  console.log(
                    `[QUIZ][RENDER]\n` +
                    `index=${currentQuestionIndex}\n` +
                    `questionId=${q.id}\n` +
                    `questionType=${q.type}\n` +
                    `questionText=${!!(backendQuestion.questionText || q.prompt)}\n` +
                    `hasOptions=${!!(backendQuestion.options || q.mcqOptions || q.matchPairs)}`
                  );
                  return renderQuestionBody(q);
                })()}
              </View>
            ) : null}

            {/* 4. Question Action Controls */}
            <View style={styles.controlsRow}>
              <Button
                disabled={currentQuestionIndex === 0}
                iconName="arrow-back-outline"
                onPress={goToPrevQuestion}
                style={styles.navButton}
                title="Previous"
                variant="secondary"
              />

              {isLastQuestion ? (
                <Button
                  iconName="checkmark-done-circle-outline"
                  onPress={handleSubmit}
                  style={styles.navButton}
                  title="Submit Exercise"
                  variant="primary"
                />
              ) : (
                <Button
                  iconName="arrow-forward-outline"
                  onPress={goToNextQuestion}
                  style={styles.navButton}
                  title="Next"
                  variant="primary"
                />
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Navigation Drawer Modal */}
      <Modal
        animationType="slide"
        onRequestClose={() => setIsNavDrawerOpen(false)}
        transparent
        visible={isNavDrawerOpen}
      >
        <Pressable
          onPress={() => setIsNavDrawerOpen(false)}
          style={styles.drawerOverlay}
        >
          <View
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
            style={styles.drawerContainer}
          >
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Select Question</Text>
              <Pressable
                onPress={() => setIsNavDrawerOpen(false)}
                style={styles.drawerCloseBtn}
              >
                <AppIcon color={themeColors.textPrimary} name="close-outline" size={24} />
              </Pressable>
            </View>

            <View style={styles.drawerGrid}>
              {Array.from({ length: totalQuestions }).map((_, index) => {
                const isAttempted = answeredIndices.includes(index);
                const isFlagged = flaggedIndices.includes(index);
                const isActive = index === currentQuestionIndex;
                return (
                  <Pressable
                    key={index}
                    onPress={() => {
                      jumpToQuestion(index);
                      setIsNavDrawerOpen(false);
                    }}
                    style={[
                      styles.drawerItem,
                      isFlagged
                        ? styles.drawerItemFlagged
                        : isAttempted
                        ? styles.drawerItemAttempted
                        : styles.drawerItemMissed,
                      isActive && styles.drawerItemActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.drawerItemText,
                        isFlagged
                          ? styles.drawerItemTextFlagged
                          : isAttempted
                          ? styles.drawerItemTextAttempted
                          : styles.drawerItemTextMissed,
                        isActive && styles.drawerItemTextActive,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Custom Confirmation Modal */}
      <Modal
        animationType="fade"
        onRequestClose={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
        transparent
        visible={confirmModal.visible}
      >
        <Pressable
          onPress={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
          style={styles.confirmOverlay}
        >
          <View
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
            style={styles.confirmContainer}
          >
            <Text style={styles.confirmTitle}>{confirmModal.title}</Text>
            <Text style={styles.confirmMessage}>{confirmModal.message}</Text>
            <View style={styles.confirmButtonsRow}>
              <Button
                onPress={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
                style={styles.confirmBtn}
                title={confirmModal.cancelText}
                variant="outline"
              />
              <Button
                onPress={() => {
                  setConfirmModal((prev) => ({ ...prev, visible: false }));
                  void confirmModal.onConfirm();
                }}
                style={styles.confirmBtn}
                title={confirmModal.confirmText}
                variant="primary"
                disabled={isSubmitting}
              />
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl + 20,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: themeColors.textMuted,
  },
  sessionMetaBanner: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    gap: 2,
  },
  subjectText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: colors.primary.main,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sessionTitleText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  questionCard: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    ...shadows.sm,
    gap: spacing.md,
  },
  questionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderSubtle,
    paddingBottom: spacing.xs,
  },
  questionNumberBadge: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.heavy,
    color: colors.primary.main,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  controlsRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  navButton: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  emptyStateCard: {
    width: "100%",
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
    ...shadows.sm,
  },
  emptyStateIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    textAlign: "center",
  },
  emptyStateMessage: {
    fontSize: typography.fontSize.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyStatePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    marginTop: spacing.xs,
  },
  emptyStatePillText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  drawerContainer: {
    backgroundColor: themeColors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  drawerTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  drawerCloseBtn: {
    padding: spacing.xs,
  },
  drawerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
  },
  drawerItem: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  drawerItemAttempted: {
    backgroundColor: "#2E7D32", // Green
  },
  drawerItemMissed: {
    backgroundColor: "#F57F17", // Yellow / Gold
  },
  drawerItemFlagged: {
    backgroundColor: colors.status.error, // Red
  },
  drawerItemActive: {
    borderColor: colors.primary.main,
    transform: [{ scale: 1.05 }],
  },
  drawerItemText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
  },
  drawerItemTextAttempted: {
    color: "#FFFFFF",
  },
  drawerItemTextMissed: {
    color: "#FFFFFF",
  },
  drawerItemTextFlagged: {
    color: "#FFFFFF",
  },
  drawerItemTextActive: {
    fontWeight: typography.fontWeight.heavy,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmContainer: {
    width: "84%",
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.md,
  },
  confirmTitle: {
    fontSize: typography.fontSize.md + 1,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  confirmMessage: {
    fontSize: typography.fontSize.sm,
    color: themeColors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  confirmButtonsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
  },
  confirmBtn: {
    flex: 1,
  },
});
