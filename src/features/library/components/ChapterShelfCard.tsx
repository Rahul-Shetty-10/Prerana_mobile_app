import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { ChapterShelfCardProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { Badge, Button } from "../../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function ChapterShelfCard({
  shelf,
  onOpenChapterShelf,
}: ChapterShelfCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.cardContainer}>
      {/* Subject & Chapter Meta Badges */}
      <View style={styles.badgeRow}>
        <Badge label={shelf.subjectName} variant="accent" />
        <Badge label={shelf.chapterType} variant="dark" />
      </View>

      {/* Chapter Title */}
      <Text style={styles.chapterTitle}>{shelf.chapterName}</Text>

      {/* Approved Resources Count Row */}
      <View style={styles.infoRow}>
        <AppIcon color={colors.primary.main} name="checkmark-circle-outline" size={16} />
        <Text style={styles.infoText}>
          {shelf.approvedResourceCount} Approved Resources
        </Text>
      </View>

      {/* Resource Type Pills */}
      <View style={styles.typesRow}>
        {shelf.resourceTypes.map((type) => (
          <View key={type} style={styles.typePill}>
            <Text style={styles.typePillText}>{type}</Text>
          </View>
        ))}
      </View>

      {/* Action Button */}
      <Button
        iconName="folder-open-outline"
        onPress={() => onOpenChapterShelf(shelf)}
        style={styles.actionButton}
        title="Open Chapter Shelf"
        variant="secondary"
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
  badgeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.xs,
    flexWrap: "wrap",
  },
  chapterTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    lineHeight: typography.lineHeight.lg,
    marginBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm + 2,
  },
  infoText: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.semibold,
    color: themeColors.textSecondary,
  },
  typesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xxs + 4,
    marginBottom: spacing.md,
  },
  typePill: {
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 3,
  },
  typePillText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: themeColors.textSecondary,
    textTransform: "capitalize",
  },
  actionButton: {
    width: "100%",
  },
});