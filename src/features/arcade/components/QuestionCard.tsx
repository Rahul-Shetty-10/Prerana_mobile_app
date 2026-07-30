import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { QuestionCardProps } from "../types";
import { Badge } from "../../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function QuestionCard({
  questionNumber,
  totalQuestions,
  category,
  difficulty,
  questionText,
}: QuestionCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.cardContainer}>
      {/* Top Meta Badges */}
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          <Badge label={category} variant="primary" />
          <Badge label={difficulty} variant="secondary" />
        </View>
        <Text style={styles.numberText}>
          {questionNumber} / {totalQuestions}
        </Text>
      </View>

      {/* Question Text Prompt */}
      <Text style={styles.questionText}>{questionText}</Text>
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
    marginTop: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm + 2,
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  badgeGroup: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  numberText: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textMuted,
  },
  questionText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    lineHeight: typography.lineHeight.lg + 2,
  },
});