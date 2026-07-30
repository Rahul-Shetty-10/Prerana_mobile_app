import React from "react";
import { useTheme } from "../../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { ReviewQuestionCardProps } from "../../types";
import { Badge } from "../../../../shared/components";
import { AppIcon } from "../../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../../shared/theme";

export function ReviewQuestionCard({
  question,
  currentNumber,
  totalQuestions,
}: ReviewQuestionCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const isCorrect = question.status === "correct";
  const isIncorrect = question.status === "incorrect";

  return (
    <View style={styles.card}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.questionNumberText}>
          Question {currentNumber} of {totalQuestions}
        </Text>
        <Badge label={question.typeLabel} variant="secondary" />
      </View>

      {/* Status Badge */}
      <View style={styles.statusRow}>
        {isCorrect ? (
          <View style={[styles.statusBadge, { backgroundColor: colors.accents.emerald.darkBg }]}>
            <AppIcon color={colors.status.success} name="checkmark-circle" size={16} />
            <Text style={[styles.statusText, { color: colors.status.success }]}>CORRECT</Text>
          </View>
        ) : isIncorrect ? (
          <View style={[styles.statusBadge, { backgroundColor: "#3B1818" }]}>
            <AppIcon color={colors.status.error} name="close-circle" size={16} />
            <Text style={[styles.statusText, { color: colors.status.error }]}>INCORRECT</Text>
          </View>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: themeColors.surfaceSecondary }]}>
            <AppIcon color={themeColors.textMuted} name="help-circle" size={16} />
            <Text style={[styles.statusText, { color: themeColors.textMuted }]}>SKIPPED</Text>
          </View>
        )}
      </View>

      {/* Question Prompt */}
      <Text style={styles.prompt}>{question.prompt}</Text>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    ...shadows.sm,
    gap: spacing.xs + 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  questionNumberText: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.heavy,
    color: colors.primary.light,
    textTransform: "uppercase",
  },
  statusRow: {
    flexDirection: "row",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    gap: 4,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  prompt: {
    fontSize: typography.fontSize.md + 1,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    lineHeight: typography.lineHeight.md + 4,
    marginTop: 4,
  },
});