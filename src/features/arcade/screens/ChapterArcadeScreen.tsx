import React, { useState } from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { AppIcon } from "../../../shared/icons";
import { Header } from "../../../shared/components/Header";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
import { ChapterWordGames } from "../../subjects/types";
import { ChapterGameType } from "../types";
import {
  CrosswordGameView,
  HangmanGameView,
  MemoryBattleGameView,
  SpeedSniperGameView,
} from "../components";
import { useActiveLearningTracker } from "../../../shared/hooks/useActiveLearningTracker";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface ChapterArcadeScreenProps {
  subjectId: string;
  chapterId: string;
  chapterTitle: string;
  subjectName: string;
  gameType?: ChapterGameType;
  wordGames: ChapterWordGames;
  getToken?: GetToken;
  onBackPress?: () => void;
}

const GAME_META: Record<
  ChapterGameType,
  { label: string; iconName: string; accentColor: string; accentBg: string; description: string }
> = {
  crossword: {
    label: "Crossword",
    iconName: "grid-outline",
    accentColor: colors.primary.main,
    accentBg: colors.accents.coral.bg,
    description: "Fill the grid using clues. Each answer is drawn from chapter content.",
  },
  hangman: {
    label: "Hangman",
    iconName: "text-outline",
    accentColor: colors.accents.amber.text,
    accentBg: colors.accents.amber.bg,
    description: "Guess the chapter keyword letter by letter before running out of chances.",
  },
  memoryBattle: {
    label: "Memory Battle",
    iconName: "duplicate-outline",
    accentColor: colors.accents.blue.text,
    accentBg: colors.accents.blue.bg,
    description: "Match terms with their definitions by flipping pairs of cards.",
  },
  speedSniper: {
    label: "Speed Sniper",
    iconName: "flash-outline",
    accentColor: colors.accents.emerald.text,
    accentBg: colors.accents.emerald.bg,
    description: "Pick the correct answer before the timer runs out. Stay sharp!",
  },
};

function getPuzzlesForGame(wordGames: ChapterWordGames, gameType: ChapterGameType) {
  switch (gameType) {
    case "crossword":   return wordGames.crosswords;
    case "hangman":     return wordGames.hangman;
    case "memoryBattle": return wordGames.memoryBattle;
    case "speedSniper": return wordGames.speedSniper;
  }
}

