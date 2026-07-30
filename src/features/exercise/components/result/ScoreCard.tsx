import React from "react";
import { useTheme } from "../../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { ScoreCardProps } from "../../types";
import { AppIcon } from "../../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../../shared/theme";

export function ScoreCard({
  score,
  maxScore,
  percentage,
  correctCount,
  incorrectCount,
  skippedCount,
  timeTakenFormatted,
}: ScoreCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.card}>
      {/* Circular Score Badge Shell */}
      <View style={styles.circleShell}>
        <View style={styles.innerCircle}>
          <Text style={styles.percentageText}>{percentage}%</Text>
          <Text style={styles.scoreText}>
            {score} / {maxScore} Marks
          </Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <View style={[styles.iconShell, { backgroundColor: colors.accents.emerald.darkBg }]}>
            <AppIcon color={colors.status.success} name="checkmark-circle-outline" size={16} />
          </View>
          <Text style={styles.metricValue}>{correctCount}</Text>
          <Text style={styles.metricLabel}>Correct</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <View style={[styles.iconShell, { backgroundColor: "#3B1818" }]}>
            <AppIcon color={colors.status.error} name="close-circle-outline" size={16} />
          </View>
          <Text style={styles.metricValue}>{incorrectCount}</Text>
          <Text style={styles.metricLabel}>Incorrect</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <View style={[styles.iconShell, { backgroundColor: themeColors.surfaceSecondary }]}>
            <AppIcon color={themeColors.textMuted} name="help-circle-outline" size={16} />
          </View>
          <Text style={styles.metricValue}>{skippedCount}</Text>
          <Text style={styles.metricLabel}>Unanswered</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <View style={[styles.iconShell, { backgroundColor: colors.accents.blue.darkBg }]}>
            <AppIcon color={colors.accents.blue.darkText} name="time-outline" size={16} />
          </View>
          <Text style={styles.metricValue}>{timeTakenFormatted}</Text>
          <Text style={styles.metricLabel}>Time Taken</Text>
        </View>
      </View>
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
    alignItems: "center",
    ...shadows.md,
    gap: spacing.md,
  },
  circleShell: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: themeColors.surfaceHighlighted,
    borderWidth: 4,
    borderColor: colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  innerCircle: {
    alignItems: "center",
    gap: 2,
  },
  percentageText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.heavy,
    color: colors.primary.light,
  },
  scoreText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textSecondary,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  iconShell: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: themeColors.border,
  },
  metricValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  metricLabel: {
    fontSize: typography.fontSize.xs - 2,
    color: themeColors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
});