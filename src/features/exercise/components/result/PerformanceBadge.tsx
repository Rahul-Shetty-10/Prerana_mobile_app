import React from "react";
import { useTheme } from "../../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { PerformanceBadgeProps, PerformanceLevel } from "../../types";
import { Badge } from "../../../../shared/components";
import { AppIcon, IconName } from "../../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../../shared/theme";

const LEVEL_CONFIG: Record<
  PerformanceLevel,
  { label: string; iconName: IconName; variant: "coral" | "amber" | "blue" | "purple" }
> = {
  excellent: {
    label: "EXCELLENT",
    iconName: "trophy-outline",
    variant: "coral",
  },
  good: {
    label: "GOOD PERFORMANCE",
    iconName: "ribbon-outline",
    variant: "blue",
  },
  average: {
    label: "AVERAGE",
    iconName: "fitness-outline",
    variant: "amber",
  },
  needs_improvement: {
    label: "NEEDS IMPROVEMENT",
    iconName: "alert-circle-outline",
    variant: "purple",
  },
};

export function PerformanceBadge({
  performanceLevel,
  performanceMessage,
  accuracyPercent,
}: PerformanceBadgeProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const config = LEVEL_CONFIG[performanceLevel] || LEVEL_CONFIG.excellent;
  const accentColors = colors.accents[config.variant] || colors.accents.coral;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconShell,
            {
              backgroundColor: accentColors.darkBg,
              borderColor: accentColors.darkBorder,
            },
          ]}
        >
          <AppIcon color={accentColors.darkText} name={config.iconName} size={22} />
        </View>

        <Badge label={config.label} variant="primary" />
      </View>

      <Text style={styles.messageText}>{performanceMessage}</Text>

      <View style={styles.footerRow}>
        <Text style={styles.accuracyLabel}>Overall Accuracy</Text>
        <Text style={[styles.accuracyValue, { color: accentColors.darkText }]}>
          {accuracyPercent}%
        </Text>
      </View>
    </View>
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
    marginTop: spacing.sm,
    ...shadows.sm,
    gap: spacing.xs + 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconShell: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  messageText: {
    fontSize: typography.fontSize.sm + 1,
    color: themeColors.textSecondary,
    lineHeight: typography.lineHeight.md,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.md,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginTop: 2,
  },
  accuracyLabel: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textMuted,
    fontWeight: typography.fontWeight.bold,
  },
  accuracyValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
  },
});