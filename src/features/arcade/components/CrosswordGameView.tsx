import React, { useMemo, useState } from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCrosswordGame, cellKey } from "../hooks/useCrosswordGame";
import { CrosswordPuzzle } from "../../subjects/types/wordGames";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
import { AppIcon } from "../../../shared/icons";
import { VictoryModal } from "./VictoryModal";

export interface CrosswordGameViewProps {
  puzzle: CrosswordPuzzle;
  chapterTitle: string;
  onExit: () => void;
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

export function CrosswordGameView({
  puzzle,
  chapterTitle,
  onExit,
}: CrosswordGameViewProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const styles = getStyles(themeColors, isDark, isKeyboardVisible);

  const {
    selectedCell,
    selectedDirection,
    userGrid,
    checkedGrid,
    hasChecked,
    isComplete,
    activeWord,
    activeWordCells,
    cellMap,
    acrossWords,
    downWords,
    selectCell,
    enterLetter,
    deleteLetter,
    selectWord,
    checkAnswers,
    resetGame,
  } = useCrosswordGame(puzzle);

  const screenWidth = Dimensions.get("window").width;
  const gridPadding = spacing.md * 2;
  const availableWidth = screenWidth - gridPadding;

  // Calculate cell size to fit screen width
  const { rows, cols } = puzzle.gridSize;
  const cellSize = useMemo(() => {
    const size = Math.floor(availableWidth / cols);
    return Math.max(28, Math.min(size - 2, 42)); // clamp size between 28 and 42
  }, [availableWidth, cols]);

  const handleKeyPress = (key: string) => {
    if (key === "⌫") {
      deleteLetter();
    } else {
      enterLetter(key);
    }
  };

  const handleCellPress = (r: number, c: number) => {
    selectCell(r, c);
    setIsKeyboardVisible(true);
  };

  const handleCluePress = (word: any) => {
    selectWord(word);
    setIsKeyboardVisible(true);
  };

  const gridWidth = cols * (cellSize + 2);

  // Generate kompatible BrainBlitzSessionResult for VictoryModal
  const sessionResult = useMemo(() => {
    return {
      score: puzzle.words.length * 50,
      totalQuestions: puzzle.words.length,
      correctCount: puzzle.words.length,
      wrongCount: 0,
      accuracy: 100,
      xpEarned: puzzle.words.length * 15,
      coinsEarned: puzzle.words.length * 5,
      highestCombo: 0,
      bestCategory: "Science" as const,
      victory: true,
    };
  }, [puzzle.words]);

  return (
    <View style={styles.container}>
      {/* Game controls row */}
      <View style={styles.actionHeader}>
        <Pressable onPress={onExit} style={styles.exitButton}>
          <AppIcon color={themeColors.textPrimary} name="close-outline" size={20} />
          <Text style={styles.exitText}>Exit Game</Text>
        </Pressable>
        <Text style={styles.difficultyLabel}>
          {puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1)}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Active Clue Panel */}
        <View style={styles.activeCluePanel}>
          {activeWord ? (
            <View style={styles.activeClueRow}>
              <View style={styles.activeClueBadge}>
                <Text style={styles.activeClueBadgeText}>
                  {activeWord.direction.toUpperCase()} {activeWord.number}
                </Text>
              </View>
              <Text style={styles.activeClueText} numberOfLines={3}>
                {activeWord.clue}
              </Text>
            </View>
          ) : (
            <Text style={styles.activeCluePlaceholder}>
              Tap any grid square or clue to begin
            </Text>
          )}
        </View>

