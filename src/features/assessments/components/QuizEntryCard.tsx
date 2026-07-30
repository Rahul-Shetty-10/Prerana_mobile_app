import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { QuizEntryCardProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { Badge, Button } from "../../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function QuizEntryCard({
  entry,
  onOpenQuiz,
}: QuizEntryCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.cardContainer}>
      {/* Subject Badge & Chapter Tag */}
      <View style={styles.topRow}>
        <Badge label={entry.subjectName} variant="accent" />
        <Badge label={`Chapter ${entry.chapterNumber}`} variant="dark" />
      </View>

      {/* Chapter Name */}
      <Text style={styles.chapterTitle}>{entry.chapterName}</Text>

      {/* Subtitle / Details */}
      {entry.subtitle ? (
        <View style={styles.infoRow}>
          <AppIcon color={colors.primary.main} name="help-circle-outline" size={14} />
          <Text style={styles.infoText}>{entry.subtitle}</Text>
        </View>
      ) : null}

      {/* Action Button */}
      <Button
        iconName="play-outline"
        onPress={() => onOpenQuiz(entry)}
        style={styles.actionButton}
        title="Open Quiz"
        variant="primary"
      />
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  cardContainer: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  topRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.xs,
    flexWrap: "wrap",
  },
  chapterTitle: {
    fontSize: typography.fontSize.lg - 1,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    lineHeight: typography.lineHeight.md + 4,
    marginBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs - 2,
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textSecondary,
    flex: 1,
  },
  actionButton: {
    width: "100%",
  },
});