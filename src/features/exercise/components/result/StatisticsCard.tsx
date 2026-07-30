import React from "react";
import { useTheme } from "../../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { StatisticsCardProps } from "../../types";
import { colors, radius, shadows, spacing, typography } from "../../../../shared/theme";

export function StatisticsCard({
  totalQuestions,
  attemptedCount,
  correctCount,
  incorrectCount,
  skippedCount,
  completionPercent,
}: StatisticsCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const statsList = [
    { label: "Total Questions", value: `${totalQuestions}` },
    { label: "Attempted", value: `${attemptedCount}` },
    { label: "Correct Answers", value: `${correctCount}`, color: colors.status.success },
    { label: "Incorrect Answers", value: `${incorrectCount}`, color: colors.status.error },
    { label: "Skipped / Unanswered", value: `${skippedCount}`, color: themeColors.textMuted },
    { label: "Completion Rate", value: `${completionPercent}%`, color: colors.primary.light },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.headerTitle}>Detailed Statistics</Text>

      <View style={styles.grid}>
        {statsList.map((stat, idx) => (
          <View key={idx} style={styles.statBox}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={[styles.statValue, stat.color ? { color: stat.color } : null]}>
              {stat.value}
            </Text>
          </View>
        ))}
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
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    ...shadows.sm,
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs + 2,
  },
  statBox: {
    width: "48%",
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: themeColors.border,
    gap: 2,
  },
  statLabel: {
    fontSize: typography.fontSize.xs - 1,
    color: themeColors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
  statValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
});