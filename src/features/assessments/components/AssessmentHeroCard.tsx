import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { AssessmentHeroCardProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { Badge, Button } from "../../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function AssessmentHeroCard({
  title,
  subtitle,
  stats,
  onOpenNextQuiz,
  onViewHistory,
  onOpenAvailableQuiz,
  variant = "quizzes",
}: AssessmentHeroCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.heroCard}>
      {/* Badge Row */}
      <View style={styles.badgeRow}>
        <Badge label="ASSESSMENTS WORKSPACE" variant="primary" />
        <Badge label="SMARTGURU VERIFIED" variant="secondary" />
      </View>

      {/* Main Title & Subtitle */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {/* Statistics Chips Row */}
      <View style={styles.statsGrid}>
        <View style={styles.statTile}>
          <Text style={styles.statNumber}>{stats.activeSubjects}</Text>
          <Text style={styles.statLabel}>Active Subjects</Text>
        </View>

        {stats.nextAvailableChapter ? (
          <View style={styles.statTile}>
            <Text style={styles.statHighlight}>{stats.nextAvailableChapter}</Text>
            <Text style={styles.statLabel}>Next Chapter</Text>
          </View>
        ) : null}

        {stats.quizReadyChapters !== undefined ? (
          <View style={styles.statTile}>
            <Text style={styles.statNumber}>{stats.quizReadyChapters}</Text>
            <Text style={styles.statLabel}>Ready Chapters</Text>
          </View>
        ) : null}

        {stats.chapterQuizEntries !== undefined ? (
          <View style={styles.statTile}>
            <Text style={styles.statNumber}>{stats.chapterQuizEntries}</Text>
            <Text style={styles.statLabel}>Quiz Entries</Text>
          </View>
        ) : null}

        <View style={styles.statTile}>
          <Text style={styles.statNumber}>{stats.recordedAttempts}</Text>
          <Text style={styles.statLabel}>Attempts</Text>
        </View>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionRow}>
        {variant === "quizzes" ? (
          <>
            <Button
              iconName="play-outline"
              onPress={onOpenNextQuiz}
              style={styles.flexButton}
              title="Open Next Quiz"
              variant="primary"
            />
            {onViewHistory ? (
              <Button
                iconName="time-outline"
                onPress={onViewHistory}
                style={styles.flexButton}
                title="View History"
                variant="secondary"
              />
            ) : null}
          </>
        ) : (
          <Button
            iconName="play-outline"
            onPress={onOpenAvailableQuiz || onOpenNextQuiz}
            style={styles.fullButton}
            title="Open Available Quiz"
            variant="primary"
          />
        )}
      </View>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  heroCard: {
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
  badgeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.xs,
    flexWrap: "wrap",
  },
  title: {
    fontSize: typography.fontSize.xxl - 2,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm + 1,
    color: themeColors.textSecondary,
    lineHeight: typography.lineHeight.md,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  statTile: {
    flex: 1,
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xxs,
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  statHighlight: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    color: colors.primary.light,
  },
  statLabel: {
    fontSize: typography.fontSize.xs - 2,
    fontWeight: typography.fontWeight.medium,
    color: themeColors.textMuted,
    textAlign: "center",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.xs + 2,
  },
  flexButton: {
    flex: 1,
  },
  fullButton: {
    width: "100%",
  },
});