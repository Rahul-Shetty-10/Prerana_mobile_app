import React from "react";
import { useTheme } from "../../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { QuestionItem } from "../../types";
import { AppIcon } from "../../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../../shared/theme";

export interface TrueFalseQuestionProps {
  question: QuestionItem;
  selectedValue?: boolean;
  onSelectValue: (val: boolean) => void;
}

export function TrueFalseQuestion({
  question,
  selectedValue,
  onSelectValue,
}: TrueFalseQuestionProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>
      {question.instructions ? (
        <Text style={styles.instructions}>{question.instructions}</Text>
      ) : null}

      <View style={styles.buttonsRow}>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: selectedValue === true }}
          onPress={() => onSelectValue(true)}
          style={({ pressed }) => [
            styles.tfButton,
            selectedValue === true ? styles.selectedTrue : styles.unselected,
            pressed && styles.pressed,
          ]}
        >
          <AppIcon
            color={selectedValue === true ? colors.status.success : themeColors.textMuted}
            name="checkmark-circle-outline"
            size={24}
          />
          <Text
            style={[
              styles.tfText,
              selectedValue === true ? styles.selectedTrueText : styles.unselectedText,
            ]}
          >
            TRUE
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: selectedValue === false }}
          onPress={() => onSelectValue(false)}
          style={({ pressed }) => [
            styles.tfButton,
            selectedValue === false ? styles.selectedFalse : styles.unselected,
            pressed && styles.pressed,
          ]}
        >
          <AppIcon
            color={selectedValue === false ? colors.status.error : themeColors.textMuted}
            name="close-circle-outline"
            size={24}
          />
          <Text
            style={[
              styles.tfText,
              selectedValue === false ? styles.selectedFalseText : styles.unselectedText,
            ]}
          >
            FALSE
          </Text>
        </Pressable>
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
  buttonsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  tfButton: {
    flex: 1,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs + 2,
  },
  unselected: {
    backgroundColor: themeColors.surfaceSecondary,
    borderColor: themeColors.border,
  },
  selectedTrue: {
    backgroundColor: colors.accents.emerald.darkBg,
    borderColor: colors.status.success,
  },
  selectedFalse: {
    backgroundColor: "#3B1818",
    borderColor: colors.status.error,
  },
  pressed: {
    opacity: 0.82,
  },
  tfText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.8,
  },
  unselectedText: {
    color: themeColors.textSecondary,
  },
  selectedTrueText: {
    color: colors.status.success,
  },
  selectedFalseText: {
    color: colors.status.error,
  },
});