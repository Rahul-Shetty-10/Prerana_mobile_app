import React from "react";
import { useTheme } from "../../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { ExplanationCardProps } from "../../types";
import { AppIcon } from "../../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../../shared/theme";

export function ExplanationCard({
  explanation,
}: ExplanationCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  if (!explanation) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <AppIcon color={colors.primary.light} name="bulb-outline" size={20} />
        <Text style={styles.headerTitle}>Explanation & Solution</Text>
      </View>

      <Text style={styles.explanationText}>{explanation}</Text>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: themeColors.surfaceHighlighted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary.light,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs + 2,
    ...shadows.sm,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    color: colors.primary.light,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  explanationText: {
    fontSize: typography.fontSize.sm + 1,
    color: themeColors.textPrimary,
    lineHeight: typography.lineHeight.md + 2,
  },
});