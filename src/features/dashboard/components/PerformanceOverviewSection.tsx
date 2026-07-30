import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { PerformanceOverviewProps } from "../types";
import { Badge } from "../../../shared/components";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
export function PerformanceOverviewSection({
  overallAccuracy = 84.5,
  masteryLevel = "Advanced",
  subjectsPerformance = [
    { subject: "Physics", scorePercentage: 88, questionsSolved: 420, colorVariant: "coral" },
    { subject: "Chemistry", scorePercentage: 82, questionsSolved: 380, colorVariant: "amber" },
    { subject: "Mathematics", scorePercentage: 79, questionsSolved: 290, colorVariant: "blue" },
    { subject: "Biology", scorePercentage: 91, questionsSolved: 150, colorVariant: "emerald" },
  ],
}: PerformanceOverviewProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);

  const isEmpty = !subjectsPerformance || subjectsPerformance.length === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Subject Performance Overview</Text>

      <View style={styles.card}>
        {/* Top Summary Banner */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Overall Accuracy</Text>
            <Text style={styles.summaryValue}>{overallAccuracy}%</Text>
          </View>
          <View style={styles.masteryBlock}>
            <Text style={styles.summaryLabel}>Topic Mastery</Text>
            <Badge label={masteryLevel} style={styles.masteryBadge} variant="secondary" />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Subject Performance Breakdown Bars */}
        {isEmpty ? (
          <View style={styles.emptyState}>
            <AppIcon color={themeColors.textMuted} name="bar-chart-outline" size={32} />
            <Text style={styles.emptyText}>No performance metrics recorded yet.</Text>
          </View>
        ) : (
          <View style={styles.subjectList}>
            {subjectsPerformance.map((item) => {
              const variant = item.colorVariant || "coral";
              const accentColor = isDark
                ? colors.accents[variant]?.darkText || colors.primary.light
                : colors.accents[variant]?.text || colors.primary.main;

              return (
                <View key={item.subject} style={styles.subjectItem}>
                  <View style={styles.subjectTitleRow}>
                    <Text style={styles.subjectName}>{item.subject}</Text>
                    <Text style={[styles.subjectScore, { color: accentColor }]}>
                      {item.scorePercentage}%
                    </Text>
                  </View>

                  {/* Native Bar Chart Progress Track */}
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${Math.min(100, Math.max(0, item.scorePercentage))}%`,
                          backgroundColor: accentColor,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.subjectSolvedText}>{item.questionsSolved} questions solved</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  sectionHeader: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.lg,
    ...shadows.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryBlock: {
    gap: 2,
  },
  masteryBlock: {
    alignItems: "flex-end",
    gap: 4,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
  summaryValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    letterSpacing: -0.5,
  },
  masteryBadge: {
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: themeColors.border,
    marginVertical: spacing.md,
  },
  subjectList: {
    gap: spacing.md,
  },
  subjectItem: {
    gap: 4,
  },
  subjectTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subjectName: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
  },
  subjectScore: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
  },
  barTrack: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: themeColors.surfaceSecondary,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  subjectSolvedText: {
    fontSize: typography.fontSize.xs - 1,
    color: themeColors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
  emptyState: {
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: themeColors.textMuted,
    textAlign: "center",
  },
});