export function ChapterArcadeScreen({
  subjectId,
  chapterId,
  chapterTitle,
  subjectName,
  gameType,
  wordGames,
  onBackPress,
}: ChapterArcadeScreenProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);
  const navigation = useNavigation<any>();

  const [selectedGameType, setSelectedGameType] = useState<ChapterGameType | null>(gameType || null);
  const [activePuzzleIndex, setActivePuzzleIndex] = useState<number | null>(null);

  useActiveLearningTracker();

  useFocusEffect(
    useCallback(() => {
      return () => {
        setActivePuzzleIndex(null);
      };
    }, [])
  );

  const handleBack = () => {
    if (activePuzzleIndex !== null) {
      setActivePuzzleIndex(null);
    } else if (selectedGameType !== null && !gameType) {
      setSelectedGameType(null);
    } else if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  if (selectedGameType && activePuzzleIndex !== null) {
    const puzzles = getPuzzlesForGame(wordGames, selectedGameType);
    if (puzzles && puzzles[activePuzzleIndex]) {
      const activePuzzle = puzzles[activePuzzleIndex];
      switch (selectedGameType) {
        case "crossword":
          return (
            <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
              <CrosswordGameView
                puzzle={activePuzzle as any}
                chapterTitle={chapterTitle}
                onExit={() => setActivePuzzleIndex(null)}
              />
            </SafeAreaView>
          );
        case "hangman":
          return (
            <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
              <HangmanGameView
                puzzle={activePuzzle as any}
                chapterTitle={chapterTitle}
                onExit={() => setActivePuzzleIndex(null)}
              />
            </SafeAreaView>
          );
        case "memoryBattle":
          return (
            <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
              <MemoryBattleGameView
                puzzle={activePuzzle as any}
                chapterTitle={chapterTitle}
                onExit={() => setActivePuzzleIndex(null)}
              />
            </SafeAreaView>
          );
        case "speedSniper":
          return (
            <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
              <SpeedSniperGameView
                puzzle={activePuzzle as any}
                chapterTitle={chapterTitle}
                onExit={() => setActivePuzzleIndex(null)}
              />
            </SafeAreaView>
          );
      }
    }
  }

  if (selectedGameType) {
    const meta = GAME_META[selectedGameType];
    const puzzles = getPuzzlesForGame(wordGames, selectedGameType) || [];

    return (
      <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
        <Header
          title={meta.label}
          showBackButton={true}
          onBackPress={handleBack}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Chapter context banner */}
          <View style={styles.contextBanner}>
            <Text style={styles.contextSubject}>{subjectName}</Text>
            <Text style={styles.contextChapter}>{chapterTitle}</Text>
          </View>

          {/* Game hero card */}
          <View style={[styles.heroCard, { borderColor: meta.accentColor + "33" }]}>
            <View style={[styles.heroIconShell, { backgroundColor: isDark ? themeColors.surfaceSecondary : meta.accentBg }]}>
              <AppIcon color={meta.accentColor} name={meta.iconName as any} size={32} />
            </View>
            <Text style={[styles.heroTitle, { color: meta.accentColor }]}>{meta.label}</Text>
            <Text style={styles.heroDescription}>{meta.description}</Text>
            <View style={styles.heroPillRow}>
              <View style={styles.heroPill}>
                <AppIcon color={themeColors.textMuted} name="layers-outline" size={13} />
                <Text style={styles.heroPillText}>{puzzles.length} {puzzles.length === 1 ? "puzzle" : "puzzles"}</Text>
              </View>
              <View style={styles.heroPill}>
                <AppIcon color={themeColors.textMuted} name="school-outline" size={13} />
                <Text style={styles.heroPillText}>Chapter content</Text>
              </View>
            </View>
          </View>

          {/* Difficulty level cards */}
          <Text style={styles.difficultyLabel}>Available Difficulties</Text>
          {(puzzles as Array<{ difficulty?: string }>).map((puzzle, index) => {
            const diff = puzzle.difficulty ?? `Puzzle ${index + 1}`;
            const diffLabel = typeof diff === "string"
              ? diff.charAt(0).toUpperCase() + diff.slice(1)
              : `Set ${index + 1}`;
            return (
              <Pressable
                key={index}
                onPress={() => setActivePuzzleIndex(index)}
                style={({ pressed }) => [
                  styles.difficultyCard,
                  pressed && { backgroundColor: themeColors.surfaceSecondary },
                ]}
              >
                <View style={styles.difficultyRow}>
                  <View style={[styles.difficultyDot, { backgroundColor: meta.accentColor }]} />
                  <Text style={styles.difficultyName}>{diffLabel}</Text>
                </View>
                <View style={[styles.comingSoonBadge, { borderColor: meta.accentColor + "88", backgroundColor: isDark ? "#2A1515" : meta.accentBg }]}>
                  <Text style={[styles.comingSoonText, { color: meta.accentColor }]}>Play</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Game Selection Screen
  const availableGames: ChapterGameType[] = [];
  if (wordGames.crosswords && wordGames.crosswords.length > 0) availableGames.push("crossword");
  if (wordGames.hangman && wordGames.hangman.length > 0) availableGames.push("hangman");
  if (wordGames.memoryBattle && wordGames.memoryBattle.length > 0) availableGames.push("memoryBattle");
  if (wordGames.speedSniper && wordGames.speedSniper.length > 0) availableGames.push("speedSniper");

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <Header
        title="Chapter Arcade"
        showBackButton={true}
        onBackPress={handleBack}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contextBanner}>
          <Text style={styles.contextSubject}>{subjectName}</Text>
          <Text style={styles.contextChapter}>{chapterTitle}</Text>
        </View>

        <Text style={[styles.difficultyLabel, { marginTop: spacing.md }]}>Select a Game</Text>
        {availableGames.map((gt) => {
          const meta = GAME_META[gt];
          return (
            <Pressable
              key={gt}
              onPress={() => setSelectedGameType(gt)}
              style={({ pressed }) => [
                styles.heroCard,
                {
                  borderColor: meta.accentColor + "55",
                  flexDirection: "row",
                  padding: spacing.md,
                  gap: spacing.md,
                },
                pressed && { backgroundColor: themeColors.surfaceSecondary },
              ]}
            >
              <View style={[styles.heroIconShell, { width: 48, height: 48, marginBottom: 0, backgroundColor: isDark ? themeColors.surfaceSecondary : meta.accentBg }]}>
                <AppIcon color={meta.accentColor} name={meta.iconName as any} size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.heroTitle, { fontSize: typography.fontSize.lg, color: meta.accentColor }]}>{meta.label}</Text>
                <Text style={[styles.heroDescription, { textAlign: "left" }]} numberOfLines={2}>{meta.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (themeColors: any, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    scrollContent: {
      paddingBottom: spacing.xxl + 20,
      paddingTop: spacing.sm,
    },
    contextBanner: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: 2,
    },
    contextSubject: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.heavy,
      color: colors.primary.main,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    contextChapter: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.heavy,
      color: themeColors.textPrimary,
    },
    heroCard: {
      marginHorizontal: spacing.md,
      marginTop: spacing.xs,
      marginBottom: spacing.md,
      backgroundColor: themeColors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      padding: spacing.lg,
      alignItems: "center",
      gap: spacing.xs,
      ...shadows.sm,
    },
    heroIconShell: {
      width: 64,
      height: 64,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.xs,
    },
    heroTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.heavy,
    },
    heroDescription: {
      fontSize: typography.fontSize.sm,
      color: themeColors.textSecondary,
      textAlign: "center",
      lineHeight: typography.lineHeight.md,
    },
    heroPillRow: {
      flexDirection: "row",
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    heroPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: themeColors.surfaceSecondary,
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    heroPillText: {
      fontSize: typography.fontSize.xs,
      color: themeColors.textMuted,
    },
    difficultyLabel: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.heavy,
      color: themeColors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginHorizontal: spacing.md,
      marginBottom: spacing.xs,
    },
    difficultyCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginHorizontal: spacing.md,
      marginBottom: spacing.xs,
      backgroundColor: themeColors.surface,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: themeColors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
    },
    difficultyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    difficultyDot: {
      width: 8,
      height: 8,
      borderRadius: radius.full,
    },
    difficultyName: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: themeColors.textPrimary,
    },
    comingSoonBadge: {
      borderWidth: 1,
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    comingSoonText: {
      fontSize: typography.fontSize.xs - 1,
      fontWeight: typography.fontWeight.medium,
    },
    placeholderNotice: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      backgroundColor: themeColors.surfaceSecondary,
      borderRadius: radius.sm,
      padding: spacing.md,
    },
    placeholderText: {
      flex: 1,
      fontSize: typography.fontSize.xs + 1,
      color: themeColors.textMuted,
      lineHeight: typography.lineHeight.sm + 4,
    },
  });
