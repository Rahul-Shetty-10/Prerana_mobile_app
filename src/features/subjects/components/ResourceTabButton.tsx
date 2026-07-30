import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ResourceTabButtonProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../shared/theme";
export function ResourceTabButton({
  tab,
  isActive,
  onPress,
}: ResourceTabButtonProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const iconColor = isActive
    ? (isDark ? colors.primary.light : colors.primary.main)
    : themeColors.textMuted;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      onPress={() => onPress(tab.id)}
      style={({ pressed }) => [
        styles.tabButton,
        isActive ? styles.activeTabButton : styles.inactiveTabButton,
        pressed && styles.pressedScale,
      ]}
    >
      <View style={styles.iconShell}>
        <AppIcon
          color={iconColor}
          name={tab.iconName}
          size={16}
        />
      </View>

      <Text style={[styles.tabLabel, isActive ? styles.activeTabLabel : styles.inactiveTabLabel]}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: spacing.xs, // 6
    paddingHorizontal: spacing.xs + 2, // 8
    borderRadius: radius.md,
    borderWidth: 1.5,
    gap: spacing.xs - 2, // 4
    minHeight: 32,
  },
  inactiveTabButton: {
    backgroundColor: themeColors.surfaceSecondary,
    borderColor: themeColors.border,
  },
  activeTabButton: {
    backgroundColor: themeColors.surfaceHighlighted,
    borderColor: isDark ? colors.primary.light : colors.primary.main,
  },
  pressedScale: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  iconShell: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.heavy,
  },
  inactiveTabLabel: {
    color: themeColors.textSecondary,
  },
  activeTabLabel: {
    color: isDark ? colors.primary.light : colors.primary.main,
  },
});