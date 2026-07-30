import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { LearningStatsCardProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function LearningStatsCard({
  stats,
}: LearningStatsCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.sectionTitle}>📈 Your Learning Statistics</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <AppIcon color={colors.status.success} name="analytics-outline" size={20} />
          <Text style={styles.statValue}>{stats.overallAccuracy}%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>

        <View style={styles.statBox}>
          <AppIcon color={colors.primary.main} name="checkbox-outline" size={20} />
          <Text style={styles.statValue}>{stats.questionsSolved}</Text>
          <Text style={styles.statLabel}>Solved</Text>
        </View>

        <View style={styles.statBox}>
          <AppIcon color={colors.secondary.main} name="time-outline" size={20} />
          <Text style={styles.statValue}>{stats.studyHours}h</Text>
          <Text style={styles.statLabel}>Study Hours</Text>
        </View>

        <View style={styles.statBox}>
          <AppIcon color={colors.accents.purple.text} name="book-outline" size={20} />
          <Text style={styles.statValue}>{stats.completedChapters}</Text>
          <Text style={styles.statLabel}>Chapters</Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  cardContainer: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    marginBottom: spacing.sm + 2,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: 2,
  },
  statValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    marginTop: 2,
  },
  statLabel: {
    fontSize: typography.fontSize.xs - 1,
    color: themeColors.textMuted,
    marginTop: 1,
  },
});