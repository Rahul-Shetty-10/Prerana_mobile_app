import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { QuickRouteItem, ResumeQuicklyProps } from "../types";
import { Badge } from "../../../shared/components";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
export function ResumeQuicklySection({ routes = [] }: ResumeQuicklyProps) {
  const { theme  } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);

  if (!routes || routes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Resume Quickly</Text>

      <View style={styles.grid}>
        {routes.map((route) => (
          <QuickActionCard key={route.id} route={route} />
        ))}
      </View>
    </View>
  );
}

function QuickActionCard({ route }: { route: QuickRouteItem }) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);
  const accentColors = colors.accents[route.variant || "coral"] || colors.accents.coral;

  const iconShellBg = isDark ? accentColors.darkBg : accentColors.bg;
  const iconShellBorder = isDark ? accentColors.darkBorder : accentColors.border;
  const accentText = isDark ? accentColors.darkText : accentColors.text;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={route.onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && route.onPress && styles.pressed,
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconShell,
            {
              backgroundColor: iconShellBg,
              borderColor: iconShellBorder,
            },
          ]}
        >
          <AppIcon color={accentText} name={route.icon} size={20} />
        </View>

        {route.badgeText ? (
          <Badge label={route.badgeText} variant="dark" />
        ) : null}
      </View>

      <View style={styles.contentBlock}>
        <Text numberOfLines={1} style={styles.title}>
          {route.title}
        </Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {route.subtitle}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <Text style={[styles.actionText, { color: accentText }]}>Open Section</Text>
        <AppIcon color={accentText} name="chevron-forward-outline" size={16} />
      </View>
    </Pressable>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  sectionHeader: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  grid: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.md,
    ...shadows.sm,
    gap: spacing.xs + 2,
  },
  pressed: {
    opacity: 0.82,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconShell: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contentBlock: {
    gap: 2,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  subtitle: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textSecondary,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  actionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});