import React from "react";
import { useTheme } from "../../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { ReviewSummaryCardProps } from "../../types";
import { colors, radius, shadows, spacing, typography } from "../../../../shared/theme";

export function ReviewSummaryCard({
  totalQuestions,
  correctCount,
  incorrectCount,
  skippedCount,
  accuracyPercent,
}: ReviewSummaryCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.card}>
      <Text style={styles.headerTitle}>Review Overview</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.valueText}>{totalQuestions}</Text>
          <Text style={styles.labelText}>Total Qs</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricBox}>
          <Text style={[styles.valueText, { color: colors.status.success }]}>{correctCount}</Text>
          <Text style={styles.labelText}>Correct</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricBox}>
          <Text style={[styles.valueText, { color: colors.status.error }]}>{incorrectCount}</Text>
          <Text style={styles.labelText}>Incorrect</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricBox}>
          <Text style={[styles.valueText, { color: themeColors.textMuted }]}>{skippedCount}</Text>
          <Text style={styles.labelText}>Skipped</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricBox}>
          <Text style={[styles.valueText, { color: colors.primary.light }]}>{accuracyPercent}%</Text>
          <Text style={styles.labelText}>Accuracy</Text>
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
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    ...shadows.sm,
    gap: spacing.xs + 2,
  },
  headerTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  metricBox: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: themeColors.border,
  },
  valueText: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  labelText: {
    fontSize: typography.fontSize.xs - 2,
    color: themeColors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
});