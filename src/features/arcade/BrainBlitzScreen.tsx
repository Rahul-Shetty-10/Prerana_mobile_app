import React, { useEffect, useRef } from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AnswerButton,
  DefeatModal,
  GameHeader,
  ProgressBar,
  QuestionCard,
  VictoryModal,
} from "./components";
import { useActiveLearningTracker } from "../../shared/hooks/useActiveLearningTracker";
import { useArcadeProfile, useBrainBlitz } from "./hooks";
import { colors, spacing } from "../../shared/theme";

export interface BrainBlitzScreenProps {
  onReturnHome: () => void;
}

export function BrainBlitzScreen({
  onReturnHome,
}: BrainBlitzScreenProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const { recordGameResult } = useArcadeProfile();
  const {
    engine,
    timer,
    questions,
    currentQuestion,
    currentIndex,
    selectedIndex,
    isAnswered,
    sessionResult,
    startSession,
    selectAnswer,
  } = useBrainBlitz();

  useEffect(() => {
    startSession();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        onReturnHome();
      };
    }, [onReturnHome])
  );

  const recordGameResultRef = useRef(recordGameResult);
  useEffect(() => {
    recordGameResultRef.current = recordGameResult;
  }, [recordGameResult]);
  const isFocused = useIsFocused();
  useActiveLearningTracker();

  // Persist session profile stats on completion
  useEffect(() => {
    if (sessionResult) {
      recordGameResultRef.current({
        xpEarned: sessionResult.xpEarned,
        coinsEarned: sessionResult.coinsEarned,
        correctAnswers: sessionResult.correctCount,
        totalQuestions: sessionResult.totalQuestions,
        score: sessionResult.score,
      });
    }
  }, [sessionResult]);

  const totalQuestions = questions.length || 10;
  const progress = (currentIndex + 1) / totalQuestions;

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      {/* Top Game Header */}
      <GameHeader
        combo={engine.combo}
        lives={engine.lives}
        maxLives={engine.maxLives}
        onBackPress={onReturnHome}
        score={engine.score}
        timeLeft={timer.timeLeft}
        title="Brain Blitz"
        totalTime={15}
      />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {currentQuestion ? (
          <>
            {/* Question Card */}
            <QuestionCard
              category={currentQuestion.category}
              difficulty={currentQuestion.difficulty}
              questionNumber={currentIndex + 1}
              questionText={currentQuestion.question}
              totalQuestions={totalQuestions}
            />

            {/* Answer Option Buttons */}
            {currentQuestion.options.map((optionText, idx) => {
              const isSelected = selectedIndex === idx;
              const isCorrect = idx === currentQuestion.correctIndex;

              return (
                <AnswerButton
                  key={`${currentQuestion.id}-opt-${idx}`}
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

      {/* Victory Result Modal */}
      {sessionResult && sessionResult.victory ? (
        <VictoryModal
          onPlayAgain={startSession}
          onReturnHome={onReturnHome}
          result={sessionResult}
          visible={engine.status === "completed"}
        />
      ) : null}

      {/* Defeat / Game Over Result Modal */}
      {sessionResult && !sessionResult.victory ? (
        <DefeatModal
          onPlayAgain={startSession}
          onReturnHome={onReturnHome}
          result={sessionResult}
          visible={engine.status === "game_over"}
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
  scrollContent: {
    paddingBottom: spacing.xxl + 20,
  },
});