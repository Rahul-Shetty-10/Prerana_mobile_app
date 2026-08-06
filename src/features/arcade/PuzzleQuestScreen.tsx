import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AnswerButton,
  DifficultyModal,
  GameHeader,
  HintBadge,
  ProgressBar,
  PuzzleCard,
  VictoryModal,
} from "./components";
import { useArcadeProfile, usePuzzleQuest } from "./hooks";
import { PuzzleDifficulty } from "./types";
import { colors, radius, spacing, typography } from "../../shared/theme";

export interface PuzzleQuestScreenProps {
  onReturnHome: () => void;
}

export function PuzzleQuestScreen({
  onReturnHome,
}: PuzzleQuestScreenProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const { recordGameResult } = useArcadeProfile();
  const [showDifficultyModal, setShowDifficultyModal] = useState(true);

  const {
    engine,
    difficulty,
    puzzles,
    currentPuzzle,
    currentIndex,
    selectedIndex,
    isAnswered,
    showHint,
    sessionResult,
    startSession,
    selectAnswer,
    toggleHint,
  } = usePuzzleQuest("Medium");

  useEffect(() => {
    setShowDifficultyModal(true);
  }, []);

  const recordGameResultRef = useRef(recordGameResult);
  useEffect(() => { recordGameResultRef.current = recordGameResult; }, [recordGameResult]);

  // Record profile stats on game completion
  useEffect(() => {
    if (sessionResult) {
      recordGameResultRef.current({
        xpEarned: sessionResult.xpEarned,
        coinsEarned: sessionResult.coinsEarned,
        correctAnswers: sessionResult.solvedCount,
        totalQuestions: sessionResult.totalPuzzles,
        score: sessionResult.score,
      });
    }
  }, [sessionResult]);

  const handleSelectDifficulty = (selectedDifficulty: string) => {
    setShowDifficultyModal(false);
    startSession(selectedDifficulty as PuzzleDifficulty);
  };

  const totalPuzzles = puzzles.length || 10;
  const progress = (currentIndex + 1) / totalPuzzles;

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      {/* Top Game Header */}
      <GameHeader
        combo={engine.combo}
        onBackPress={onReturnHome}
        score={engine.score}
        title={`Puzzle Quest (${difficulty})`}
      />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar color={colors.accents.emerald.text} progress={progress} />
      </View>

      {/* Sub-bar: Solved & Progress */}
      <View style={styles.subStatsBar}>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>Solved:</Text>
          <Text style={[styles.statValue, { color: colors.status.success }]}>
            {engine.correctAnswers} / {totalPuzzles}
          </Text>
        </View>

        {engine.combo > 1 ? (
          <View style={styles.streakPill}>
            <Text style={styles.streakText}>{engine.combo}x Logic Streak!</Text>
          </View>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {currentPuzzle ? (
          <>
            <PuzzleCard
              onToggleHint={toggleHint}
              puzzle={currentPuzzle}
              puzzleNumber={currentIndex + 1}
              showHint={showHint}
              totalPuzzles={totalPuzzles}
            />

            {showHint && currentPuzzle.hint ? (
              <HintBadge hintText={currentPuzzle.hint} />
            ) : null}

            {currentPuzzle.options.map((optionText, idx) => {
              const isSelected = selectedIndex === idx;
              const isCorrect = idx === currentPuzzle.correctIndex;

              return (
                <AnswerButton
                  key={`pq-opt-${idx}`}
                  disabled={isAnswered}
                  index={idx}
                  isAnswered={isAnswered}
                  isCorrect={isCorrect}
                  isSelected={isSelected}
                  onPress={(selectedIdx) => selectAnswer(selectedIdx)}
                  optionText={optionText}
                />
              );
            })}
          </>
        ) : null}
      </ScrollView>

      {/* Pre-game Difficulty Selector */}
      <DifficultyModal
        onCancel={onReturnHome}
        onSelectDifficulty={handleSelectDifficulty}
        visible={showDifficultyModal}
      />

      {/* Final Results Modal */}
      {sessionResult ? (
        <VictoryModal
          onPlayAgain={() => setShowDifficultyModal(true)}
          onReturnHome={onReturnHome}
          result={{
            score: sessionResult.score,
            totalQuestions: sessionResult.totalPuzzles,
            correctCount: sessionResult.solvedCount,
            wrongCount: sessionResult.incorrectCount,
            accuracy: sessionResult.accuracy,
            xpEarned: sessionResult.xpEarned,
            coinsEarned: sessionResult.coinsEarned,
            highestCombo: sessionResult.highestLogicStreak,
            bestCategory: "General Knowledge",
            victory: true,
          }}
          visible={engine.status === "completed"}
        />
      ) : null}
    </SafeAreaView>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  subStatsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  statPill: {
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
  statLabel: {
    fontSize: typography.fontSize.xs - 1,
    color: themeColors.textMuted,
  },
  statValue: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  streakPill: {
    backgroundColor: colors.accents.emerald.darkBg,
    borderColor: colors.accents.emerald.darkBorder,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  streakText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: colors.accents.emerald.darkText,
  },
  scrollContent: {
    paddingBottom: spacing.xxl + 20,
  },
});