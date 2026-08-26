import React, { useMemo } from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useMemoryBattleGame } from "../hooks/useMemoryBattleGame";
import { MemoryBattlePuzzle } from "../../subjects/types/wordGames";
import { colors, radius, spacing, typography } from "../../../shared/theme";
import { AppIcon } from "../../../shared/icons";
import { MemoryGrid } from "./MemoryGrid";
import { VictoryModal } from "./VictoryModal";

export interface MemoryBattleGameViewProps {
  puzzle: MemoryBattlePuzzle;
  chapterTitle: string;
  onExit: () => void;
}

export function MemoryBattleGameView({
  puzzle,
  chapterTitle,
  onExit,
}: MemoryBattleGameViewProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const {
    cards,
    selectedCardIds,
    movesCount,
    matchedPairIds,
    status,
    flipCard,
    resetGame,
  } = useMemoryBattleGame(puzzle);

  const totalPairs = puzzle.pairs?.length || 0;
  const isComplete = status === "completed";

  // Compatible result object for VictoryModal
  const victoryResult = useMemo(() => {
    const accuracy = movesCount > 0 ? Math.round((totalPairs / movesCount) * 100) : 0;
    return {
      score: totalPairs * 150 - movesCount * 10,
      totalQuestions: totalPairs,
      correctCount: totalPairs,
      wrongCount: movesCount - totalPairs,
      accuracy,
      xpEarned: totalPairs * 25,
      coinsEarned: totalPairs * 6,
      highestCombo: 0,
      bestCategory: "Science" as const,
      victory: true,
    };
  }, [totalPairs, movesCount]);

  return (
    <View style={styles.container}>
      {/* Action Header */}
      <View style={styles.actionHeader}>
        <Pressable onPress={onExit} style={styles.exitButton}>
          <AppIcon color={themeColors.textPrimary} name="close-outline" size={20} />
          <Text style={styles.exitText}>Exit Game</Text>
        </Pressable>
        <Text style={styles.difficultyLabel}>
          {puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1)}
        </Text>
      </View>

      {/* Sub-header stats */}
      <View style={styles.statsBar}>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>Moves:</Text>
          <Text style={styles.statValue}>{movesCount}</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>Matched:</Text>
          <Text style={styles.statValue}>
            {matchedPairIds.length} / {totalPairs}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.instructionText}>
          Flip cards to match key scientific terms with their correct definitions.
        </Text>

        <MemoryGrid
          cards={cards}
          disabled={selectedCardIds.length >= 2}
          onCardPress={(card) => flipCard(card.id)}
        />

        <Pressable onPress={resetGame} style={styles.resetButton}>
          <AppIcon color={themeColors.textSecondary} name="refresh-outline" size={18} />
          <Text style={styles.resetButtonText}>Reset Game</Text>
        </Pressable>
      </ScrollView>

      {/* Victory Modal */}
      {isComplete && (
        <VictoryModal
          visible={isComplete}
          result={victoryResult}
          onPlayAgain={resetGame}
          onReturnHome={onExit}
        />
      )}
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    actionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderSubtle,
      backgroundColor: themeColors.surface,
    },
    exitButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: spacing.xs,
    },
    exitText: {
      fontSize: typography.fontSize.xs + 1,
      color: themeColors.textPrimary,
      fontWeight: typography.fontWeight.semibold,
    },
    difficultyLabel: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.heavy,
      color: colors.accents.blue.text,
      backgroundColor: isDark ? "#17253D" : colors.accents.blue.bg,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.full,
    },
    statsBar: {
      flexDirection: "row",
      justifyContent: "center",
      gap: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderSubtle,
      backgroundColor: themeColors.surfaceSecondary,
    },
    statPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: themeColors.surface,
      borderColor: themeColors.border,
      borderWidth: 1,
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
    },
    statLabel: {
      fontSize: typography.fontSize.xs,
      color: themeColors.textMuted,
    },
    statValue: {
      fontSize: typography.fontSize.xs + 1,
      fontWeight: typography.fontWeight.heavy,
      color: themeColors.textPrimary,
    },
    scrollContent: {
      paddingBottom: spacing.xxl + 40,
    },
    instructionText: {
      fontSize: typography.fontSize.xs + 1,
      color: themeColors.textSecondary,
      textAlign: "center",
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
      lineHeight: 16,
    },
    resetButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: themeColors.surfaceSecondary,
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: radius.md,
      paddingVertical: spacing.sm + 2,
      marginHorizontal: spacing.xl,
      marginTop: spacing.lg,
    },
    resetButtonText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: themeColors.textSecondary,
    },
  });
