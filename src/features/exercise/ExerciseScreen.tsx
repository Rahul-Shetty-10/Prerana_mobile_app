import React from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
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
import { QuestionItem, TrackType } from "./types";
import { Button } from "../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../shared/theme";
import { Header } from "../../shared/components/Header";
type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface ExerciseScreenProps {
  trackType?: TrackType;
  subjectId?: string;
  chapterId?: string;
  getToken?: GetToken;
  onBackPress?: () => void;
  onSubmitSuccess?: () => void;
}

export function ExerciseScreen({
  trackType = "explorer",
  subjectId = "subj-science",
  chapterId = "chap-1",
  getToken,
  onBackPress,
  onSubmitSuccess,
}: ExerciseScreenProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);

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
    setAnswer,
    toggleFlagIndex,
    goToNextQuestion,
    goToPrevQuestion,
    jumpToQuestion,
    submitSession,
  } = useExerciseSession(trackType, subjectId, chapterId, getToken);

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isCurrentFlagged = flaggedIndices.includes(currentQuestionIndex);
  const currentAnswer = currentQuestion ? userAnswers[currentQuestion.id] : undefined;

  const handleSubmit = () => {
    Alert.alert(
      "Submit Exercise",
      `You have answered ${answeredIndices.length} of ${totalQuestions} questions. Are you ready to finish?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          style: "default",
          onPress: () => {
            submitSession();
            onSubmitSuccess?.();
          },
        },
      ]
    );
  };

  const renderQuestionBody = (question: QuestionItem) => {
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

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      {/* 1. Sticky Header */}
      <Header
        title="Quiz"
        onBackPress={onBackPress}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary.main} size="large" />
            <Text style={styles.loadingText}>Loading Exercise Session...</Text>
          </View>
        ) : (
          <>
            {/* Session Meta Info Banner */}
            <View style={styles.sessionMetaBanner}>
              <Text style={styles.subjectText}>{session.subjectName} • {session.trackName}</Text>
              <Text style={styles.sessionTitleText}>{session.title}</Text>
            </View>

            {/* 2. Progress Summary Card */}
            <ProgressCard
              answeredCount={answeredIndices.length}
              currentQuestionIndex={currentQuestionIndex}
              flaggedCount={flaggedIndices.length}
              totalQuestions={totalQuestions}
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

                {renderQuestionBody(currentQuestion)}
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

            {/* 5. Question Grid Navigator */}
            <QuestionNavigator
              answeredIndices={answeredIndices}
              currentIndex={currentQuestionIndex}
              flaggedIndices={flaggedIndices}
              onSelectQuestion={jumpToQuestion}
              totalQuestions={totalQuestions}
            />
          </>
        )}
      </ScrollView>
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
});