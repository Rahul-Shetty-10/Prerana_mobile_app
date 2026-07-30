import React from "react";
import { useTheme } from "../../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { AnswerComparisonCardProps } from "../../types";
import { AppIcon } from "../../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../../shared/theme";

export function AnswerComparisonCard({
  studentAnswer,
  correctAnswer,
  status,
}: AnswerComparisonCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const isCorrect = status === "correct";

  return (
    <View style={styles.card}>
      <Text style={styles.headerLabel}>Answer Comparison</Text>

      {/* Student Selected Answer Box */}
      <View
        style={[
          styles.answerBox,
          isCorrect ? styles.correctBox : status === "incorrect" ? styles.incorrectBox : styles.skippedBox,
        ]}
      >
        <View style={styles.labelRow}>
          <AppIcon
            color={
              isCorrect
                ? colors.status.success
                : status === "incorrect"
                ? colors.status.error
                : themeColors.textMuted
            }
            name={
              isCorrect
                ? "checkmark-circle-outline"
                : status === "incorrect"
                ? "close-circle-outline"
                : "help-circle-outline"
            }
            size={16}
          />
          <Text style={styles.boxLabel}>Your Selected Answer</Text>
        </View>

        <Text
          style={[
            styles.answerText,
            isCorrect
              ? styles.correctText
              : status === "incorrect"
              ? styles.incorrectText
              : styles.skippedText,
          ]}
        >
          {studentAnswer || "No answer submitted"}
        </Text>
      </View>

      {/* Correct Answer Box (only if incorrect or skipped) */}
      {!isCorrect ? (
        <View style={[styles.answerBox, styles.correctBox]}>
          <View style={styles.labelRow}>
            <AppIcon color={colors.status.success} name="checkmark-circle-outline" size={16} />
            <Text style={styles.boxLabel}>Correct Answer</Text>
          </View>

          <Text style={[styles.answerText, styles.correctText]}>{correctAnswer}</Text>
        </View>
      ) : null}
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs + 2,
    ...shadows.sm,
    gap: spacing.xs + 2,
  },
  headerLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  answerBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
  },
  correctBox: {
    backgroundColor: colors.accents.emerald.darkBg,
    borderColor: colors.status.success,
  },
  incorrectBox: {
    backgroundColor: "#3B1818",
    borderColor: colors.status.error,
  },
  skippedBox: {
    backgroundColor: themeColors.surfaceSecondary,
    borderColor: themeColors.border,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  boxLabel: {
    fontSize: typography.fontSize.xs - 1,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textMuted,
    textTransform: "uppercase",
  },
  answerText: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.md,
  },
  correctText: {
    color: colors.status.success,
  },
  incorrectText: {
    color: colors.status.error,
  },
  skippedText: {
    color: themeColors.textMuted,
  },
});