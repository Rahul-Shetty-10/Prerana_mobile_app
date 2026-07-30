import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AnswerButtonProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../shared/theme";

const OPTION_LETTERS = ["A", "B", "C", "D"];

export function AnswerButton({
  optionText,
  index,
  isSelected,
  isCorrect = false,
  isAnswered,
  disabled = false,
  onPress,
}: AnswerButtonProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  let buttonStyle = styles.defaultButton;
  let letterStyle = styles.defaultLetter;
  let textStyle = styles.defaultText;
  let iconName: any = null;
  let iconColor = themeColors.textPrimary;

  if (isAnswered) {
    if (isCorrect) {
      buttonStyle = styles.correctButton;
      letterStyle = styles.correctLetter;
      textStyle = styles.correctText;
      iconName = "checkmark-circle";
      iconColor = colors.status.success;
    } else if (isSelected) {
      buttonStyle = styles.wrongButton;
      letterStyle = styles.wrongLetter;
      textStyle = styles.wrongText;
      iconName = "close-circle";
      iconColor = colors.status.error;
    } else {
      buttonStyle = styles.disabledButton;
    }
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || isAnswered}
      onPress={() => onPress(index)}
      style={({ pressed }) => [
        styles.buttonBase,
        buttonStyle,
        pressed && !isAnswered && styles.pressed,
      ]}
    >
      <View style={[styles.letterShell, letterStyle]}>
        <Text style={styles.letterText}>{OPTION_LETTERS[index] || index + 1}</Text>
      </View>

      <Text style={[styles.optionText, textStyle]}>{optionText}</Text>

      {iconName ? <AppIcon color={iconColor} name={iconName} size={20} /> : null}
    </Pressable>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  buttonBase: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    gap: spacing.sm,
  },
  defaultButton: {
    backgroundColor: themeColors.surfaceSecondary,
    borderColor: themeColors.borderSubtle,
  },
  correctButton: {
    backgroundColor: "#0D3320",
    borderColor: colors.status.success,
  },
  wrongButton: {
    backgroundColor: "#3B1818",
    borderColor: colors.status.error,
  },
  disabledButton: {
    backgroundColor: themeColors.surfaceSecondary,
    borderColor: themeColors.borderSubtle,
    opacity: 0.5,
  },
  pressed: {
    backgroundColor: themeColors.surfaceHighlighted,
  },
  letterShell: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  defaultLetter: {
    backgroundColor: themeColors.surfaceHighlighted,
  },
  correctLetter: {
    backgroundColor: colors.status.success,
  },
  wrongLetter: {
    backgroundColor: colors.status.error,
  },
  letterText: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  defaultText: {
    color: themeColors.textPrimary,
  },
  correctText: {
    color: colors.status.success,
  },
  wrongText: {
    color: colors.status.error,
  },
  optionText: {
    flex: 1,
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.sm + 2,
  },
});