import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { FeaturedResourceCardProps, ResourceBadgeLabel } from "../types";
import { AppIcon, IconName } from "../../../shared/icons";
import { Button } from "../../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

function getBadgeConfig(badge: ResourceBadgeLabel, themeColors: any): {
  icon: IconName;
  bg: string;
  border: string;
  text: string;
} {
  switch (badge) {
    case "Infographic":
      return {
        icon: "image-outline",
        bg: colors.accents.coral.darkBg,
        border: colors.accents.coral.darkBorder,
        text: colors.accents.coral.darkText,
      };
    case "Mindmap":
      return {
        icon: "git-network-outline",
        bg: colors.accents.purple.darkBg,
        border: colors.accents.purple.darkBorder,
        text: colors.accents.purple.darkText,
      };
    case "Slidedeck":
      return {
        icon: "easel-outline",
        bg: colors.accents.amber.darkBg,
        border: colors.accents.amber.darkBorder,
        text: colors.accents.amber.darkText,
      };
    case "Textbook":
      return {
        icon: "book-outline",
        bg: colors.accents.blue.darkBg,
        border: colors.accents.blue.darkBorder,
        text: colors.accents.blue.darkText,
      };
    case "Flashcards":
      return {
        icon: "card-outline",
        bg: colors.accents.emerald.darkBg,
        border: colors.accents.emerald.darkBorder,
        text: colors.accents.emerald.darkText,
      };
    case "Table":
      return {
        icon: "grid-outline",
        bg: themeColors.surfaceHighlighted,
        border: themeColors.border,
        text: colors.primary.light,
      };
    case "Audio":
      return {
        icon: "headset-outline",
        bg: colors.accents.coral.darkBg,
        border: colors.accents.coral.darkBorder,
        text: colors.accents.coral.darkText,
      };
    default:
      return {
        icon: "document-text-outline",
        bg: themeColors.surfaceHighlighted,
        border: themeColors.border,
        text: themeColors.textPrimary,
      };
  }
}

export function FeaturedResourceCard({
  resource,
  onOpenResource,
}: FeaturedResourceCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const badgeConfig = getBadgeConfig(resource.resourceBadge, themeColors);

  return (
    <View style={styles.cardContainer}>
      {/* Top Meta Header */}
      <View style={styles.topRow}>
        <View style={styles.subjectPill}>
          <Text style={styles.subjectPillText}>{resource.subjectName}</Text>
        </View>

        {/* Resource Type Badge */}
        <View
          style={[
            styles.badgePill,
            { backgroundColor: badgeConfig.bg, borderColor: badgeConfig.border },
          ]}
        >
          <AppIcon color={badgeConfig.text} name={badgeConfig.icon} size={12} />
          <Text style={[styles.badgeText, { color: badgeConfig.text }]}>
            {resource.resourceBadge}
          </Text>
        </View>
      </View>

      {/* Resource Title */}
      <Text style={styles.title}>{resource.title}</Text>

      {/* Chapter Subtitle Context */}
      <View style={styles.chapterRow}>
        <AppIcon color={themeColors.textMuted} name="bookmark-outline" size={14} />
        <Text numberOfLines={1} style={styles.chapterText}>
          {resource.chapterName}
        </Text>
      </View>

      {/* Action Button */}
      <Button
        iconName="arrow-forward-outline"
        onPress={() => onOpenResource(resource)}
        style={styles.actionButton}
        title="Open Chapter Shelf"
        variant="outline"
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs + 2,
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  subjectPill: {
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  subjectPillText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    fontSize: typography.fontSize.md + 1,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
    lineHeight: typography.lineHeight.md + 2,
    marginBottom: spacing.xs,
  },
  chapterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs - 2,
    marginBottom: spacing.md,
  },
  chapterText: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textMuted,
    flex: 1,
  },
  actionButton: {
    width: "100%",
  },
});