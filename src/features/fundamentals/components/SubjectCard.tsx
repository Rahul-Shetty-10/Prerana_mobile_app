import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SubjectCardProps } from "../types";
import { Badge, Chip } from "../../../shared/components";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function SubjectCard({
  subject,
  onPress,
}: SubjectCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const accentColors = colors.accents[subject.colorVariant || "coral"] || colors.accents.coral;

  return (
    <Pressable
      accessibilityLabel={`Open ${subject.title}`}
      accessibilityRole="button"
      onPress={() => onPress?.(subject)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {/* Top Header Row: Icon Shell + Preview Badge + Chevron Indicator */}
      <View style={styles.headerRow}>
        <View style={styles.leftHeaderBlock}>
          <View
            style={[
              styles.iconShell,
              {
                backgroundColor: accentColors.darkBg,
                borderColor: accentColors.darkBorder,
              },
            ]}
          >
            <AppIcon color={accentColors.darkText} name={subject.iconName} size={22} />
          </View>
          <Badge label={subject.previewBadgeText} variant="dark" />
        </View>

        <View style={styles.chevronShell}>
          <AppIcon color={themeColors.textMuted} name="chevron-forward-outline" size={18} />
        </View>
      </View>

      {/* Main Content: Title & Short Description */}
      <View style={styles.contentBlock}>
        <Text style={styles.title}>{subject.title}</Text>
        <Text numberOfLines={2} style={styles.description}>
          {subject.description}
        </Text>
      </View>

      {/* Footer Meta Chips: Track count & Question count */}
      <View style={styles.footerChipsRow}>
        <Chip iconName="git-branch-outline" label={`${subject.trackCount} Tracks`} />
        <Chip iconName="help-circle-outline" label={`${subject.questionCount} Questions`} />
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
    marginBottom: spacing.sm + 2,
    ...shadows.sm,
    gap: spacing.xs + 2,
  },
  pressed: {
    opacity: 0.82,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftHeaderBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  iconShell: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronShell: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  contentBlock: {
    gap: 4,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: themeColors.textSecondary,
    lineHeight: typography.lineHeight.sm + 4,
  },
  footerChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
  },
});