import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { ArcadeProfileCardProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { Badge } from "../../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function ArcadeProfileCard({
  profile,
}: ArcadeProfileCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.cardContainer}>
      {/* Top Row: User Name & Level Badge */}
      <View style={styles.topRow}>
        <View style={styles.userMeta}>
          <View style={styles.avatarShell}>
            <AppIcon color={colors.primary.main} name="game-controller-outline" size={24} />
          </View>
          <View>
            <Text style={styles.userName}>{profile.name}</Text>
            <Text style={styles.userSubtitle}>Level {profile.level} Arcade Explorer</Text>
          </View>
        </View>
        <Badge label={`LVL ${profile.level}`} variant="primary" />
      </View>

      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statTile}>
          <View style={styles.statIconShell}>
            <AppIcon color={colors.accents.amber.text} name="star-outline" size={16} />
          </View>
          <Text style={styles.statValue}>{profile.xp}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>

        <View style={styles.statTile}>
          <View style={styles.statIconShell}>
            <AppIcon color={colors.secondary.main} name="cash-outline" size={16} />
          </View>
          <Text style={styles.statValue}>{profile.coins}</Text>
          <Text style={styles.statLabel}>Coins</Text>
        </View>

        <View style={styles.statTile}>
          <View style={styles.statIconShell}>
            <AppIcon color={colors.primary.main} name="flame-outline" size={16} />
          </View>
          <Text style={styles.statValue}>{profile.dailyStreak}d</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>

        <View style={styles.statTile}>
          <View style={styles.statIconShell}>
            <AppIcon color={colors.accents.emerald.text} name="trophy-outline" size={16} />
          </View>
          <Text style={styles.statValue}>{profile.highestAccuracy}%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  cardContainer: {
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatarShell: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  userSubtitle: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textMuted,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  statTile: {
    flex: 1,
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xxs,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconShell: {
    width: 26,
    height: 26,
    borderRadius: radius.xs,
    backgroundColor: themeColors.surfaceHighlighted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs - 2,
    fontWeight: typography.fontWeight.medium,
    color: themeColors.textMuted,
    marginTop: 2,
  },
});