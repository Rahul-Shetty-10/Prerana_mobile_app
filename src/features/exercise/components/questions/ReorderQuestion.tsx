import React, { useEffect, useState } from "react";
import { useTheme } from "../../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { QuestionItem } from "../../types";
import { AppIcon } from "../../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../../shared/theme";

export interface ReorderQuestionProps {
  question: QuestionItem;
  selectedValue?: string[];
  onSelectValue: (value: string[]) => void;
}

export function ReorderQuestion({
  question,
  selectedValue,
  onSelectValue,
}: ReorderQuestionProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const reorderItems = question.reorderItems || [];

  const [orderedItems, setOrderedItems] = useState<Array<{ id: string; text: string }>>(() => {
    if (Array.isArray(selectedValue) && selectedValue.length === reorderItems.length) {
      const mapped = selectedValue
        .map((id) => reorderItems.find((item) => item.id === id))
        .filter((item): item is { id: string; text: string } => !!item);
      if (mapped.length === reorderItems.length) {
        return mapped;
      }
    }
    return [...reorderItems];
  });

  // Sync state if question changes
  useEffect(() => {
    if (Array.isArray(selectedValue) && selectedValue.length === reorderItems.length) {
      const mapped = selectedValue
        .map((id) => reorderItems.find((item) => item.id === id))
        .filter((item): item is { id: string; text: string } => !!item);
      if (mapped.length === reorderItems.length) {
        setOrderedItems(mapped);
        return;
      }
    }
    setOrderedItems([...reorderItems]);
  }, [question.id]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...orderedItems];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    setOrderedItems(newItems);
    onSelectValue(newItems.map((item) => item.id));
  };

  const moveDown = (index: number) => {
    if (index === orderedItems.length - 1) return;
    const newItems = [...orderedItems];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    setOrderedItems(newItems);
    onSelectValue(newItems.map((item) => item.id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>
      {question.instructions ? (
        <Text style={styles.instructions}>{question.instructions}</Text>
      ) : null}

      <View style={styles.listContainer}>
        {orderedItems.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === orderedItems.length - 1;

          return (
            <View key={item.id} style={styles.itemRow}>
              {/* Index Number Badge */}
              <View style={styles.indexBadge}>
                <Text style={styles.indexText}>{index + 1}</Text>
              </View>

              {/* Item content */}
              <View style={styles.itemContent}>
                <Text style={styles.itemText}>{item.text}</Text>
              </View>

              {/* Control arrows */}
              <View style={styles.controlsGroup}>
                <Pressable
                  disabled={isFirst}
                  onPress={() => moveUp(index)}
                  style={({ pressed }) => [
                    styles.arrowBtn,
                    isFirst && styles.disabledBtn,
                    pressed && !isFirst && styles.pressed,
                  ]}
                >
                  <AppIcon
                    color={isFirst ? themeColors.textMuted : colors.primary.light}
                    name="chevron-up-outline"
                    size={16}
                  />
                </Pressable>

                <Pressable
                  disabled={isLast}
                  onPress={() => moveDown(index)}
                  style={({ pressed }) => [
                    styles.arrowBtn,
                    isLast && styles.disabledBtn,
                    pressed && !isLast && styles.pressed,
                  ]}
                >
                  <AppIcon
                    color={isLast ? themeColors.textMuted : colors.primary.light}
                    name="chevron-down-outline"
                    size={16}
                  />
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
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
  listContainer: {
    gap: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    gap: spacing.sm,
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: themeColors.surfaceHighlighted,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.heavy,
    color: colors.primary.light,
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: themeColors.textPrimary,
    lineHeight: typography.lineHeight.sm + 4,
  },
  controlsGroup: {
    flexDirection: "row",
    gap: spacing.xxs,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBtn: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
});