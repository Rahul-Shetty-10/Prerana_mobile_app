import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { LightningQuestionCardProps } from "../types";
import { Badge } from "../../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function LightningQuestionCard({
  question,
  questionNumber,
  totalAnswered,
  isUrgent,
}: LightningQuestionCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const isTrueFalse = question.questionType === "true_false";

  return (
    <View style={[styles.cardContainer, isUrgent && styles.urgentCard]}>
      {/* Top Badges */}
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          <Badge label={question.category} variant="primary" />
          <Badge label={isTrueFalse ? "TRUE / FALSE" : "SPEED MCQ"} variant="secondary" />
        </View>
        <Text style={[styles.answeredText, isUrgent && styles.urgentText]}>
          Q#{totalAnswered + 1}
        </Text>
      </View>

      {/* Question Prompt */}
      <Text style={styles.questionText}>{question.question}</Text>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  cardContainer: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  urgentCard: {
    borderColor: colors.status.error,
    backgroundColor: "#251212",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  badgeGroup: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  answeredText: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.heavy,
    color: colors.accents.amber.text,
  },
  urgentText: {
    color: colors.status.error,
  },
  questionText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    lineHeight: typography.lineHeight.lg,
  },
});