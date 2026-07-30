import React, { useEffect, useState } from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AnswerButton,
  ComboBadge,
  DifficultyModal,
  GameHeader,
  LightningQuestionCard,
  ProgressBar,
  VictoryModal,
} from "./components";
import { useArcadeProfile, useLightningTap } from "./hooks";
import { LightningDifficulty } from "./types";
import { colors, radius, spacing, typography } from "../../shared/theme";

export interface LightningTapScreenProps {
  onReturnHome: () => void;
}

export function LightningTapScreen({
  onReturnHome,
}: LightningTapScreenProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const { recordGameResult } = useArcadeProfile();
  const [showDifficultyModal, setShowDifficultyModal] = useState(true);

  const {
    engine,
    timer,
    difficulty,
    currentQuestion,
    currentIndex,
    selectedIndex,
    isAnswered,
    isUrgent,
    sessionResult,
    startSession,
    selectAnswer,
  } = useLightningTap("Medium");

  useEffect(() => {
    setShowDifficultyModal(true);
  }, []);

  // Record profile stats on game completion
  useEffect(() => {
    if (sessionResult) {
      recordGameResult({
        xpEarned: sessionResult.xpEarned,
        coinsEarned: sessionResult.coinsEarned,
        correctAnswers: sessionResult.correctCount,
        totalQuestions: sessionResult.totalAnswered,
        score: sessionResult.score,
      });
    }
  }, [sessionResult, recordGameResult]);

  const handleSelectDifficulty = (selectedDifficulty: string) => {
    setShowDifficultyModal(false);
    startSession(selectedDifficulty as LightningDifficulty);
  };

  const timeProgress = timer.timeLeft / 60;

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      {/* Top Game Header */}
      <GameHeader
        combo={engine.combo}
        onBackPress={onReturnHome}
        score={engine.score}
        timeLeft={timer.timeLeft}
        title={`Lightning Tap (${difficulty})`}
        totalTime={60}
      />

      {/* 60s Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar
          color={isUrgent ? colors.status.error : colors.accents.amber.text}
          progress={timeProgress}
        />
      </View>

      {/* Urgency Warning Banner */}
      {isUrgent ? (
        <View style={styles.urgencyBanner}>
          <Text style={styles.urgencyText}>⚡ FINAL 10 SECONDS! TAP FAST!</Text>
        </View>
      ) : null}

      {/* Sub-bar: Answered & Combo Badge */}
      <View style={styles.subStatsBar}>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>Answered:</Text>
          <Text style={styles.statValue}>
            {engine.correctAnswers + engine.wrongAnswers}
          </Text>
        </View>

        <ComboBadge combo={engine.combo} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {currentQuestion ? (
          <>
            <LightningQuestionCard
              isUrgent={isUrgent}
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalAnswered={engine.correctAnswers + engine.wrongAnswers}
            />

            {currentQuestion.options.map((optionText, idx) => {
              const isSelected = selectedIndex === idx;
              const isCorrect = idx === currentQuestion.correctIndex;

              return (
                <AnswerButton
                  key={`lt-opt-${idx}`}
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
            totalQuestions: sessionResult.totalAnswered,
            correctCount: sessionResult.correctCount,
            wrongCount: sessionResult.wrongCount,
            accuracy: sessionResult.accuracy,
            xpEarned: sessionResult.xpEarned,
            coinsEarned: sessionResult.coinsEarned,
            highestCombo: sessionResult.highestCombo,
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
  urgencyBanner: {
    backgroundColor: "#3B1818",
    borderWidth: 1,
    borderColor: colors.status.error,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: spacing.md,
    borderRadius: radius.xs,
    marginBottom: spacing.xs,
  },
  urgencyText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: colors.status.error,
    letterSpacing: 0.5,
  },
  subStatsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
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
  scrollContent: {
    paddingBottom: spacing.xxl + 20,
  },
});