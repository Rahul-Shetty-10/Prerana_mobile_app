import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DifficultyModal,
  GameHeader,
  MemoryGrid,
  ProgressBar,
  VictoryModal,
} from "./components";
import { useArcadeProfile, useMatchMaster } from "./hooks";
import { MatchDifficulty } from "./types";
import { colors, radius, spacing, typography } from "../../shared/theme";

export interface MatchMasterScreenProps {
  onReturnHome: () => void;
}

export function MatchMasterScreen({
  onReturnHome,
}: MatchMasterScreenProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const { recordGameResult } = useArcadeProfile();
  const [showDifficultyModal, setShowDifficultyModal] = useState(true);

  const {
    engine,
    difficulty,
    cards,
    moves,
    matchedPairs,
    totalPairs,
    elapsedTime,
    isProcessing,
    sessionResult,
    startSession,
    flipCard,
  } = useMatchMaster("Easy");

  // Show difficulty modal on load
  useEffect(() => {
    setShowDifficultyModal(true);
  }, []);

  const recordGameResultRef = useRef(recordGameResult);
  useEffect(() => { recordGameResultRef.current = recordGameResult; }, [recordGameResult]);

  // Persist game results to profile on victory
  useEffect(() => {
    if (sessionResult && sessionResult.victory) {
      recordGameResultRef.current({
        xpEarned: sessionResult.xpEarned,
        coinsEarned: sessionResult.coinsEarned,
        correctAnswers: sessionResult.matchedPairs,
        totalQuestions: sessionResult.moves,
        score: sessionResult.score,
      });
    }
  }, [sessionResult]);

  const handleSelectDifficulty = (selectedDifficulty: MatchDifficulty) => {
    setShowDifficultyModal(false);
    startSession(selectedDifficulty);
  };

  const progress = totalPairs > 0 ? matchedPairs / totalPairs : 0;

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      {/* Top Game Header */}
      <GameHeader
        combo={engine.combo}
        onBackPress={onReturnHome}
        score={engine.score}
        timeLeft={elapsedTime}
        title={`Match Master (${difficulty})`}
      />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar color={colors.accents.purple.text} progress={progress} />
      </View>

      {/* Sub-bar Stats: Moves & Remaining Pairs */}
      <View style={styles.subStatsBar}>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>Moves:</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>

        <View style={styles.statPill}>
          <Text style={styles.statLabel}>Matched:</Text>
          <Text style={[styles.statValue, { color: colors.status.success }]}>
            {matchedPairs} / {totalPairs}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card Grid */}
        <MemoryGrid
          cards={cards}
          disabled={isProcessing || engine.status !== "playing"}
          onCardPress={(card) => flipCard(card)}
        />
      </ScrollView>

      {/* Pre-game Difficulty Modal */}
      <DifficultyModal
        onCancel={onReturnHome}
        onSelectDifficulty={handleSelectDifficulty}
        visible={showDifficultyModal}
      />

      {/* Victory Result Modal */}
      {sessionResult && sessionResult.victory ? (
        <VictoryModal
          onPlayAgain={() => setShowDifficultyModal(true)}
          onReturnHome={onReturnHome}
          result={{
            score: sessionResult.score,
            totalQuestions: sessionResult.totalPairs,
            correctCount: sessionResult.matchedPairs,
            wrongCount: sessionResult.moves - sessionResult.matchedPairs,
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
  subStatsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
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