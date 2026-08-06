import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { WelcomeCardProps } from "../types";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
import { AppIcon } from "../../../shared/icons";

export function WelcomeCard({
  title = "Welcome Back!",
  description = "Ready to excel in your exams? Pick up where you left off or dive into targeted study modules.",
  lastStudiedText,
  onContinueLearning,
}: WelcomeCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.card}>
      {/* Greeting */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {/* Last Studied Capsule */}
      {lastStudiedText ? (
        <View style={styles.lastStudiedContainer}>
          <AppIcon color={colors.primary.main} name="book" size={14} />
          <Text numberOfLines={1} style={styles.lastStudiedText}>{lastStudiedText}</Text>
        </View>
      ) : null}

      {/* Continue Button */}
      <Pressable
        onPress={onContinueLearning}
        style={({ pressed }) => [styles.continueBtn, pressed && styles.continueBtnPressed]}
      >
        <Text style={styles.continueBtnText}>Continue Learning</Text>
        <AppIcon color="#fff" name="arrow-forward" size={14} />
      </Pressable>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: themeColors.surfaceHighlighted,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: isDark ? "#5A342E" : "#F9D5CB",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    gap: spacing.xs + 2,
    ...shadows.md,
  },
  title: {
    fontSize: typography.fontSize.lg + 2,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    letterSpacing: -0.4,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: themeColors.textSecondary,
    lineHeight: typography.lineHeight.md,
  },
  lastStudiedContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: isDark ? "#3B201A" : "#FEECE9",
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.md,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: isDark ? "#5A342E" : "#FCD0C4",
  },
  lastStudiedText: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
    flexShrink: 1,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignSelf: "flex-start",
    marginTop: spacing.xs,
  },
  continueBtnPressed: {
    opacity: 0.82,
  },
  continueBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: "#fff",
  },
});