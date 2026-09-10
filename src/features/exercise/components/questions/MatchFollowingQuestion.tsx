import React, { useEffect, useState } from "react";
import { useTheme } from "../../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MatchPair, QuestionItem } from "../../types";
import { AppIcon } from "../../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../../shared/theme";
import { getMatchRightItems } from "../../services/matchFollowing";

export interface MatchFollowingQuestionProps {
  question: QuestionItem;
  selectedValue?: Record<string, string>;
  onSelectValue: (value: Record<string, string>) => void;
}

export function MatchFollowingQuestion({
  question,
  selectedValue,
  onSelectValue,
}: MatchFollowingQuestionProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const pairs = question.matchPairs || [];
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [shuffledRightItems, setShuffledRightItems] = useState<Array<{ id: string; text: string }>>([]);

  const currentSelections = selectedValue || {};

  // Shuffle right-side column once per question load
  useEffect(() => {
    const rightItems = getMatchRightItems(pairs);
    const shuffled = [...rightItems];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledRightItems(shuffled);
    setSelectedLeftId(null);
  }, [question.id]);

  const handleLeftPress = (leftId: string) => {
    if (selectedLeftId === leftId) {
      setSelectedLeftId(null);
    } else {
      setSelectedLeftId(leftId);
    }
  };

  const handleRightPress = (rightId: string) => {
    if (!selectedLeftId) return;

    // Overwrite previous matches to this rightId (since 1-to-1 matching is expected)
    const cleanedSelections = { ...currentSelections };
    Object.keys(cleanedSelections).forEach((key) => {
      if (cleanedSelections[key] === rightId) {
        delete cleanedSelections[key];
      }
    });

    const newSelections = {
      ...cleanedSelections,
      [selectedLeftId]: rightId,
    };

    onSelectValue(newSelections);
    setSelectedLeftId(null);
  };

  const handleClearPair = (leftId: string) => {
    const newSelections = { ...currentSelections };
    delete newSelections[leftId];
    onSelectValue(newSelections);
  };

  const handleResetAll = () => {
    onSelectValue({});
    setSelectedLeftId(null);
  };

  // Map index label A, B, C, D to shuffled Column B items
  const getIndexLabel = (idx: number) => String.fromCharCode(65 + idx); // A, B, C...
  const getRightItemLabel = (id: string) => {
    const idx = shuffledRightItems.findIndex((item) => item.id === id);
    return idx >= 0 ? getIndexLabel(idx) : "?";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>
      {question.instructions ? (
        <Text style={styles.instructions}>{question.instructions}</Text>
      ) : null}

      <View style={styles.columnsRow}>
        {/* Left Column (Column A) */}
        <View style={styles.column}>
          <Text style={styles.columnHeader}>Column A</Text>
          <View style={styles.list}>
            {pairs.map((pair, idx) => {
              const isSelected = selectedLeftId === pair.id;
              const matchedRightId = currentSelections[pair.id];
              const isMatched = !!matchedRightId;
              const rightLabel = isMatched ? getRightItemLabel(matchedRightId) : null;

              return (
                <Pressable
                  key={pair.id}
                  onPress={() => handleLeftPress(pair.id)}
                  style={({ pressed }) => [
                    styles.itemCard,
                    isSelected ? styles.selectedCard : styles.unselectedCard,
                    isMatched && !isSelected && styles.matchedCard,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemIndex}>({idx + 1})</Text>
                    {isMatched ? (
                      <View style={styles.matchBadge}>
                        <Text style={styles.matchBadgeText}>➔ [{rightLabel}]</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.itemText}>{pair.leftText}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Right Column (Column B) */}
        <View style={styles.column}>
          <Text style={styles.columnHeader}>Column B</Text>
          <View style={styles.list}>
            {shuffledRightItems.map((item, idx) => {
              const label = getIndexLabel(idx);
              // Check if any left item has matched with this right item
              const matchedLeftKey = Object.keys(currentSelections).find(
                (key) => currentSelections[key] === item.id
              );
              const isMatched = !!matchedLeftKey;
              const matchedLeftIdx = isMatched
                ? pairs.findIndex((p) => p.id === matchedLeftKey)
                : -1;

              return (
                <Pressable
                  key={item.id}
                  disabled={!selectedLeftId}
                  onPress={() => handleRightPress(item.id)}
                  style={({ pressed }) => [
                    styles.itemCard,
                    selectedLeftId ? styles.connectableCard : styles.unconnectableCard,
                    isMatched && styles.matchedCard,
                    pressed && selectedLeftId && styles.pressed,
                  ]}
                >
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemIndex}>[{label}]</Text>
                    {isMatched ? (
                      <View style={styles.matchBadge}>
                        <Text style={styles.matchBadgeText}>Matched ({matchedLeftIdx + 1})</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.itemText}>{item.text}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Selected Pairs Summary */}
      {Object.keys(currentSelections).length > 0 ? (
        <View style={styles.summarySection}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Established Connections</Text>
            <Pressable onPress={handleResetAll} style={styles.resetBtn}>
              <Text style={styles.resetBtnText}>Reset All</Text>
            </Pressable>
          </View>
          <View style={styles.summaryList}>
            {Object.keys(currentSelections).map((leftId) => {
              const leftPair = pairs.find((p) => p.id === leftId);
              const rightId = currentSelections[leftId];
              const rightItem = shuffledRightItems.find((item) => item.id === rightId);
              if (!leftPair || !rightItem) return null;

              return (
                <View key={leftId} style={styles.summaryRow}>
                  <Text style={styles.summaryRowText} numberOfLines={2}>
                    <Text style={styles.boldText}>{leftPair.leftText}</Text> ➔ {rightItem.text}
                  </Text>
                  <Pressable
                    accessibilityLabel="Delete Pair"
                    onPress={() => handleClearPair(leftId)}
                    style={styles.deleteBtn}
                  >
                    <AppIcon color={colors.status.error} name="trash-outline" size={16} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      ) : selectedLeftId ? (
        <Text style={styles.hintText}>💡 Tap a description in Column B to link the selected item.</Text>
      ) : (
        <Text style={styles.hintText}>💡 Tap a term in Column A to begin matching.</Text>
      )}
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  prompt: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    lineHeight: typography.lineHeight.lg,
  },
  instructions: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
  columnsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  column: {
    flex: 1,
    gap: spacing.xs,
  },
  columnHeader: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  list: {
    gap: spacing.xs,
  },
  itemCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    gap: 2,
    minHeight: 48,
    justifyContent: "center",
  },
  unselectedCard: {
    backgroundColor: themeColors.surfaceSecondary,
    borderColor: themeColors.border,
  },
  selectedCard: {
    backgroundColor: themeColors.surfaceHighlighted,
    borderColor: colors.primary.main,
    borderWidth: 2,
  },
  matchedCard: {
    backgroundColor: themeColors.surfaceSecondary,
    borderColor: colors.primary.light + "33",
    opacity: 0.85,
  },
  connectableCard: {
    backgroundColor: themeColors.surfaceSecondary,
    borderColor: colors.primary.light,
  },
  unconnectableCard: {
    backgroundColor: themeColors.surfaceSecondary,
    borderColor: themeColors.border,
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.8,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemIndex: {
    fontSize: typography.fontSize.xs - 1,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textMuted,
  },
  matchBadge: {
    backgroundColor: colors.primary.main + "20",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  matchBadgeText: {
    fontSize: typography.fontSize.xs - 2,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.light,
  },
  itemText: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.semibold,
    color: themeColors.textPrimary,
    lineHeight: typography.lineHeight.sm + 2,
  },
  hintText: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: spacing.xs,
  },
  summarySection: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: themeColors.borderSubtle,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  resetBtn: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.status.error + "44",
  },
  resetBtnText: {
    fontSize: typography.fontSize.xs - 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.status.error,
  },
  summaryList: {
    gap: spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  summaryRowText: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textSecondary,
    flex: 1,
    lineHeight: typography.lineHeight.sm,
  },
  boldText: {
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
});
