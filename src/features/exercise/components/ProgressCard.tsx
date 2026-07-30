import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { ProgressCardProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function ProgressCard({
  currentQuestionIndex,
  totalQuestions,
  answeredCount,
  flaggedCount,
}: ProgressCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const percent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.statBox}>
        <AppIcon color={colors.primary.light} name="help-circle-outline" size={18} />
        <Text style={styles.statValue}>
          {currentQuestionIndex + 1}/{totalQuestions}
        </Text>
        <Text style={styles.statLabel}>Question</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statBox}>
        <AppIcon color={colors.status.success} name="checkmark-done-outline" size={18} />
        <Text style={styles.statValue}>
          {answeredCount}/{totalQuestions}
        </Text>
        <Text style={styles.statLabel}>Answered ({percent}%)</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statBox}>
        <AppIcon color={colors.status.warning} name="flag-outline" size={18} />
        <Text style={styles.statValue}>{flaggedCount}</Text>
        <Text style={styles.statLabel}>Flagged</Text>
      </View>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeColors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    ...shadows.sm,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: themeColors.border,
  },
  statValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs - 1,
    color: themeColors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
});