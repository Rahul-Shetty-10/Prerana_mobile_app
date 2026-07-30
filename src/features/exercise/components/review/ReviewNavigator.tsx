import React from "react";
import { useTheme } from "../../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ReviewNavigatorProps } from "../../types";
import { AppIcon } from "../../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../../shared/theme";

export function ReviewNavigator({
  questions,
  currentIndex,
  onSelectQuestion,
}: ReviewNavigatorProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.container}>
      <Text style={styles.headerLabel}>Review Navigator</Text>

      <View style={styles.grid}>
        {questions.map((q, idx) => {
          const isActive = idx === currentIndex;
          const isCorrect = q.status === "correct";
          const isIncorrect = q.status === "incorrect";

          return (
            <Pressable
              key={`rev-nav-${q.id}`}
              accessibilityLabel={`Review Question ${idx + 1}`}
              accessibilityRole="button"
              onPress={() => onSelectQuestion(idx)}
              style={({ pressed }) => [
                styles.box,
                isCorrect ? styles.correctBox : isIncorrect ? styles.incorrectBox : styles.skippedBox,
                isActive && styles.activeBox,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.numberText,
                  isCorrect
                    ? styles.correctText
                    : isIncorrect
                    ? styles.incorrectText
                    : styles.skippedText,
                  isActive && styles.activeText,
                ]}
              >
                {idx + 1}
              </Text>

              <View style={styles.badgeShell}>
                <AppIcon
                  color={
                    isCorrect
                      ? colors.status.success
                      : isIncorrect
                      ? colors.status.error
                      : themeColors.textMuted
                  }
                  name={isCorrect ? "checkmark" : isIncorrect ? "close" : "help"}
                  size={10}
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
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.xs + 2,
  },
  headerLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs + 2,
  },
  box: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "relative",
  },
  correctBox: {
    backgroundColor: colors.accents.emerald.darkBg,
    borderColor: colors.status.success,
  },
  incorrectBox: {
    backgroundColor: "#3B1818",
    borderColor: colors.status.error,
  },
  skippedBox: {
    backgroundColor: themeColors.surfaceSecondary,
    borderColor: themeColors.border,
  },
  activeBox: {
    borderColor: colors.primary.main,
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.8,
  },
  numberText: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.heavy,
  },
  correctText: {
    color: colors.status.success,
  },
  incorrectText: {
    color: colors.status.error,
  },
  skippedText: {
    color: themeColors.textMuted,
  },
  activeText: {
    color: colors.primary.light,
  },
  badgeShell: {
    position: "absolute",
    top: 2,
    right: 2,
  },
});