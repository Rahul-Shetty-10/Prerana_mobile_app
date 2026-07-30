import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { QuickActionsCardProps } from "../types";
import { AppIcon, IconName } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function QuickActionsCard({
  onStartFirstChapter,
  onOpenFundamentals,
  onViewQuizzes,
}: QuickActionsCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const actions: { label: string; iconName: IconName; onPress?: () => void }[] = [
    {
      label: "Start First Chapter",
      iconName: "play-circle-outline",
      onPress: onStartFirstChapter,
    },
    {
      label: "Open Fundamentals",
      iconName: "book-outline",
      onPress: onOpenFundamentals,
    },
    {
      label: "View Quizzes",
      iconName: "help-circle-outline",
      onPress: onViewQuizzes,
    },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.headerTitle}>Quick Actions</Text>

      <View style={styles.actionsList}>
        {actions.map((act, idx) => (
          <Pressable
            key={idx}
            accessibilityRole="button"
            onPress={act.onPress}
            style={({ pressed }) => [styles.actionRow, pressed && act.onPress && styles.pressed]}
          >
            <View style={styles.iconShell}>
              <AppIcon color={colors.primary.light} name={act.iconName} size={18} />
            </View>

            <Text style={styles.actionLabel}>{act.label}</Text>

            <AppIcon color={themeColors.textMuted} name="chevron-forward-outline" size={16} />
          </Pressable>
        ))}
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
  headerTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  actionsList: {
    gap: spacing.xs,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs + 2,
  },
  pressed: {
    opacity: 0.8,
  },
  iconShell: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
  },
});