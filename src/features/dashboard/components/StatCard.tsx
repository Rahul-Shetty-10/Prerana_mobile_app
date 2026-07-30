import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatCardProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
export function StatCard({
  title,
  value,
  icon,
  variant = "coral",
  changeText,
  changeType = "positive",
  onPress,
}: StatCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);


  const variantColors = colors.accents[variant] || colors.accents.coral;
  const isPositive = changeType === "positive";
  const isNegative = changeType === "negative";

  // Use correct variant accent background for icon depending on theme
  const iconShellBg = isDark ? variantColors.darkBg : variantColors.bg;
  const iconShellBorder = isDark ? variantColors.darkBorder : variantColors.border;
  const iconShellColor = isDark ? variantColors.darkText : variantColors.text;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}
    >
      <View style={styles.headerRow}>
        {/* Icon Shell */}
        <View
          style={[
            styles.iconShell,
            {
              backgroundColor: iconShellBg,
              borderColor: iconShellBorder,
            },
          ]}
        >
          <AppIcon color={iconShellColor} name={icon} size={20} />
        </View>

        {/* Change Indicator Badge */}
        {changeText ? (
          <View
            style={[
              styles.changeBadge,
              isPositive ? styles.positiveBadge : isNegative ? styles.negativeBadge : styles.neutralBadge,
            ]}
          >
            <AppIcon
              color={
                isPositive
                  ? colors.status.success
                  : isNegative
                  ? colors.status.error
                  : themeColors.textMuted
              }
              name={
                isPositive
                  ? "trending-up-outline"
                  : isNegative
                  ? "trending-down-outline"
                  : "remove-outline"
              }
              size={12}
            />
            <Text
              style={[
                styles.changeBadgeText,
                isPositive ? styles.positiveText : isNegative ? styles.negativeText : styles.neutralText,
              ]}
            >
              {changeText}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Main Metric Value & Title */}
      <View style={styles.contentBlock}>
        <Text style={styles.valueText}>{value}</Text>
        <Text numberOfLines={1} style={styles.titleText}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    backgroundColor: themeColors.surface,
    borderColor: themeColors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.md,
    ...shadows.sm,
  },
  pressed: {
    opacity: 0.82,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  iconShell: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    gap: 3,
  },
  positiveBadge: {
    backgroundColor: isDark ? colors.accents.emerald.darkBg : colors.accents.emerald.bg,
  },
  negativeBadge: {
    backgroundColor: isDark ? "#3B1818" : "#FEE2E2",
  },
  neutralBadge: {
    backgroundColor: themeColors.surfaceSecondary,
  },
  changeBadgeText: {
    fontSize: typography.fontSize.xs - 1,
    fontWeight: typography.fontWeight.bold,
  },
  positiveText: {
    color: colors.status.success,
  },
  negativeText: {
    color: colors.status.error,
  },
  neutralText: {
    color: themeColors.textMuted,
  },
  contentBlock: {
    gap: 2,
  },
  valueText: {
    fontSize: typography.fontSize.xxl - 2,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    letterSpacing: -0.5,
  },
  titleText: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.medium,
    color: themeColors.textSecondary,
  },
});