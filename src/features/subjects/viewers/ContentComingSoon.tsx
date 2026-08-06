import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { colors, radius, spacing, typography } from "../../../shared/theme";
import { AppIcon } from "../../../shared/icons";
import { IconName } from "../../../shared/icons";

interface ContentComingSoonProps {
  icon?: IconName;
  title?: string;
  message?: string;
}

export function ContentComingSoon({
  icon = "time-outline",
  title = "Content Coming Soon",
  message = "This content hasn't been uploaded yet. Check back soon!",
}: ContentComingSoonProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.card, {
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
        shadowColor: isDark ? "#000" : "#aaa",
      }]}>
        <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
          <AppIcon name={icon} size={40} color={colors.primary.main} />
        </View>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>{title}</Text>
        <Text style={[styles.message, { color: themeColors.textMuted }]}>{message}</Text>
        <View style={[styles.pill, { backgroundColor: colors.primary.main + "18" }]}>
          <AppIcon name="construct-outline" size={13} color={colors.primary.main} />
          <Text style={[styles.pillText, { color: colors.primary.main }]}>Being prepared by our team</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    gap: spacing.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    textAlign: "center" as const,
  },
  message: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    textAlign: "center" as const,
  },
  pill: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    marginTop: spacing.xs,
  },
  pillText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
});