        {/* Grid View */}
        <View style={styles.gridOuterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            <View style={[styles.grid, { width: gridWidth }]}>
              {Array.from({ length: rows }).map((_, r) => (
                <View key={`row-${r}`} style={styles.gridRow}>
                  {Array.from({ length: cols }).map((_, c) => {
                    const key = cellKey(r, c);
                    const cell = cellMap.get(key);

                    if (!cell) {
                      // Transparent block for unplayable grid space
                      return (
                        <View
                          key={`empty-${r}-${c}`}
                          style={[styles.emptyCell, { width: cellSize, height: cellSize }]}
                        />
                      );
                    }

                    const isSelected = selectedCell?.row === r && selectedCell?.col === c;
                    const isActiveWordCell = activeWordCells.some(
                      (wc) => wc.row === r && wc.col === c
                    );
                    const status = checkedGrid[key];
                    const val = userGrid[key] || "";

                    return (
                      <Pressable
                        key={`cell-${r}-${c}`}
                        onPress={() => handleCellPress(r, c)}
                        style={[
                          styles.cell,
                          { width: cellSize, height: cellSize },
                          isActiveWordCell && styles.cellActiveWord,
                          isSelected && styles.cellSelected,
                          status === "correct" && styles.cellCorrect,
                          status === "incorrect" && styles.cellIncorrect,
                        ]}
                      >
                        {/* Clue Number */}
                        {cell.number !== undefined && (
                          <Text style={styles.cellNumber}>{cell.number}</Text>
                        )}
                        {/* Letter Input */}
                        <Text
                          style={[
                            styles.cellText,
                            { fontSize: Math.floor(cellSize * 0.5) },
                            status === "correct" && styles.cellTextCorrect,
                            status === "incorrect" && styles.cellTextIncorrect,
                          ]}
                        >
                          {val}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Action Buttons */}
        <View style={styles.gridActions}>
          <Pressable onPress={checkAnswers} style={styles.checkButton}>
            <AppIcon color="#FFFFFF" name="checkmark-circle-outline" size={18} />
            <Text style={styles.checkButtonText}>Check Answers</Text>
          </Pressable>
          <Pressable onPress={resetGame} style={styles.resetButton}>
            <AppIcon color={themeColors.textSecondary} name="refresh-outline" size={18} />
            <Text style={styles.resetButtonText}>Reset</Text>
          </Pressable>
        </View>



        {/* Clues accordion lists */}
        <View style={styles.cluesContainer}>
          <Text style={styles.cluesHeader}>Across Clues</Text>
          <View style={styles.clueList}>
            {acrossWords.map((word) => {
              const isSelected = activeWord?.direction === "across" && activeWord?.number === word.number;
              return (
                <Pressable
                  key={`across-${word.number}`}
                  onPress={() => handleCluePress(word)}
                  style={[styles.clueItem, isSelected && styles.clueItemActive]}
                >
                  <Text style={[styles.clueItemNumber, isSelected && styles.clueTextActive]}>
                    {word.number}
                  </Text>
                  <Text style={[styles.clueItemText, isSelected && styles.clueTextActive]}>
                    {word.clue}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.cluesHeader, { marginTop: spacing.md }]}>Down Clues</Text>
          <View style={styles.clueList}>
            {downWords.map((word) => {
              const isSelected = activeWord?.direction === "down" && activeWord?.number === word.number;
              return (
                <Pressable
                  key={`down-${word.number}`}
                  onPress={() => handleCluePress(word)}
                  style={[styles.clueItem, isSelected && styles.clueItemActive]}
                >
                  <Text style={[styles.clueItemNumber, isSelected && styles.clueTextActive]}>
                    {word.number}
                  </Text>
                  <Text style={[styles.clueItemText, isSelected && styles.clueTextActive]}>
                    {word.clue}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* On-screen Keyboard (conditional render) */}
      {isKeyboardVisible && (
        <View style={styles.keyboardContainer}>
          {/* Keyboard Header bar with Close action */}
          <View style={styles.keyboardHeader}>
            <Pressable onPress={() => setIsKeyboardVisible(false)} style={styles.keyboardCloseButton}>
              <Text style={styles.keyboardCloseText}>Hide Keyboard</Text>
              <AppIcon color={themeColors.textSecondary} name="chevron-down-outline" size={16} />
            </Pressable>
          </View>
          
          {KEYBOARD_ROWS.map((row, rIdx) => (
            <View key={`row-${rIdx}`} style={styles.keyboardRow}>
              {row.map((key) => {
                const isDel = key === "⌫";
                return (
                  <Pressable
                    key={`key-${key}`}
                    onPress={() => handleKeyPress(key)}
                    style={[styles.keyButton, isDel && styles.keyButtonDelete]}
                  >
                    <Text style={[styles.keyButtonText, isDel && styles.keyButtonTextDelete]}>
                      {key}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      )}

      {/* Victory Modal */}
      {isComplete && (
        <VictoryModal
          visible={isComplete}
          result={sessionResult}
          onPlayAgain={resetGame}
          onReturnHome={onExit}
        />
      )}
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean, isKeyboardVisible: boolean) =>
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
      color: colors.primary.main,
      backgroundColor: isDark ? "#2A1515" : colors.accents.coral.bg,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.full,
    },
    scrollContainer: {
      paddingBottom: isKeyboardVisible ? spacing.xxl + 210 : spacing.xxl + 20,
    },
    activeCluePanel: {
      backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
      margin: spacing.md,
      borderRadius: radius.sm,
      padding: spacing.md,
      minHeight: 68,
      justifyContent: "center",
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    activeClueRow: {
      flexDirection: "row",
      gap: spacing.sm,
      alignItems: "center",
    },
    activeClueBadge: {
      backgroundColor: colors.primary.main,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.xs,
    },
    activeClueBadgeText: {
      fontSize: typography.fontSize.xs - 2,
      color: "#FFFFFF",
      fontWeight: typography.fontWeight.heavy,
    },
    activeClueText: {
      flex: 1,
      fontSize: typography.fontSize.xs + 1,
      color: themeColors.textPrimary,
      fontWeight: typography.fontWeight.bold,
      lineHeight: 16,
    },
    activeCluePlaceholder: {
      fontSize: typography.fontSize.xs + 1,
      color: themeColors.textMuted,
      textAlign: "center",
      fontStyle: "italic",
    },
    gridOuterContainer: {
      alignItems: "center",
      marginVertical: spacing.xs,
    },
    horizontalScrollContent: {
      paddingHorizontal: spacing.md,
      justifyContent: "center",
      alignItems: "center",
    },
    grid: {
      borderWidth: 2,
      borderColor: themeColors.border,
      backgroundColor: isDark ? "#121212" : "#E5E5EA",
      padding: 1,
      alignItems: "center",
    },
    gridRow: {
      flexDirection: "row",
    },
    cell: {
      backgroundColor: themeColors.surface,
      borderColor: isDark ? "#2C2C2E" : "#C7C7CC",
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    cellSelected: {
      borderColor: colors.primary.main,
      borderWidth: 2,
      backgroundColor: isDark ? "#271212" : "#FDEAEA",
      zIndex: 2,
    },
    cellActiveWord: {
      backgroundColor: isDark ? "#1E1616" : "#FFF5F5",
    },
    cellCorrect: {
      backgroundColor: isDark ? "#0A2416" : "#E8F8F0",
      borderColor: colors.status.success,
    },
    cellIncorrect: {
      backgroundColor: isDark ? "#3A1212" : "#FDF0F0",
      borderColor: colors.status.error,
    },
    emptyCell: {
      backgroundColor: "transparent",
    },
    cellNumber: {
      position: "absolute",
      top: 1,
      left: 2,
      fontSize: 8,
      fontWeight: "bold",
      color: themeColors.textMuted,
    },
    cellText: {
      fontWeight: "bold",
      color: themeColors.textPrimary,
    },
    cellTextCorrect: {
      color: colors.status.success,
    },
    cellTextIncorrect: {
      color: colors.status.error,
    },
    gridActions: {
      flexDirection: "row",
      justifyContent: "center",
      gap: spacing.md,
      marginTop: spacing.md,
      paddingHorizontal: spacing.md,
    },
    checkButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.primary.main,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      ...shadows.sm,
    },
    checkButtonText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: "#FFFFFF",
    },
    resetButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: themeColors.surfaceSecondary,
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    resetButtonText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: themeColors.textSecondary,
    },
    utilityActions: {
      flexDirection: "row",
      justifyContent: "center",
      gap: spacing.sm + 2,
      marginTop: spacing.sm + 2,
      paddingHorizontal: spacing.md,
    },
    utilityButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: themeColors.surface,
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: radius.md,
      paddingVertical: spacing.sm - 2,
      paddingHorizontal: spacing.md,
    },
    utilityButtonActive: {
      borderColor: colors.primary.main,
      backgroundColor: isDark ? "#271212" : "#FFF5F5",
    },
    utilityButtonText: {
      fontSize: typography.fontSize.xs + 1,
      fontWeight: typography.fontWeight.semibold,
      color: themeColors.textSecondary,
    },
    utilityButtonTextActive: {
      color: colors.primary.main,
      fontWeight: typography.fontWeight.bold,
    },
    cluesContainer: {
      paddingHorizontal: spacing.md,
      marginTop: spacing.md,
    },
    cluesHeader: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.heavy,
      color: themeColors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: spacing.xs,
    },
    clueList: {
      backgroundColor: themeColors.surface,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: themeColors.border,
      overflow: "hidden",
    },
    clueItem: {
      flexDirection: "row",
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderSubtle,
      gap: spacing.sm,
      alignItems: "center",
    },
    clueItemActive: {
      backgroundColor: isDark ? "#271212" : "#FFF5F5",
    },
    clueItemNumber: {
      fontSize: typography.fontSize.xs + 1,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary.main,
      width: 20,
    },
    clueItemText: {
      flex: 1,
      fontSize: typography.fontSize.xs + 1,
      color: themeColors.textSecondary,
    },
    clueTextActive: {
      color: colors.primary.main,
      fontWeight: typography.fontWeight.bold,
    },
    keyboardContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
      paddingTop: spacing.xs,
      paddingBottom: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      gap: 6,
      ...shadows.lg,
    },
    keyboardHeader: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingHorizontal: spacing.md,
      paddingBottom: 2,
    },
    keyboardCloseButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 2,
    },
    keyboardCloseText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
      color: themeColors.textSecondary,
    },
    keyboardRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 4,
      paddingHorizontal: 4,
    },
    keyButton: {
      flex: 1,
      maxWidth: 38,
      height: 42,
      backgroundColor: themeColors.surface,
      borderRadius: radius.xs,
      alignItems: "center",
      justifyContent: "center",
      ...shadows.sm,
    },
    keyButtonDelete: {
      flex: 1.5,
      maxWidth: 54,
      backgroundColor: isDark ? "#2C2C2E" : "#8E8E93",
    },
    keyButtonText: {
      fontSize: typography.fontSize.sm + 1,
      fontWeight: typography.fontWeight.bold,
      color: themeColors.textPrimary,
    },
    keyButtonTextDelete: {
      color: "#FFFFFF",
    },
  });
