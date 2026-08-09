import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { QuestionNavigatorProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../shared/theme";

export function QuestionNavigator({
  totalQuestions,
  currentIndex,
  answeredIndices,
  flaggedIndices,
  onSelectQuestion,
}: QuestionNavigatorProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const numbers = Array.from({ length: totalQuestions }, (_, i) => i);

  return (
    <View style={styles.container}>
      <Text style={styles.headerLabel}>Question Navigator</Text>

      <View style={styles.grid}>
        {numbers.map((idx) => {
          const isActive = idx === currentIndex;
          const isAnswered = answeredIndices.includes(idx);
          const isFlagged = flaggedIndices.includes(idx);

          return (
            <Pressable
              key={`q-nav-${idx}`}
              accessibilityLabel={`Go to question ${idx + 1}`}
              accessibilityRole="button"
              onPress={() => onSelectQuestion(idx)}
              style={({ pressed }) => [
                styles.navBox,
                isActive
                  ? styles.activeBox
                  : isFlagged
                  ? styles.flaggedBox
                  : isAnswered
                  ? styles.answeredBox
                  : styles.unansweredBox,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.numberText,
                  isActive
                    ? styles.activeText
                    : isFlagged
                    ? styles.flaggedText
                    : isAnswered
                    ? styles.answeredText
                    : styles.unansweredText,
                ]}
              >
                {idx + 1}
              </Text>

              {isFlagged ? (
                <View style={styles.flagBadge}>
                  <AppIcon color={colors.status.error} name="flag" size={10} />
                </View>
              ) : isAnswered ? (
                <View style={styles.checkBadge}>
                  <AppIcon color={colors.status.success} name="checkmark" size={10} />
                </View>
              ) : null}
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
    marginTop: spacing.sm,
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
  navBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "relative",
  },
  unansweredBox: {
    backgroundColor: themeColors.surfaceSecondary,
    borderColor: themeColors.border,
  },
  answeredBox: {
    backgroundColor: themeColors.surfaceHighlighted,
    borderColor: colors.status.success,
  },
  flaggedBox: {
    backgroundColor: themeColors.surfaceSecondary,
    borderColor: colors.status.error,
  },
  activeBox: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.light,
  },
  pressed: {
    opacity: 0.8,
  },
  numberText: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.heavy,
  },
  unansweredText: {
    color: themeColors.textSecondary,
  },
  answeredText: {
    color: colors.status.success,
  },
  flaggedText: {
    color: colors.status.error,
  },
  activeText: {
    color: colors.primary.contrastText,
  },
  flagBadge: {
    position: "absolute",
    top: 2,
    right: 2,
  },
  checkBadge: {
    position: "absolute",
    top: 2,
    right: 2,
  },
});