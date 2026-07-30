import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { AttemptItem } from "../types";
import { AppIcon } from "../../../shared/icons";
import { Badge } from "../../../shared/components";
import { colors, radius, spacing, typography } from "../../../shared/theme";

export interface AttemptCardProps {
  attempt: AttemptItem;
  onPress?: (attempt: AttemptItem) => void;
}

export function AttemptCard({
  attempt,
  onPress,
}: AttemptCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.quizTitle}>{attempt.quizTitle}</Text>
        <Badge
          label={attempt.status.replace("_", " ")}
          variant={attempt.status === "completed" ? "secondary" : "dark"}
        />
      </View>

      <Text style={styles.subtitle}>
        {attempt.subjectName} • {attempt.chapterName}
      </Text>

      {attempt.score !== undefined && attempt.totalQuestions !== undefined ? (
        <View style={styles.scoreRow}>
          <AppIcon color={colors.primary.main} name="ribbon-outline" size={16} />
          <Text style={styles.scoreText}>
            Score: {attempt.score} / {attempt.totalQuestions}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  cardContainer: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs + 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  quizTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
    flexShrink: 1,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textMuted,
    marginBottom: spacing.xs,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  scoreText: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.semibold,
    color: themeColors.textSecondary,
  },
});