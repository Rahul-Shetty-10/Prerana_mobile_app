import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { InformationCardProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { Button } from "../../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function InformationCard({
  type,
  scope,
  onOpenMySubjects,
}: InformationCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  if (type === "continueLearning") {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <View style={styles.iconShell}>
            <AppIcon color={colors.primary.main} name="book-outline" size={20} />
          </View>
          <Text style={styles.title}>Continue From Learning</Text>
        </View>

        <Text style={styles.description}>
          Return to subject selection or chapter workspace to study core notes, formula tracks, and visual guides before attempting quizzes.
        </Text>

        <Button
          iconName="grid-outline"
          onPress={onOpenMySubjects}
          style={styles.button}
          title="Open My Subjects"
          variant="primary"
        />
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.iconShell}>
          <AppIcon color={colors.accents.amber.text} name="options-outline" size={20} />
        </View>
        <Text style={styles.title}>Current Scope</Text>
      </View>

      <Text style={styles.description}>
        Your active enrollment parameters and assessment availability metrics.
      </Text>

      {scope ? (
        <View style={styles.scopeGrid}>
          <View style={styles.scopeRow}>
            <Text style={styles.scopeLabel}>Enrolled Grade</Text>
            <Text style={styles.scopeValue}>{scope.enrolledGrade}</Text>
          </View>
          <View style={styles.scopeRow}>
            <Text style={styles.scopeLabel}>Active Subjects</Text>
            <Text style={styles.scopeValue}>{scope.activeSubjectsCount}</Text>
          </View>
          <View style={styles.scopeRow}>
            <Text style={styles.scopeLabel}>Curriculum Chapters</Text>
            <Text style={styles.scopeValue}>{scope.curriculumChaptersCount}</Text>
          </View>
          <View style={styles.scopeRow}>
            <Text style={styles.scopeLabel}>Recorded Attempts</Text>
            <Text style={styles.scopeValue}>{scope.recordedAttemptsCount}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  cardContainer: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.md + 2,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  iconShell: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    flex: 1,
  },
  description: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textSecondary,
    lineHeight: typography.lineHeight.sm + 4,
    marginBottom: spacing.md,
  },
  button: {
    width: "100%",
  },
  scopeGrid: {
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    padding: spacing.sm + 2,
    gap: spacing.xs,
  },
  scopeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  scopeLabel: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textMuted,
  },
  scopeValue: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
  },
});