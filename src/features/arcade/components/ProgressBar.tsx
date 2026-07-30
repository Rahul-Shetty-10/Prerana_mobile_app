import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../../../shared/theme";

export interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
}

export function ProgressBar({
  progress,
  color = colors.primary.main,
}: ProgressBarProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const percentage = Math.min(100, Math.max(0, Math.round(progress * 100)));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: themeColors.surfaceSecondary,
    overflow: "hidden",
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
  },
});