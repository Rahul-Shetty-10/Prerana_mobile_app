import React from "react";
import { useTheme } from "../theme/ThemeContext";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { AppIcon, IconName } from "../icons";
import { colors, radius, spacing, typography } from "../theme";
export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  iconName?: IconName;
  style?: ViewStyle | ViewStyle[];
}

export function Chip({ label, selected = false, onPress, iconName, style }: ChipProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);
  const iconColor = selected
    ? (isDark ? colors.primary.light : colors.primary.main)
    : themeColors.textSecondary;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selectedChip : styles.unselectedChip,
        pressed && styles.pressed,
        style as any,
      ]}
    >
      {iconName ? (
        <AppIcon color={iconColor} name={iconName} size={14} style={styles.icon} />
      ) : null}
      <Text style={[styles.text, selected ? styles.selectedText : styles.unselectedText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginRight: spacing.xs + 2,
    marginBottom: spacing.xs + 2,
    minHeight: 40,
  },
  unselectedChip: {
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: themeColors.border,
  },
  selectedChip: {
    backgroundColor: themeColors.surfaceHighlighted,
    borderWidth: 1.5,
    borderColor: isDark ? colors.primary.light : colors.primary.main,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  unselectedText: {
    color: themeColors.textSecondary,
  },
  selectedText: {
    color: isDark ? colors.primary.light : colors.primary.main,
  },
});