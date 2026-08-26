import React, { useMemo } from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useHangmanGame } from "../hooks/useHangmanGame";
import { HangmanPuzzle } from "../../subjects/types/wordGames";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
import { AppIcon } from "../../../shared/icons";
import { VictoryModal } from "./VictoryModal";
import { DefeatModal } from "./DefeatModal";

export interface HangmanGameViewProps {
  puzzle: HangmanPuzzle;
  chapterTitle: string;
  onExit: () => void;
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export function HangmanGameView({
  puzzle,
  chapterTitle,
  onExit,
}: HangmanGameViewProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const {
    currentWordIndex,
    currentWord,
    guessedLetters,
    lives,
    maxLives,
    status,
    revealedWord,
    guessLetter,
    nextWord,
    resetGame,
  } = useHangmanGame(puzzle);

  const totalWords = puzzle.words?.length || 1;

  // Compatible result object for VictoryModal
  const victoryResult = useMemo(() => {
    return {
      score: totalWords * 100,
      totalQuestions: totalWords,
      correctCount: totalWords,
      wrongCount: 0,
      accuracy: 100,
      xpEarned: totalWords * 20,
      coinsEarned: totalWords * 8,
      highestCombo: 0,
      bestCategory: "Science" as const,
      victory: true,
    };
  }, [totalWords]);

  // Compatible result object for DefeatModal
  const defeatResult = useMemo(() => {
    const solved = currentWordIndex;
    const accuracy = totalWords > 0 ? Math.round((solved / totalWords) * 100) : 0;
    return {
      score: solved * 100,
      totalQuestions: totalWords,
      correctCount: solved,
      wrongCount: totalWords - solved,
      accuracy,
      xpEarned: solved * 10,
      coinsEarned: solved * 3,
      highestCombo: 0,
      bestCategory: "Science" as const,
      victory: false,
    };
  }, [currentWordIndex, totalWords]);

  return (
    <View style={styles.container}>
      {/* Action Header */}
      <View style={styles.actionHeader}>
        <Pressable onPress={onExit} style={styles.exitButton}>
          <AppIcon color={themeColors.textPrimary} name="close-outline" size={20} />
          <Text style={styles.exitText}>Exit Game</Text>
        </Pressable>
        <Text style={styles.progressText}>
          Word {currentWordIndex + 1} of {totalWords}
        </Text>
        <Text style={styles.difficultyLabel}>
          {puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1)}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Clue Panel */}
        <View style={styles.clueCard}>
          <Text style={styles.clueHeaderLabel}>Clue</Text>
          <Text style={styles.clueText}>
            {currentWord?.clue || "No clue available for this word."}
          </Text>
        </View>

        {/* Hangman Drawing & Chances */}
        <View style={styles.drawingContainer}>
          <View style={styles.hangmanFrame}>
            {/* Scaffold */}
            <View style={styles.scaffoldBase} />
            <View style={styles.scaffoldPole} />
            <View style={styles.scaffoldTop} />
            <View style={styles.scaffoldRope} />
            
            {/* Body Parts based on wrong guesses (maxLives - lives) */}
            {(maxLives - lives) > 0 && <View style={styles.figureHead} />}
            {(maxLives - lives) > 1 && <View style={styles.figureBody} />}
            {(maxLives - lives) > 2 && <View style={styles.figureArmLeft} />}
            {(maxLives - lives) > 3 && <View style={styles.figureArmRight} />}
            {(maxLives - lives) > 4 && <View style={styles.figureLegLeft} />}
            {(maxLives - lives) > 5 && <View style={styles.figureLegRight} />}
          </View>
          
          {/* Chances indicator */}
          <View style={styles.livesPanel}>
            <Text style={styles.livesLabel}>Chances:</Text>
            <View style={styles.heartsRow}>
              {Array.from({ length: maxLives }).map((_, i) => (
                <AppIcon 
                  key={`heart-${i}`} 
                  color={i < lives ? colors.status.error : themeColors.borderSubtle} 
                  name="heart" 
                  size={16} 
                />
              ))}
            </View>
          </View>
        </View>

