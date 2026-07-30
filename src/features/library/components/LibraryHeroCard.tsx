import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { LibraryHeroCardProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { Badge, Button } from "../../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function LibraryHeroCard({
  title,
  subtitle,
  stats,
  onOpenMySubjects,
}: LibraryHeroCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.heroCard}>
      {/* Top Header Badge Row */}
      <View style={styles.badgeRow}>
        <Badge label="AI POWERED" variant="primary" />
        <Badge label="APPROVED RESOURCES" variant="secondary" />
      </View>

      {/* Main Title & Description */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {/* 3 Statistics Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statTile}>
          <View style={styles.statIconShell}>
            <AppIcon color={colors.accents.amber.text} name="book-outline" size={16} />
          </View>
          <Text style={styles.statNumber}>{stats.activeSubjects}</Text>
          <Text style={styles.statLabel}>Active Subjects</Text>
        </View>

        <View style={styles.statTile}>
          <View style={styles.statIconShell}>
            <AppIcon color={colors.primary.main} name="bookmark-outline" size={16} />
          </View>
          <Text style={styles.statNumber}>{stats.savedOutputs}</Text>
          <Text style={styles.statLabel}>Saved Outputs</Text>
        </View>

        <View style={styles.statTile}>
          <View style={styles.statIconShell}>
            <AppIcon color={colors.accents.emerald.text} name="layers-outline" size={16} />
          </View>
          <Text style={styles.statNumber}>{stats.visibleResources}</Text>
          <Text style={styles.statLabel}>Visible Resources</Text>
        </View>
      </View>

      {/* Action Button */}
      <Button
        iconName="grid-outline"
        onPress={onOpenMySubjects}
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
    marginBottom: spacing.md,
    ...shadows.md,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.xs + 2,
    flexWrap: "wrap",
  },
  title: {
    fontSize: typography.fontSize.xxl - 2,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm + 1,
    color: themeColors.textSecondary,
    lineHeight: typography.lineHeight.md,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.xs + 2,
    marginBottom: spacing.lg,
  },
  statTile: {
    flex: 1,
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    padding: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconShell: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: themeColors.surfaceHighlighted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xxs + 2,
  },
  statNumber: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs - 1,
    fontWeight: typography.fontWeight.medium,
    color: themeColors.textMuted,
    textAlign: "center",
    marginTop: 2,
  },
  actionButton: {
    width: "100%",
  },
});