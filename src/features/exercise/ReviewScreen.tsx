import React, { useState } from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AnswerComparisonCard,
  ExplanationCard,
  ReviewActionButtons,
  ReviewNavigator,
  ReviewQuestionCard,
  ReviewSummaryCard,
} from "./components";
import { useReviewData } from "./hooks";
import { ReviewPayload } from "./types";
import { Badge, Button } from "../../shared/components";
import { AppIcon } from "../../shared/icons";
import { colors, radius, spacing, typography } from "../../shared/theme";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface ReviewScreenProps {
  attemptId?: string;
  getToken?: GetToken;
  reviewData?: ReviewPayload;
  onRetryExercise?: () => void;
  onBackToResult?: () => void;
  onBackToSubject?: () => void;
}

export function ReviewScreen({
  attemptId,
  getToken,
  reviewData,
  onRetryExercise,
  onBackToResult,
  onBackToSubject,
}: ReviewScreenProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const { data: fetchedData, isLoading, error, refresh } = useReviewData(attemptId || "", getToken);
  const data = reviewData || fetchedData;
  const [activeIndex, setActiveIndex] = useState(0);

  if (!data) {
    return (
      <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
        <View style={styles.emptyState}>
          <AppIcon color={colors.status.error} name="alert-circle-outline" size={44} />
          <Text style={styles.emptyTitle}>Review unavailable</Text>
          <Text style={styles.emptyText}>{error || "The quiz review could not be loaded."}</Text>
          {getToken ? <Button onPress={() => void refresh()} title="Try Again" variant="primary" /> : null}
          <Button onPress={() => onBackToResult?.()} title="Back to Results" variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const activeQuestion = data.questions[activeIndex] || data.questions[0];

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < data.questions.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      {/* 1. Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Pressable
            accessibilityLabel="Back to Result"
            accessibilityRole="button"
            onPress={onBackToResult}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <AppIcon color={themeColors.textPrimary} name="arrow-back-outline" size={20} />
          </Pressable>

          <View style={styles.subjectBlock}>
            <Text style={styles.subjectText}>{data.subjectName}</Text>
            <Badge label={data.trackName} variant="primary" />
          </View>
        </View>

        <Text numberOfLines={2} style={styles.title}>
          {data.title}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          getToken ? (
            <RefreshControl
              colors={[colors.primary.main]}
              onRefresh={() => void refresh()}
              refreshing={isLoading}
              tintColor={colors.primary.main}
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Loading Indicator */}
        {isLoading && !reviewData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary.main} size="large" />
            <Text style={styles.loadingText}>Loading Quiz Attempt Review...</Text>
          </View>
        ) : null}

        {/* Error Banner */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* 2. Review Summary Overview */}
        <ReviewSummaryCard
          accuracyPercent={data.accuracyPercent}
          correctCount={data.correctCount}
          incorrectCount={data.incorrectCount}
          skippedCount={data.skippedCount}
          totalQuestions={data.totalQuestions}
        />

        {/* 3. Detailed Question Review Section */}
        {activeQuestion ? (
          <>
            <ReviewQuestionCard
              currentNumber={activeIndex + 1}
              question={activeQuestion}
              totalQuestions={data.totalQuestions}
            />

            <AnswerComparisonCard
              correctAnswer={activeQuestion.correctAnswer}
              status={activeQuestion.status}
              studentAnswer={activeQuestion.studentAnswer}
            />

            <ExplanationCard explanation={activeQuestion.explanation} />

            {/* Question Navigation Controls */}
            <View style={styles.questionNavRow}>
              <Button
                disabled={activeIndex === 0}
                iconName="arrow-back-outline"
                onPress={handlePrev}
                style={styles.navBtn}
                title="Previous Q"
                variant="secondary"
              />

              <Button
                disabled={activeIndex === data.questions.length - 1}
                iconName="arrow-forward-outline"
                onPress={handleNext}
                style={styles.navBtn}
                title="Next Q"
                variant="primary"
              />
            </View>
          </>
        ) : null}

        {/* 4. Question Grid Navigator */}
        <ReviewNavigator
          currentIndex={activeIndex}
          onSelectQuestion={(idx) => setActiveIndex(idx)}
          questions={data.questions}
        />

        {/* 5. Bottom Action Buttons */}
        <ReviewActionButtons
          onBackToResult={() => onBackToResult?.()}
          onBackToSubject={() => onBackToSubject?.()}
          onRetryExercise={() => onRetryExercise?.()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  header: {
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.xs,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  subjectBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  subjectText: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textMuted,
    fontWeight: typography.fontWeight.bold,
    textTransform: "uppercase",
  },
  title: {
    fontSize: typography.fontSize.md + 1,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    lineHeight: typography.lineHeight.md + 2,
  },
  scrollContent: {
    paddingBottom: spacing.xxl + 20,
  },
  questionNavRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  navBtn: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  loadingText: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textMuted,
  },
  errorBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    padding: spacing.xs + 2,
    borderRadius: 8,
    backgroundColor: "#3B1818",
    borderWidth: 1,
    borderColor: "#7A2E2E",
  },
  errorText: {
    fontSize: typography.fontSize.xs + 1,
    color: colors.status.error,
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    textAlign: "center",
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: themeColors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
});
