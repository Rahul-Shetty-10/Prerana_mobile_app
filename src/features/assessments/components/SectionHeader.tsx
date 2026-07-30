import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { SectionHeaderProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, spacing, typography } from "../../../shared/theme";

export function SectionHeader({
  title,
  subtitle,
  iconName = "bookmark-outline",
  iconColor = colors.primary.main,
}: SectionHeaderProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <AppIcon color={iconColor} name={iconName} size={20} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 2,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  subtitle: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textSecondary,
  },
});