        {/* Word revealed area */}
        <View style={styles.wordContainer}>
          {revealedWord.split("").map((char, index) => {
            const isSpace = char === " ";
            const isBlank = char === "_";
            return (
              <View
                key={`char-${index}`}
                style={[
                  styles.charBox,
                  isSpace && styles.charBoxSpace,
                  !isSpace && styles.charBoxLetter,
                  !isBlank && !isSpace && styles.charBoxFilled,
                ]}
              >
                <Text style={styles.charText}>
                  {isBlank ? "" : char}
                </Text>
                {isBlank && <View style={styles.charLine} />}
              </View>
            );
          })}
        </View>

        {/* Intermediary transitions */}
        {status === "word_cleared" && (
          <View style={styles.transitionContainer}>
            <View style={styles.successBanner}>
              <AppIcon color={colors.status.success} name="checkmark-circle" size={32} />
              <Text style={styles.successText}>Correct Guess! Word Cleared.</Text>
            </View>
            <Pressable onPress={nextWord} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Next Word</Text>
              <AppIcon color="#FFFFFF" name="arrow-forward-outline" size={18} />
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Keyboard Grid */}
      {status === "playing" && (
        <View style={styles.keyboardContainer}>
          {KEYBOARD_ROWS.map((row, rIdx) => (
            <View key={`row-${rIdx}`} style={styles.keyboardRow}>
              {row.map((key) => {
                const isGuessed = guessedLetters.includes(key);
                const isCorrect = isGuessed && (currentWord?.answer.toUpperCase().includes(key) ?? false);
                return (
                  <Pressable
                    key={`key-${key}`}
                    disabled={isGuessed}
                    onPress={() => guessLetter(key)}
                    style={[
                      styles.keyButton,
                      isGuessed && styles.keyButtonGuessed,
                      isGuessed && isCorrect && styles.keyButtonCorrect,
                      isGuessed && !isCorrect && styles.keyButtonIncorrect,
                    ]}
                  >
                    <Text
                      style={[
                        styles.keyButtonText,
                        isGuessed && styles.keyButtonTextGuessed,
                        isGuessed && isCorrect && styles.keyTextCorrect,
                        isGuessed && !isCorrect && styles.keyTextIncorrect,
                      ]}
                    >
                      {key}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      )}

      {/* Victory Result Modal */}
      {status === "completed" && (
        <VictoryModal
          visible={status === "completed"}
          result={victoryResult}
          onPlayAgain={resetGame}
          onReturnHome={onExit}
        />
      )}

      {/* Defeat / Game Over Modal */}
      {status === "game_over" && (
        <DefeatModal
          visible={status === "game_over"}
          result={defeatResult}
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
    progressText: {
      fontSize: typography.fontSize.xs + 1,
      fontWeight: typography.fontWeight.bold,
      color: themeColors.textSecondary,
    },
    difficultyLabel: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.heavy,
      color: colors.accents.amber.text,
      backgroundColor: isDark ? "#2A2115" : colors.accents.amber.bg,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.full,
    },
    scrollContainer: {
      paddingBottom: spacing.xxl + 80,
    },
    drawingContainer: {
      alignItems: "center",
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    hangmanFrame: {
      width: 120,
      height: 140,
      position: "relative",
    },
    scaffoldBase: {
      position: "absolute",
      bottom: 0,
      left: 10,
      width: 80,
      height: 4,
      backgroundColor: themeColors.textPrimary,
    },
    scaffoldPole: {
      position: "absolute",
      bottom: 0,
      left: 30,
      width: 4,
      height: 140,
      backgroundColor: themeColors.textPrimary,
    },
    scaffoldTop: {
      position: "absolute",
      top: 0,
      left: 30,
      width: 60,
      height: 4,
      backgroundColor: themeColors.textPrimary,
    },
    scaffoldRope: {
      position: "absolute",
      top: 0,
      left: 86,
      width: 4,
      height: 20,
      backgroundColor: themeColors.textPrimary,
    },
    figureHead: {
      position: "absolute",
      top: 20,
      left: 74,
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 3,
      borderColor: themeColors.textPrimary,
    },
    figureBody: {
      position: "absolute",
      top: 48,
      left: 86.5,
      width: 3,
      height: 40,
      backgroundColor: themeColors.textPrimary,
    },
    figureArmLeft: {
      position: "absolute",
      top: 55,
      left: 70,
      width: 3,
      height: 30,
      backgroundColor: themeColors.textPrimary,
      transform: [{ rotate: "45deg" }],
    },
    figureArmRight: {
      position: "absolute",
      top: 55,
      left: 103,
      width: 3,
      height: 30,
      backgroundColor: themeColors.textPrimary,
      transform: [{ rotate: "-45deg" }],
    },
    figureLegLeft: {
      position: "absolute",
      top: 85,
      left: 75,
      width: 3,
      height: 35,
      backgroundColor: themeColors.textPrimary,
      transform: [{ rotate: "30deg" }],
    },
    figureLegRight: {
      position: "absolute",
      top: 85,
      left: 98,
      width: 3,
      height: 35,
      backgroundColor: themeColors.textPrimary,
      transform: [{ rotate: "-30deg" }],
    },
    livesPanel: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    livesLabel: {
      fontSize: typography.fontSize.xs + 1,
      fontWeight: typography.fontWeight.bold,
      color: themeColors.textSecondary,
    },
    heartsRow: {
      flexDirection: "row",
      gap: 4,
    },
    clueCard: {
      backgroundColor: themeColors.surface,
      marginHorizontal: spacing.md,
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: themeColors.border,
      ...shadows.sm,
      gap: 6,
    },
    clueHeaderLabel: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.heavy,
      color: themeColors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    clueText: {
      fontSize: typography.fontSize.md,
      color: themeColors.textPrimary,
      fontWeight: typography.fontWeight.bold,
      lineHeight: 20,
    },
    wordContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginHorizontal: spacing.md,
      marginVertical: spacing.xl,
      gap: spacing.xs,
    },
    charBox: {
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    charBoxLetter: {
      width: 38,
      backgroundColor: themeColors.surface,
      borderRadius: radius.sm,
      borderWidth: 1.5,
      borderColor: themeColors.border,
      ...shadows.sm,
    },
    charBoxFilled: {
      borderColor: colors.primary.main,
    },
    charBoxSpace: {
      width: 18,
    },
    charText: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.heavy,
      color: themeColors.textPrimary,
    },
    charLine: {
      position: "absolute",
      bottom: 6,
      width: 18,
      height: 2,
      backgroundColor: themeColors.textSecondary,
      borderRadius: radius.full,
    },
    transitionContainer: {
      alignItems: "center",
      marginTop: spacing.sm,
      gap: spacing.md,
    },
    successBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: isDark ? "#0A2416" : "#E8F8F0",
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.status.success,
    },
    successText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: colors.status.success,
    },
    nextButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: colors.primary.main,
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.xxl,
      borderRadius: radius.md,
      ...shadows.sm,
    },
    nextButtonText: {
      color: "#FFFFFF",
      fontWeight: typography.fontWeight.heavy,
      fontSize: typography.fontSize.sm,
    },
    keyboardContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: isDark ? "#121212" : "#E5E5EA",
      paddingTop: spacing.xs,
      paddingBottom: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      gap: 6,
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
    keyButtonGuessed: {
      backgroundColor: themeColors.borderSubtle,
      opacity: 0.6,
    },
    keyButtonCorrect: {
      backgroundColor: isDark ? "#0D3320" : "#E8F8F0",
      borderColor: colors.status.success,
      borderWidth: 1,
      opacity: 1,
    },
    keyButtonIncorrect: {
      backgroundColor: isDark ? "#3A1212" : "#FDF0F0",
      borderColor: colors.status.error,
      borderWidth: 1,
      opacity: 0.8,
    },
    keyButtonText: {
      fontSize: typography.fontSize.sm + 1,
      fontWeight: typography.fontWeight.bold,
      color: themeColors.textPrimary,
    },
    keyButtonTextGuessed: {
      color: themeColors.textMuted,
    },
    keyTextCorrect: {
      color: colors.status.success,
    },
    keyTextIncorrect: {
      color: colors.status.error,
    },
  });
