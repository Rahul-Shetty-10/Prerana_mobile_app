import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { GameCardProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { Badge, Button } from "../../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function GameCard({ game, onPlayPress }: GameCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const isAvailable = game.status === "available";

  return (
    <View style={styles.cardContainer}>
      {/* Top Banner Row */}
      <View style={styles.topRow}>
        <View style={styles.titleMeta}>
          <View style={[styles.iconShell, { backgroundColor: game.gradientColors[0] + "22" }]}>
            <AppIcon color={game.gradientColors[0]} name={game.iconName} size={24} />
          </View>
          <View style={styles.titleCol}>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameSubtitle}>{game.subtitle}</Text>
          </View>
        </View>

        <Badge
          label={isAvailable ? "AVAILABLE" : "COMING SOON"}
          variant={isAvailable ? "primary" : "dark"}
        />
      </View>

      {/* Description */}
      <Text style={styles.description}>{game.description}</Text>

      {/* Stats Row: Difficulty, XP Reward, Best Score */}
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statPillLabel}>Difficulty:</Text>
          <Text style={styles.statPillValue}>{game.difficulty}</Text>
        </View>

        <View style={styles.statPill}>
          <Text style={styles.statPillLabel}>XP Reward:</Text>
          <Text style={styles.statPillValue}>+{game.xpReward} XP</Text>
        </View>

        {game.bestScore > 0 ? (
          <View style={styles.statPill}>
            <Text style={styles.statPillLabel}>Best:</Text>
            <Text style={styles.statPillValue}>{game.bestScore} pts</Text>
          </View>
        ) : null}
      </View>

      {/* Progress Bar for Available Game */}
      {isAvailable ? (
        <View style={styles.progressBox}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Mastery Completion</Text>
            <Text style={styles.progressValue}>{game.completionPercentage}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${game.completionPercentage}%` }]} />
          </View>
        </View>
      ) : null}

      {/* Action Button */}
      <Button
        disabled={!isAvailable}
        iconName={isAvailable ? "play-outline" : "lock-closed-outline"}
        onPress={() => isAvailable && onPlayPress?.(game.id)}
        style={styles.actionButton}
        title={isAvailable ? "Play Game" : "Coming Soon"}
        variant={isAvailable ? "primary" : "secondary"}
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
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  titleMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  iconShell: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  titleCol: {
    flex: 1,
  },
  gameTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  gameSubtitle: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textMuted,
    marginTop: 2,
  },
  description: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textSecondary,
    lineHeight: typography.lineHeight.sm + 4,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
    flexWrap: "wrap",
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
  },
  statPillLabel: {
    fontSize: typography.fontSize.xs - 1,
    color: themeColors.textMuted,
  },
  statPillValue: {
    fontSize: typography.fontSize.xs - 1,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
  },
  progressBox: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: typography.fontSize.xs - 1,
    color: themeColors.textMuted,
  },
  progressValue: {
    fontSize: typography.fontSize.xs - 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: themeColors.surfaceSecondary,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary.main,
    borderRadius: radius.full,
  },
  actionButton: {
    width: "100%",
  },
});