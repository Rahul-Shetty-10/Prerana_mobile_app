import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PuzzleCardProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { Badge } from "../../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function PuzzleCard({
  puzzle,
  puzzleNumber,
  totalPuzzles,
  showHint = false,
  onToggleHint,
}: PuzzleCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.cardContainer}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          <Badge label={puzzle.category} variant="primary" />
          <Badge label={puzzle.difficulty} variant="secondary" />
        </View>

        {puzzle.hint ? (
          <Pressable onPress={onToggleHint} style={styles.hintButton}>
            <AppIcon
              color={showHint ? colors.accents.amber.text : themeColors.textMuted}
              name={showHint ? "bulb" : "bulb-outline"}
              size={18}
            />
            <Text style={[styles.hintButtonText, showHint && styles.hintActiveText]}>
              {showHint ? "Hide Hint" : "Hint"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* Question Prompt */}
      <Text style={styles.questionText}>{puzzle.question}</Text>
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
    marginBottom: spacing.sm + 2,
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  badgeGroup: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  hintButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  hintButtonText: {
    fontSize: typography.fontSize.xs - 1,
    color: themeColors.textMuted,
  },
  hintActiveText: {
    color: colors.accents.amber.text,
    fontWeight: typography.fontWeight.bold,
  },
  questionText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    lineHeight: typography.lineHeight.lg + 2,
  },
});