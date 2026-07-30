import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { SubjectStatisticsCardProps } from "../types";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function SubjectStatisticsCard({
  completedChapters,
  totalChapters,
}: SubjectStatisticsCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.card}>
      <Text style={styles.headerTitle}>Subject Statistics</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {completedChapters} / {totalChapters}
          </Text>
          <Text style={styles.statLabel}>Chapters Completed</Text>
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
  statsGrid: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: colors.primary.light,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
});