import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { QuickActionCardProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { Button } from "../../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function QuickActionCard({
  action,
  onPress,
}: QuickActionCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.cardContainer}>
      {/* Icon & Title Row */}
      <View style={styles.headerRow}>
        <View style={styles.iconShell}>
          <AppIcon color={colors.primary.main} name={action.iconName} size={20} />
        </View>
        <Text style={styles.title}>{action.title}</Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>{action.description}</Text>

      {/* Button */}
      <Button
        iconName="arrow-forward-outline"
        onPress={() => onPress(action.actionType)}
        style={styles.button}
        title={action.buttonText}
        variant="secondary"
      />
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  cardContainer: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.md + 2,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  iconShell: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    flex: 1,
  },
  description: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textSecondary,
    lineHeight: typography.lineHeight.sm + 4,
    marginBottom: spacing.md,
  },
  button: {
    width: "100%",
  },
});