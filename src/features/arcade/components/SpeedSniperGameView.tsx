import React, { useEffect } from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useSpeedSniperGame } from "../hooks/useSpeedSniperGame";
import { SpeedSniperPuzzle } from "../../subjects/types/wordGames";
import { AnswerButton } from "./AnswerButton";
import { QuestionCard } from "./QuestionCard";
import { ProgressBar } from "./ProgressBar";
import { VictoryModal } from "./VictoryModal";
import { DefeatModal } from "./DefeatModal";
import { colors, spacing, radius, typography } from "../../../shared/theme";
import { AppIcon } from "../../../shared/icons";

export interface SpeedSniperGameViewProps {
  puzzle: SpeedSniperPuzzle;
  chapterTitle: string;
  onExit: () => void;
}

export function SpeedSniperGameView({
  puzzle,
  chapterTitle,
  onExit,
}: SpeedSniperGameViewProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const {
    engine,
    timer,
    currentIndex,
    selectedIndex,
    isAnswered,
    sessionResult,
    startSession,
    selectAnswer,
  } = useSpeedSniperGame(puzzle);

  useEffect(() => {
    startSession();
  }, []);

  const totalQuestions = puzzle.questions?.length || 0;
  const currentQuestion = puzzle.questions ? puzzle.questions[currentIndex] : null;
  const progress = totalQuestions > 0 ? (currentIndex + 1) / totalQuestions : 0;
  const timeProgress = timer.timeLeft / (puzzle.timerSeconds || 30);
  const isUrgent = timer.timeLeft <= 5 && timer.timeLeft > 0;

  return (
    <View style={styles.container}>
      {/* Top Custom Header */}
      <View style={styles.actionHeader}>
        <Pressable onPress={onExit} style={styles.exitButton}>
          <AppIcon color={themeColors.textPrimary} name="close-outline" size={20} />
          <Text style={styles.exitText}>Exit Game</Text>
        </Pressable>
        <Text style={styles.scoreText}>Score: {engine.score} pts</Text>
        <Text style={styles.difficultyLabel}>
          {puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1)}
        </Text>
      </View>

      {/* Countdown Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar
          color={isUrgent ? colors.status.error : colors.accents.emerald.text}
          progress={timeProgress}
        />
        <View style={styles.timerRow}>
          <AppIcon
            color={isUrgent ? colors.status.error : themeColors.textSecondary}
            name="time-outline"
            size={14}
          />
          <Text style={[styles.timerText, isUrgent && styles.timerTextUrgent]}>
            {timer.timeLeft}s left
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {currentQuestion ? (
          <>
            {/* Question display */}
            <QuestionCard
              category="Science"
              difficulty={puzzle.difficulty}
              questionNumber={currentIndex + 1}
              questionText={currentQuestion.prompt}
              totalQuestions={totalQuestions}
            />

            {/* Target choice buttons */}
            <View style={styles.optionsContainer}>
              {currentQuestion.choices.map((choiceText, idx) => {
                const isSelected = selectedIndex === idx;
                const isCorrect = choiceText === currentQuestion.correctAnswer;

                return (
                  <AnswerButton
                    key={`ss-opt-${idx}`}
                    disabled={isAnswered}
                    index={idx}
                    isAnswered={isAnswered}
                    isCorrect={isCorrect}
                    isSelected={isSelected}
                    onPress={(selectedIdx) => selectAnswer(selectedIdx)}
                    optionText={choiceText}
                  />
                );
              })}
            </View>
          </>
        ) : (
          <Text style={styles.errorText}>No questions loaded.</Text>
        )}
      </ScrollView>

      {/* Victory modal */}
      {sessionResult && sessionResult.victory && (
        <VictoryModal
          visible={engine.status === "completed"}
          result={sessionResult as any}
          onPlayAgain={startSession}
          onReturnHome={onExit}
        />
      )}

      {/* Defeat / Game Over modal */}
      {sessionResult && !sessionResult.victory && (
        <DefeatModal
          visible={engine.status === "game_over" || engine.status === "completed"}
          result={sessionResult as any}
          onPlayAgain={startSession}
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
    scoreText: {
      fontSize: typography.fontSize.xs + 1,
      fontWeight: typography.fontWeight.bold,
      color: themeColors.textSecondary,
    },
    difficultyLabel: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.heavy,
      color: colors.accents.emerald.text,
      backgroundColor: isDark ? "#172A21" : colors.accents.emerald.bg,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.full,
    },
    progressContainer: {
      paddingVertical: spacing.xs,
      backgroundColor: themeColors.surfaceSecondary,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderSubtle,
    },
    timerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 4,
      paddingHorizontal: spacing.md,
      marginTop: 2,
    },
    timerText: {
      fontSize: typography.fontSize.xs - 1,
      fontWeight: typography.fontWeight.bold,
      color: themeColors.textSecondary,
    },
    timerTextUrgent: {
      color: colors.status.error,
    },
    scrollContent: {
      paddingBottom: spacing.xxl + 40,
    },
    optionsContainer: {
      marginTop: spacing.xs,
    },
    errorText: {
      fontSize: typography.fontSize.sm,
      color: themeColors.textMuted,
      textAlign: "center",
      marginTop: spacing.xl,
    },
  });
