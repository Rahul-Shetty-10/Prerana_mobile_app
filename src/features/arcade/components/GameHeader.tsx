import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GameHeaderProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../shared/theme";
import { LivesIndicator } from "./LivesIndicator";

export function GameHeader({
  title,
  score,
  lives = 3,
  maxLives = 3,
  combo = 0,
  timeLeft,
  totalTime,
  onBackPress,
}: GameHeaderProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.container}>
      {/* Top Controls Row */}
      <View style={styles.topRow}>
        <Pressable onPress={onBackPress} style={styles.backButton}>
          <AppIcon color={themeColors.textPrimary} name="arrow-back-outline" size={20} />
        </Pressable>

        <Text style={styles.title}>{title}</Text>

        <LivesIndicator lives={lives} maxLives={maxLives} />
      </View>

      {/* Stats Sub-bar: Score, Combo, Timer */}
      <View style={styles.statsRow}>
        <View style={styles.scorePill}>
          <AppIcon color={colors.accents.amber.text} name="trophy-outline" size={14} />
          <Text style={styles.scoreText}>{score} pts</Text>
        </View>

        {combo > 1 ? (
          <View style={styles.comboPill}>
            <AppIcon color={colors.primary.main} name="flame-outline" size={14} />
            <Text style={styles.comboText}>{combo}x Combo!</Text>
          </View>
        ) : null}

        {timeLeft !== undefined ? (
          <View style={[styles.timerPill, timeLeft <= 3 && styles.urgentTimerPill]}>
            <AppIcon
              color={timeLeft <= 3 ? colors.status.error : colors.accents.blue.darkText}
              name="time-outline"
              size={14}
            />
            <Text style={[styles.timerText, timeLeft <= 3 && styles.urgentTimerText]}>
              {timeLeft}s
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  backButton: {
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
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs + 2,
  },
  scorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  scoreText: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  comboPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.accents.coral.darkBg,
    borderWidth: 1,
    borderColor: colors.accents.coral.darkBorder,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  comboText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: colors.accents.coral.darkText,
  },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.accents.blue.darkBg,
    borderWidth: 1,
    borderColor: colors.accents.blue.darkBorder,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  timerText: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.heavy,
    color: colors.accents.blue.darkText,
  },
  urgentTimerPill: {
    backgroundColor: "#3B1818",
    borderColor: "#7A2E2E",
  },
  urgentTimerText: {
    color: colors.status.error,
  },
});