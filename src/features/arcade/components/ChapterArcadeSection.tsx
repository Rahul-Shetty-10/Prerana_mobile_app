import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
import { ChapterWordGames } from "../../subjects/types";
import { ChapterGameType } from "../types";

export interface ChapterArcadeSectionProps {
  wordGames: ChapterWordGames;
  subjectId: string;
  chapterId: string;
  chapterTitle: string;
  subjectName: string;
  onGamePress: (gameType: ChapterGameType) => void;
}

interface GameRowConfig {
  type: ChapterGameType;
  label: string;
  iconName: string;
  accentColor: string;
  accentBg: string;
  count: number;
}

function buildGameRows(wordGames: ChapterWordGames): GameRowConfig[] {
  return [
    {
      type: "crossword",
      label: "Crossword",
      iconName: "grid-outline",
      accentColor: colors.primary.main,
      accentBg: colors.accents.coral.bg,
      count: wordGames.crosswords.length,
    },
    {
      type: "hangman",
      label: "Hangman",
      iconName: "text-outline",
      accentColor: colors.accents.amber.text,
      accentBg: colors.accents.amber.bg,
      count: wordGames.hangman.length,
    },
    {
      type: "memoryBattle",
      label: "Memory Battle",
      iconName: "duplicate-outline",
      accentColor: colors.accents.blue.text,
      accentBg: colors.accents.blue.bg,
      count: wordGames.memoryBattle.length,
    },
    {
      type: "speedSniper",
      label: "Speed Sniper",
      iconName: "flash-outline",
      accentColor: colors.accents.emerald.text,
      accentBg: colors.accents.emerald.bg,
      count: wordGames.speedSniper.length,
    },
  ];
}

export function ChapterArcadeSection({
  wordGames,
  onGamePress,
}: ChapterArcadeSectionProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const gameRows = buildGameRows(wordGames);
  // Only show rows that have at least one puzzle
  const availableRows = gameRows.filter((g) => g.count > 0);

  if (availableRows.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <AppIcon
            color={isDark ? colors.accents.purple.darkText : colors.accents.purple.text}
            name="game-controller-outline"
            size={18}
          />
          <Text style={[styles.sectionTitle, { color: isDark ? colors.accents.purple.darkText : colors.accents.purple.text }]}>
            Chapter Arcade
          </Text>
        </View>
        <Text style={styles.sectionSubtitle}>Learn through chapter games</Text>
      </View>

      {/* Card containing game rows */}
      <View style={styles.card}>
        {availableRows.map((game, index) => (
          <React.Fragment key={game.type}>
            <Pressable
              accessibilityLabel={`Play ${game.label}`}
              accessibilityRole="button"
              onPress={() => onGamePress(game.type)}
              style={({ pressed }) => [
                styles.gameRow,
                pressed && styles.gameRowPressed,
              ]}
            >
              {/* Icon */}
              <View style={[styles.iconShell, { backgroundColor: isDark ? themeColors.surfaceSecondary : game.accentBg }]}>
                <AppIcon color={game.accentColor} name={game.iconName as any} size={20} />
              </View>

              {/* Title + count */}
              <View style={styles.gameMeta}>
                <Text style={styles.gameLabel}>{game.label}</Text>
                <Text style={styles.gameCount}>
                  {game.count} {game.count === 1 ? "puzzle" : "puzzles"}
                </Text>
              </View>

              {/* Chevron */}
              <AppIcon color={themeColors.textMuted} name="chevron-forward-outline" size={16} />
            </Pressable>

            {/* Divider between rows (not after last) */}
            {index < availableRows.length - 1 && (
              <View style={styles.divider} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      marginTop: spacing.md,
      marginHorizontal: spacing.md,
    },
    sectionHeader: {
      marginBottom: spacing.sm,
    },
    sectionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginBottom: 2,
    },
    sectionTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.heavy,
    },
    sectionSubtitle: {
      fontSize: typography.fontSize.xs,
      color: themeColors.textMuted,
      marginLeft: 24, // align under title (icon width + gap)
    },
    card: {
      backgroundColor: themeColors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: themeColors.border,
      overflow: "hidden",
      ...shadows.sm,
    },
    gameRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    gameRowPressed: {
      backgroundColor: themeColors.surfaceSecondary,
    },
    iconShell: {
      width: 38,
      height: 38,
      borderRadius: radius.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    gameMeta: {
      flex: 1,
    },
    gameLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: themeColors.textPrimary,
    },
    gameCount: {
      fontSize: typography.fontSize.xs,
      color: themeColors.textMuted,
      marginTop: 1,
    },
    divider: {
      height: 1,
      backgroundColor: themeColors.border,
      marginLeft: spacing.md + 38 + spacing.sm, // indent past icon
    },
  });
