import React from "react";
import { useTheme } from "../../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MCQOption, QuestionItem } from "../../types";
import { AppIcon } from "../../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../../shared/theme";

export interface MCQQuestionProps {
  question: QuestionItem;
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
}

export function MCQQuestion({
  question,
  selectedOptionId,
  onSelectOption,
}: MCQQuestionProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const options = question.mcqOptions || [];

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>
      {question.instructions ? (
        <Text style={styles.instructions}>{question.instructions}</Text>
      ) : null}

      <View style={styles.optionsList}>
        {options.map((option: MCQOption) => {
          const isSelected = selectedOptionId === option.id;

          return (
            <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              onPress={() => onSelectOption(option.id)}
              style={({ pressed }) => [
                styles.optionCard,
                isSelected ? styles.selectedOptionCard : styles.unselectedOptionCard,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.labelBadge,
                  isSelected ? styles.selectedLabelBadge : styles.unselectedLabelBadge,
                ]}
              >
                <Text
                  style={[
                    styles.labelText,
                    isSelected ? styles.selectedLabelText : styles.unselectedLabelText,
                  ]}
                >
                  {option.label}
                </Text>
              </View>

              <Text
                style={[
                  styles.optionText,
                  isSelected ? styles.selectedOptionText : styles.unselectedOptionText,
                ]}
              >
                {option.text}
              </Text>

              <View style={styles.radioShell}>
                <AppIcon
                  color={isSelected ? colors.primary.main : themeColors.textMuted}
                  name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                  size={20}
                />
              </View>
            </Pressable>
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
  optionsList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  unselectedOptionCard: {
    backgroundColor: themeColors.surfaceSecondary,
    borderColor: themeColors.border,
  },
  selectedOptionCard: {
    backgroundColor: themeColors.surfaceHighlighted,
    borderColor: colors.primary.light,
  },
  pressed: {
    opacity: 0.85,
  },
  labelBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  unselectedLabelBadge: {
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  selectedLabelBadge: {
    backgroundColor: colors.primary.main,
  },
  labelText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
  },
  unselectedLabelText: {
    color: themeColors.textSecondary,
  },
  selectedLabelText: {
    color: colors.primary.contrastText,
  },
  optionText: {
    flex: 1,
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.md,
  },
  unselectedOptionText: {
    color: themeColors.textPrimary,
  },
  selectedOptionText: {
    color: colors.primary.light,
  },
  radioShell: {
    marginLeft: spacing.xxs,
  },
});