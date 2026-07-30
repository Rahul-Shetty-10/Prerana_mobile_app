import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ExerciseHeaderProps } from "../types";
import { Badge } from "../../../shared/components";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../shared/theme";

export function ExerciseHeader({
  subjectName,
  trackName,
  trackType,
  title,
  currentQuestionIndex,
  totalQuestions,
  onBackPress,
}: ExerciseHeaderProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const progressPercent =
    totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Top Row: Back Button + Subject Name + Track Badge */}
      <View style={styles.topRow}>
        <Pressable
          accessibilityLabel="Back to Fundamentals"
          accessibilityRole="button"
          onPress={onBackPress}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <AppIcon color={themeColors.textPrimary} name="arrow-back-outline" size={20} />
        </Pressable>

        <View style={styles.subjectBlock}>
          <Text style={styles.subjectText}>{subjectName}</Text>
          <Badge label={trackName} variant="primary" />
        </View>
      </View>

      {/* Title */}
      <Text numberOfLines={2} style={styles.title}>
        {title}
      </Text>

      {/* Progress Track */}
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1}/{totalQuestions} ({progressPercent}%)
        </Text>
      </View>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.xs,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  subjectBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  subjectText: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textMuted,
    fontWeight: typography.fontWeight.bold,
    textTransform: "uppercase",
  },
  title: {
    fontSize: typography.fontSize.md + 1,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    lineHeight: typography.lineHeight.md + 2,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 2,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: themeColors.surfaceSecondary,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: colors.primary.main,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.light,
  },
});