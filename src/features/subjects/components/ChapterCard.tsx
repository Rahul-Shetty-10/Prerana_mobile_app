import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChapterCardProps } from "../types";
import { Badge } from "../../../shared/components";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function ChapterCard({
  chapter,
  onPress,
}: ChapterCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <Pressable
      accessibilityLabel={`Open ${chapter.number ? `Chapter ${chapter.number}: ` : "chapter "}${chapter.title}`}
      accessibilityRole="button"
      onPress={() => onPress?.(chapter)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {/* Top Badges Row */}
      <View style={styles.topHeaderRow}>
        <View style={styles.badgesRow}>
          {chapter.number ? <Badge label={`CHAPTER ${chapter.number}`} variant="primary" /> : null}
          {chapter.partNumber ? <Badge label={`PART ${chapter.partNumber}`} variant="secondary" /> : null}
        </View>
        <AppIcon color={themeColors.textMuted} name="chevron-forward-outline" size={18} />
      </View>

      {/* Chapter Title & Subtitle */}
      <View style={styles.contentBlock}>
        <Text style={styles.titleText}>{chapter.title}</Text>
        <Text style={styles.subtitleText}>{chapter.subtitle}</Text>
      </View>
    </Pressable>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
    gap: spacing.xs + 2,
  },
  pressed: {
    opacity: 0.82,
  },
  topHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgesRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  contentBlock: {
    gap: 2,
  },
  titleText: {
    fontSize: typography.fontSize.md + 1,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  subtitleText: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
});
