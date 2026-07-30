import React from "react";
import { useTheme } from "../theme/ThemeContext";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "../theme/theme";
export interface BadgeProps {
  label: string;
  variant?: "primary" | "secondary" | "accent" | "dark";
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
}

export function Badge({ label, variant = "primary", style, textStyle }: BadgeProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={[styles.badge, styles[variant], style]}>
      <Text style={[styles.label, styles[`${variant}Text`], textStyle]}>{label}</Text>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => {
  const coral = colors.accents.coral;
  const amber = colors.accents.amber;
  const blue = colors.accents.blue;

  return StyleSheet.create({
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs + 2,
      borderRadius: radius.full,
      alignSelf: "flex-start",
    },
    label: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.heavy,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    primary: {
      backgroundColor: isDark ? coral.darkBg : coral.bg,
      borderWidth: 1,
      borderColor: isDark ? coral.darkBorder : coral.border,
    },
    primaryText: {
      color: isDark ? coral.darkText : coral.text,
    },
    secondary: {
      backgroundColor: isDark ? amber.darkBg : amber.bg,
      borderWidth: 1,
      borderColor: isDark ? amber.darkBorder : amber.border,
    },
    secondaryText: {
      color: isDark ? amber.darkText : amber.text,
    },
    accent: {
      backgroundColor: isDark ? blue.darkBg : blue.bg,
      borderWidth: 1,
      borderColor: isDark ? blue.darkBorder : blue.border,
    },
    accentText: {
      color: isDark ? blue.darkText : blue.text,
    },
    dark: {
      backgroundColor: isDark ? themeColors.badgeBackground : colors.light.badgeBackground,
      borderWidth: 1,
      borderColor: isDark ? themeColors.border : colors.light.border,
    },
    darkText: {
      color: isDark ? themeColors.badgeText : colors.light.badgeText,
    },
  });
};