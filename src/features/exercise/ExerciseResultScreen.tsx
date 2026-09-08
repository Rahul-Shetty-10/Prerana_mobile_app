import React from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  PerformanceBadge,
  ResultActionButtons,
  ScoreCard,
  StatisticsCard,
} from "./components";
import { ExerciseResultData } from "./types";
import { Badge, Button } from "../../shared/components";
import { AppIcon } from "../../shared/icons";
import { colors, radius, spacing, typography } from "../../shared/theme";

export interface ExerciseResultScreenProps {
  resultData?: ExerciseResultData;
  onReviewAnswers?: () => void;
  onRetryExercise?: () => void;
  onBackToSubject?: () => void;
}

export function ExerciseResultScreen({
  resultData,
  onReviewAnswers,
  onRetryExercise,
  onBackToSubject,
}: ExerciseResultScreenProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  if (!resultData) {
    return (
      <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
        <View style={styles.emptyState}>
          <AppIcon color={colors.status.error} name="alert-circle-outline" size={44} />
          <Text style={styles.emptyTitle}>Results unavailable</Text>
          <Text style={styles.emptyText}>The exercise result was not available. Please return to the chapter and try again.</Text>
          <Button onPress={() => onBackToSubject?.()} title="Back to Subject" variant="primary" />
        </View>
      </SafeAreaView>
    );
  }

  const data = resultData;

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      {/* 1. Header Row */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Pressable
            accessibilityLabel="Back to Subject"
            accessibilityRole="button"
            onPress={onBackToSubject}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <AppIcon color={themeColors.textPrimary} name="arrow-back-outline" size={20} />
          </Pressable>

          <View style={styles.subjectBlock}>
            <Text style={styles.subjectText}>{data.subjectName}</Text>
            <Badge label={data.trackName} variant="primary" />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 2. Circular Score Card */}
        <ScoreCard
          correctCount={data.correctCount}
          incorrectCount={data.incorrectCount}
          maxScore={data.maxScore}
          percentage={data.percentage}
          score={data.score}
          skippedCount={data.skippedCount}
          timeTakenFormatted={data.timeTakenFormatted}
        />

        {/* 3. Performance Level & Feedback Badge */}
        <PerformanceBadge
          accuracyPercent={data.accuracyPercent}
          performanceLevel={data.performanceLevel}
          performanceMessage={data.performanceMessage}
        />

        {/* 4. Comprehensive Statistics Breakdown */}
        <StatisticsCard
          attemptedCount={data.attemptedCount}
          completionPercent={data.completionPercent}
          correctCount={data.correctCount}
          incorrectCount={data.incorrectCount}
          skippedCount={data.skippedCount}
          totalQuestions={data.totalQuestions}
        />

        {/* 5. Action Buttons (Review, Retry, Back) */}
        <ResultActionButtons
          onBackToSubject={() => onBackToSubject?.()}
          onRetryExercise={() => onRetryExercise?.()}
          onReviewAnswers={() => onReviewAnswers?.()}
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
    paddingVertical: spacing.sm,
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
});
