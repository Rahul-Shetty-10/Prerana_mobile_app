import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { FundamentalsHeroProps } from "../types";
import { Badge, Button } from "../../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function FundamentalsHero({
  subjectCount,
  trackCount,
  onOpenSubjectsPress,
}: FundamentalsHeroProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.heroCard}>
      {/* Badges Row */}
      <View style={styles.badgeRow}>
        <Badge label={`${subjectCount} SUBJECTS`} variant="primary" />
        <Badge label={`${trackCount} LEARNING TRACKS`} variant="secondary" />
      </View>

      {/* Main Title & Description */}
      <Text style={styles.title}>Fundamentals Learning Tracks</Text>
      <Text style={styles.subtitle}>
        Master core subject fundamentals, review essential chapter notes, and practice targeted formula tracks.
      </Text>

      {/* Primary Action Button */}
      <Button
        iconName="grid-outline"
        onPress={onOpenSubjectsPress}
        style={styles.actionButton}
        title="Open My Subjects"
        variant="primary"
      />
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  heroCard: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.sm,
    flexWrap: "wrap",
  },
  title: {
    fontSize: typography.fontSize.xxl - 2,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm + 1,
    color: themeColors.textSecondary,
    lineHeight: typography.lineHeight.md,
    marginBottom: spacing.md,
  },
  actionButton: {
    width: "100%",
  },
});