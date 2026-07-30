import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { StatusCardProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { Badge, Button } from "../../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function StatusCard({
  section,
  onOpenNextQuiz,
  onViewHistory,
  onOpenAvailableQuiz,
  onOpenMySubjects,
  buttons = [],
}: StatusCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const hasItems = section.items && section.items.length > 0;

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{section.title}</Text>
        {section.badgeText ? <Badge label={section.badgeText} variant="dark" /> : null}
      </View>

      {/* Description if present */}
      {section.description ? (
        <Text style={styles.description}>{section.description}</Text>
      ) : null}

      {/* Empty State Container */}
      {!hasItems ? (
        <View style={styles.emptyStateBox}>
          <View style={styles.iconShell}>
            <AppIcon color={themeColors.textMuted} name="document-text-outline" size={24} />
          </View>
          <Text style={styles.emptyText}>{section.emptyStateText}</Text>
        </View>
      ) : null}

      {/* Action Buttons Row */}
      <View style={styles.buttonRow}>
        {buttons.includes("openNextQuiz") && onOpenNextQuiz ? (
          <Button
            iconName="play-outline"
            onPress={onOpenNextQuiz}
            style={styles.flexButton}
            title="Open Next Quiz"
            variant="primary"
          />
        ) : null}

        {buttons.includes("openAvailableQuiz") && (onOpenAvailableQuiz || onOpenNextQuiz) ? (
          <Button
            iconName="play-outline"
            onPress={onOpenAvailableQuiz || onOpenNextQuiz}
            style={styles.flexButton}
            title="Open Available Quiz"
            variant="primary"
          />
        ) : null}

        {buttons.includes("viewHistory") && onViewHistory ? (
          <Button
            iconName="time-outline"
            onPress={onViewHistory}
            style={styles.flexButton}
            title="View History"
            variant="secondary"
          />
        ) : null}

        {buttons.includes("openMySubjects") && onOpenMySubjects ? (
          <Button
            iconName="grid-outline"
            onPress={onOpenMySubjects}
            style={styles.flexButton}
            title="Open My Subjects"
            variant="outline"
          />
        ) : null}
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
    padding: spacing.md + 2,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  title: {
    fontSize: typography.fontSize.md + 1,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    flexShrink: 1,
  },
  description: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptyStateBox: {
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  iconShell: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: themeColors.surfaceHighlighted,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textMuted,
    textAlign: "center",
    lineHeight: typography.lineHeight.sm + 2,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.xs + 2,
  },
  flexButton: {
    flex: 1,
  },
});