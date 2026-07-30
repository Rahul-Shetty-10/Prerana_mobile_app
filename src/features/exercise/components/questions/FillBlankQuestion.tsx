import React from "react";
import { useTheme } from "../../../../shared/theme/ThemeContext";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { QuestionItem } from "../../types";
import { colors, radius, spacing, typography } from "../../../../shared/theme";

export interface FillBlankQuestionProps {
  question: QuestionItem;
  value?: string;
  onChangeValue: (text: string) => void;
}

export function FillBlankQuestion({
  question,
  value,
  onChangeValue,
}: FillBlankQuestionProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>
      {question.instructions ? (
        <Text style={styles.instructions}>{question.instructions}</Text>
      ) : null}

      <View style={styles.inputBlock}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeValue}
          placeholder={question.fillBlankPlaceholder || "Type your answer here..."}
          placeholderTextColor={themeColors.textMuted}
          style={styles.input}
          value={value}
        />
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
  inputBlock: {
    marginTop: spacing.xs,
  },
  input: {
    minHeight: 52,
    backgroundColor: themeColors.inputBackground,
    borderWidth: 1,
    borderColor: themeColors.inputBorder,
    borderRadius: radius.md,
    color: themeColors.textPrimary,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
  },
});