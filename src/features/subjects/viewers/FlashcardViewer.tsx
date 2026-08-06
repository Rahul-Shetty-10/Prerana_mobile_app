import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { Badge, Button } from "../../../shared/components";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
import { ContentComingSoon } from "./ContentComingSoon";
// ─── Types ──────────────────────────────────────────────────────────────────

interface FlashcardItem {
  id: string;
  frontText: string;
  backText: string;
}

export interface FlashcardViewerProps {
  currentIndex: number;
  onIndexChange: (index: number) => void;
  flashcards?: FlashcardItem[];
}

// ─── CSV Parser ──────────────────────────────────────────────────────────────
// Handles quoted fields containing commas and newlines

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // Handle escaped double-quote inside quoted field
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseFlashcardCSV(csvText: string): FlashcardItem[] {
  const lines = csvText.split("\n");
  const cards: FlashcardItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/\r$/, "").trim();
    if (!line) continue;

    const fields = parseCSVLine(line);
    const front = fields[0] || "";
    const back = fields[1] || "";

    if (front && back) {
      cards.push({ id: `fc-${i}`, frontText: front, backText: back });
    }
  }

  return cards;
}

// ─── Shuffle helper ─────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FlashcardViewer({ currentIndex, onIndexChange, flashcards }: FlashcardViewerProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);


  const [originalCards, setOriginalCards] = useState<FlashcardItem[]>([]);
  const [displayCards, setDisplayCards] = useState<FlashcardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShuffled, setIsShuffled] = useState(false);
  const [difficultIds, setDifficultIds] = useState<Set<string>>(new Set());
  const [isFlipped, setIsFlipped] = useState(false);
  const [showOnlyDifficult, setShowOnlyDifficult] = useState(false);

  // Animated flip value: 0 = front, 1 = back
  const flipAnim = useRef(new Animated.Value(0)).current;

  // ── Load CSV ──────────────────────────────────────────────────────────────

  useEffect(() => {
    // If backend explicitly provided flashcards (even empty array), use them.
    // If backend provided NO flashcards (undefined), show Coming Soon — do NOT load local mock.
    if (flashcards !== undefined) {
      setOriginalCards(flashcards);
      setDisplayCards(flashcards);
      setIsLoading(false);
      return;
    }
    // flashcards === undefined means backend has no data for this chapter.
    // Do NOT fall back to local mock CSV — just mark loading done.
    setIsLoading(false);
  }, [flashcards]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const activeCards = showOnlyDifficult
    ? displayCards.filter((c) => difficultIds.has(c.id))
    : displayCards;

  const totalCards = activeCards.length;
  const safeIndex = Math.min(currentIndex, Math.max(totalCards - 1, 0));
  const currentCard = activeCards[safeIndex] || null;
  const isCurrentDifficult = currentCard ? difficultIds.has(currentCard.id) : false;
  const progressPercent = totalCards > 0 ? ((safeIndex + 1) / totalCards) * 100 : 0;

  // ── Flip animation ────────────────────────────────────────────────────────

  const animateFlip = useCallback(
    (toFlipped: boolean) => {
      Animated.spring(flipAnim, {
        toValue: toFlipped ? 1 : 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
      setIsFlipped(toFlipped);
    },
    [flipAnim]
  );

  const handleFlip = () => animateFlip(!isFlipped);

  // ── Navigation ────────────────────────────────────────────────────────────

  const navigateTo = (index: number) => {
    animateFlip(false);
    onIndexChange(index);
  };

  const handlePrev = () => {
    if (safeIndex > 0) navigateTo(safeIndex - 1);
  };

  const handleNext = () => {
    if (safeIndex < totalCards - 1) navigateTo(safeIndex + 1);
  };

  // ── Swipe ─────────────────────────────────────────────────────────────────

  let touchStartX = 0;
  const handleTouchStart = (e: any) => {
    touchStartX = e.nativeEvent.pageX;
  };
  const handleTouchEnd = (e: any) => {
    const diff = e.nativeEvent.pageX - touchStartX;
    if (diff > 60) handlePrev();
    else if (diff < -60) handleNext();
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleShuffle = () => {
    const shuffled = shuffleArray(showOnlyDifficult ? displayCards.filter(c => difficultIds.has(c.id)) : displayCards);
    setDisplayCards(shuffled);
    setIsShuffled(true);
    animateFlip(false);
    onIndexChange(0);
  };

  const handleRestore = () => {
    setDisplayCards(originalCards);
    setIsShuffled(false);
    setShowOnlyDifficult(false);
    animateFlip(false);
    onIndexChange(0);
  };

  const handleRestart = () => {
    animateFlip(false);
    onIndexChange(0);
  };

  const handleToggleDifficult = () => {
    if (!currentCard) return;
    setDifficultIds((prev) => {
      const next = new Set(prev);
      if (next.has(currentCard.id)) {
        next.delete(currentCard.id);
      } else {
        next.add(currentCard.id);
      }
      return next;
    });
  };

  const handleToggleShowDifficult = () => {
    setShowOnlyDifficult((prev) => {
      const next = !prev;
      onIndexChange(0);
      animateFlip(false);
      return next;
    });
  };

  // ── Flip interpolations ───────────────────────────────────────────────────

  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0.4, 0.6],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0.4, 0.6],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // ── Render ────────────────────────────────────────────────────────────────

  // Backend provided no data for this resource type
  if (flashcards === undefined && !isLoading) {
    return (
      <ContentComingSoon
        icon="albums-outline"
        title="Flashcards Coming Soon"
        message="Flashcards for this chapter are being prepared. Check back soon!"
      />
    );
  }

  return (
    <View style={styles.card}>
      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Badge label="FLASHCARDS" variant="primary" />
          {difficultIds.size > 0 && (
            <Badge label={`${difficultIds.size} Difficult`} variant="accent" />
          )}
        </View>
        <Text style={styles.progressText}>
          {totalCards > 0 ? `${safeIndex + 1} / ${totalCards}` : "0 / 0"}
        </Text>
      </View>

      {/* ── Progress Bar ── */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` as any }]} />
      </View>

      {/* ── Body ── */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color={colors.primary.main} size="small" />
          <Text style={styles.hintText}>Loading flashcard deck...</Text>
        </View>
      ) : activeCards.length === 0 ? (
        <View style={styles.centerContainer}>
          <AppIcon color={themeColors.textMuted} name="layers-outline" size={36} />
          <Text style={styles.emptyTitle}>
            {showOnlyDifficult ? "No difficult cards marked yet." : "No flashcards found."}
          </Text>
          {showOnlyDifficult && (
            <TouchableOpacity onPress={() => setShowOnlyDifficult(false)} style={styles.outlineBtn}>
              <Text style={styles.outlineBtnText}>Show All Cards</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : currentCard ? (
        <>
          {/* ── Flip Card ── */}
          <View
            style={styles.cardShell}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Front face */}
            <Animated.View
              style={[
                styles.cardFace,
                styles.cardFront,
                {
                  transform: [{ perspective: 1000 }, { rotateY: frontRotateY }],
                  opacity: frontOpacity,
                },
              ]}
            >
              <Pressable onPress={handleFlip} style={styles.cardInner}>
                <View style={styles.faceBadgeRow}>
                  <Badge label="QUESTION" variant="dark" />
                  <AppIcon
                    color={isDark ? colors.primary.light : colors.primary.main}
                    name="repeat-outline"
                    size={16}
                  />
                </View>
                <ScrollView
                  contentContainerStyle={styles.cardTextContainer}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.cardText}>{currentCard.frontText}</Text>
                </ScrollView>
                <Text style={styles.tapHint}>Tap to reveal answer</Text>
              </Pressable>
            </Animated.View>

            {/* Back face */}
            <Animated.View
              style={[
                styles.cardFace,
                styles.cardBack,
                {
                  transform: [{ perspective: 1000 }, { rotateY: backRotateY }],
                  opacity: backOpacity,
                },
              ]}
            >
              <Pressable onPress={handleFlip} style={styles.cardInner}>
                <View style={styles.faceBadgeRow}>
                  <Badge label="ANSWER" variant="secondary" />
                  <AppIcon
                    color={isDark ? colors.primary.light : colors.primary.main}
                    name="checkmark-circle-outline"
                    size={16}
                  />
                </View>
                <ScrollView
                  contentContainerStyle={styles.cardTextContainer}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.cardText}>{currentCard.backText}</Text>
                </ScrollView>
                <Text style={styles.tapHint}>Tap to see question</Text>
              </Pressable>
            </Animated.View>
          </View>

          {/* ── Action Row ── */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={handleToggleDifficult}
              style={[
                styles.iconActionBtn,
                isCurrentDifficult && styles.iconActionBtnActive,
              ]}
            >
              <AppIcon
                color={isCurrentDifficult ? colors.primary.main : themeColors.textMuted}
                name={isCurrentDifficult ? "star" : "star-outline"}
                size={18}
              />
              <Text
                style={[
                  styles.iconActionLabel,
                  isCurrentDifficult && { color: colors.primary.main },
                ]}
              >
                Difficult
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleFlip} style={styles.iconActionBtn}>
              <AppIcon color={themeColors.textSecondary} name="repeat-outline" size={18} />
              <Text style={styles.iconActionLabel}>Flip</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRestart} style={styles.iconActionBtn}>
              <AppIcon color={themeColors.textSecondary} name="refresh-outline" size={18} />
              <Text style={styles.iconActionLabel}>Restart</Text>
            </TouchableOpacity>
          </View>

          {/* ── Navigation ── */}
          <View style={styles.navRow}>
            <Button
              disabled={safeIndex === 0}
              iconName="arrow-back-outline"
              onPress={handlePrev}
              style={styles.navBtn}
              title="Prev"
              variant="secondary"
            />
            <Button
              disabled={safeIndex === totalCards - 1}
              iconName="arrow-forward-outline"
              onPress={handleNext}
              style={styles.navBtn}
              title="Next"
              variant="primary"
            />
          </View>
        </>
      ) : null}

      {/* ── Deck Controls ── */}
      <View style={styles.deckControlsRow}>
        <TouchableOpacity onPress={handleShuffle} style={styles.deckBtn}>
          <AppIcon color={themeColors.textSecondary} name="shuffle-outline" size={15} />
          <Text style={styles.deckBtnText}>Shuffle</Text>
        </TouchableOpacity>

        {isShuffled && (
          <TouchableOpacity onPress={handleRestore} style={styles.deckBtn}>
            <AppIcon color={themeColors.textSecondary} name="list-outline" size={15} />
            <Text style={styles.deckBtnText}>Original Order</Text>
          </TouchableOpacity>
        )}

        {difficultIds.size > 0 && (
          <TouchableOpacity
            onPress={handleToggleShowDifficult}
            style={[styles.deckBtn, showOnlyDifficult && styles.deckBtnHighlighted]}
          >
            <AppIcon
              color={showOnlyDifficult ? colors.primary.main : themeColors.textSecondary}
              name="star-outline"
              size={15}
            />
            <Text
              style={[
                styles.deckBtnText,
                showOnlyDifficult && { color: colors.primary.main },
              ]}
            >
              {showOnlyDifficult ? "All Cards" : `${difficultIds.size} Difficult`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const getStyles = (themeColors: any, isDark: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: themeColors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: themeColors.border,
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      ...shadows.sm,
      overflow: "hidden",
      paddingBottom: spacing.md,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.xs,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    progressText: {
      fontSize: typography.fontSize.xs + 1,
      fontWeight: typography.fontWeight.bold,
      color: isDark ? colors.primary.light : colors.primary.main,
    },
    progressTrack: {
      height: 3,
      backgroundColor: themeColors.surfaceSecondary,
      marginHorizontal: spacing.md,
      borderRadius: radius.full,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.primary.main,
      borderRadius: radius.full,
    },
    centerContainer: {
      paddingVertical: spacing.xxl,
      paddingHorizontal: spacing.lg,
      alignItems: "center",
      gap: spacing.sm,
    },
    emptyTitle: {
      fontSize: typography.fontSize.sm + 1,
      fontWeight: typography.fontWeight.heavy,
      color: themeColors.textPrimary,
      textAlign: "center",
    },
    outlineBtn: {
      borderWidth: 1,
      borderColor: colors.primary.main,
      borderRadius: radius.button,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      marginTop: spacing.xs,
    },
    outlineBtnText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary.main,
    },
    // Flip card shell
    cardShell: {
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      height: 240,
      position: "relative",
    },
    cardFace: {
      position: "absolute",
      width: "100%",
      height: "100%",
      borderRadius: radius.lg,
      borderWidth: 1.5,
      overflow: "hidden",
      backfaceVisibility: "hidden",
    },
    cardFront: {
      backgroundColor: themeColors.surfaceSecondary,
      borderColor: themeColors.border,
    },
    cardBack: {
      backgroundColor: themeColors.surfaceHighlighted,
      borderColor: isDark ? colors.primary.light : colors.primary.main,
    },
    cardInner: {
      flex: 1,
      padding: spacing.md,
      alignItems: "center",
      justifyContent: "space-between",
    },
    faceBadgeRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardTextContainer: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.sm,
    },
    cardText: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.heavy,
      color: themeColors.textPrimary,
      textAlign: "center",
      lineHeight: typography.lineHeight.md + 4,
    },
    tapHint: {
      fontSize: typography.fontSize.xs - 1,
      color: themeColors.textMuted,
      fontStyle: "italic",
    },
    // Action row (star, flip, restart)
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.md,
      marginHorizontal: spacing.md,
      gap: spacing.sm,
    },
    iconActionBtn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: themeColors.border,
      backgroundColor: themeColors.surfaceSecondary,
      gap: 3,
    },
    iconActionBtnActive: {
      borderColor: isDark ? colors.primary.light : colors.primary.main,
      backgroundColor: themeColors.surfaceHighlighted,
    },
    iconActionLabel: {
      fontSize: typography.fontSize.xs - 1,
      fontWeight: typography.fontWeight.bold,
      color: themeColors.textMuted,
    },
    // Navigation row
    navRow: {
      flexDirection: "row",
      gap: spacing.xs,
      marginHorizontal: spacing.md,
      marginTop: spacing.sm,
    },
    navBtn: {
      flex: 1,
    },
    // Deck controls
    deckControlsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      marginTop: spacing.sm,
      marginHorizontal: spacing.md,
    },
    deckBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 5,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: themeColors.borderSubtle,
      backgroundColor: themeColors.surfaceSecondary,
    },
    deckBtnHighlighted: {
      borderColor: colors.primary.main,
      backgroundColor: themeColors.surfaceHighlighted,
    },
    deckBtnText: {
      fontSize: typography.fontSize.xs - 1,
      fontWeight: typography.fontWeight.bold,
      color: themeColors.textMuted,
    },
    hintText: {
      fontSize: typography.fontSize.xs,
      color: themeColors.textMuted,
    },
  });