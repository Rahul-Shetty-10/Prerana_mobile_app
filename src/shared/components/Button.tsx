import React from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, TextStyle, ViewStyle } from "react-native";
import { AppIcon, IconName } from "../icons";
import { colors, radius, shadows, spacing, typography } from "../theme";
export interface ButtonProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  onPress?: () => void;
  iconName?: IconName;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
}

export function Button({
  title,
  variant = "primary",
  onPress,
  iconName,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);


  const iconColor =
    variant === "primary"
      ? colors.primary.contrastText
      : variant === "ghost" || variant === "outline"
      ? themeColors.textSecondary
      : themeColors.textPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressedScale,
        style as any,
      ]}
    >
      <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>{title}</Text>
      {iconName ? <AppIcon color={iconColor} name={iconName} size={16} style={styles.icon} /> : null}
    </Pressable>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  button: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
  },
  primary: {
    backgroundColor: colors.primary.main,
    ...shadows.sm,
  },
  secondary: {
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.border,
    ...shadows.sm,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: themeColors.border,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  disabled: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  pressedScale: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  text: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.heavy,
  },
  primaryText: {
    color: colors.primary.contrastText,
  },
  secondaryText: {
    color: themeColors.textPrimary,
  },
  outlineText: {
    color: themeColors.textPrimary,
  },
  ghostText: {
    color: themeColors.textSecondary,
  },
  icon: {
    marginLeft: spacing.xs,
  },
});