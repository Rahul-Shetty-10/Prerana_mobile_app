import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { FocusNowProps } from "../types";
import { Badge, Button } from "../../../shared/components";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
export function FocusNowSection({
  nextChapter = {
    subjectName: "Physics",
    chapterTitle: "Chapter 4: Thermodynamics & Heat Transfer",
    progressPercentage: 68,
    estimatedMinutes: 25,
  },
  libraryStatus = {
    savedResourcesCount: 14,
    activeLabsCount: 3,
  },
  onStartChapter,
  onOpenLibrary,
}: FocusNowProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);


  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Focus Now</Text>

      {/* 1. Next Chapter Ready Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Badge label={nextChapter.subjectName} variant="primary" />
          <View style={styles.timeTag}>
            <AppIcon color={themeColors.textMuted} name="time-outline" size={13} />
            <Text style={styles.timeText}>{nextChapter.estimatedMinutes} mins left</Text>
          </View>
        </View>

        <Text style={styles.chapterTitle}>{nextChapter.chapterTitle}</Text>

        {/* Progress Bar Component */}
        <View style={styles.progressBlock}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Completion Progress</Text>
            <Text style={styles.progressValue}>{nextChapter.progressPercentage}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, Math.max(0, nextChapter.progressPercentage))}%` },
              ]}
            />
          </View>
        </View>

        <Button
          iconName="play-circle-outline"
          onPress={onStartChapter}
          style={styles.actionButton}
          title="Start Chapter"
          variant="primary"
        />
      </View>

      {/* 2. Library Status Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Badge label="STUDY LAB & LIBRARY" variant="accent" />
        </View>

        <Text style={styles.libraryTitle}>Saved Resources & Active Simulations</Text>
        <Text style={styles.libraryDescription}>
          {libraryStatus.savedResourcesCount} Revision sheets saved • {libraryStatus.activeLabsCount} Interactive labs ready
        </Text>

        <Button
          iconName="library-outline"
          onPress={onOpenLibrary}
          style={styles.actionButton}
          title="Open Library"
          variant="secondary"
        />
      </View>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
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
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs + 2,
  },
  timeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
  chapterTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeight.lg,
  },
  progressBlock: {
    marginBottom: spacing.md,
    gap: spacing.xxs + 2,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  progressValue: {
    fontSize: typography.fontSize.xs,
    color: isDark ? colors.primary.light : colors.primary.main,
    fontWeight: typography.fontWeight.bold,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: themeColors.surfaceSecondary,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: colors.primary.main,
  },
  libraryTitle: {
    fontSize: typography.fontSize.md + 1,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
    marginBottom: 4,
  },
  libraryDescription: {
    fontSize: typography.fontSize.sm,
    color: themeColors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: typography.lineHeight.sm + 4,
  },
  actionButton: {
    width: "100%",
  },
});