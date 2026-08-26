import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Modal, StyleSheet, Text, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { VictoryModalProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { Badge, Button } from "../../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function VictoryModal({
  visible,
  result,
  onPlayAgain,
  onReturnHome,
}: VictoryModalProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);
  const isFocused = useIsFocused();

  if (!isFocused) return null;

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Top Badge */}
          <Badge label="VICTORY!" variant="secondary" />

          {/* Icon Shell */}
          <View style={styles.iconShell}>
            <AppIcon color={colors.secondary.main} name="trophy" size={44} />
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>Quiz Completed!</Text>
          <Text style={styles.subtitle}>
            Great job! You answered {result.correctCount} out of {result.totalQuestions} questions correctly.
          </Text>

          {/* Score & Rewards Box */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Final Score</Text>
              <Text style={styles.statValue}>{result.score} pts</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>XP Earned</Text>
              <Text style={[styles.statValue, { color: colors.accents.amber.text }]}>
                +{result.xpEarned} XP
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Coins</Text>
              <Text style={[styles.statValue, { color: colors.secondary.main }]}>
                +{result.coinsEarned}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Accuracy</Text>
              <Text style={[styles.statValue, { color: colors.status.success }]}>
                {result.accuracy}%
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <Button
              iconName="refresh-outline"
              onPress={onPlayAgain}
              style={styles.flexButton}
              title="Play Again"
              variant="primary"
            />
            <Button
              iconName="home-outline"
              onPress={onReturnHome}
              style={styles.flexButton}
              title="Return Home"
              variant="secondary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.lg,
    alignItems: "center",
    ...shadows.lg,
  },
  iconShell: {
    width: 76,
    height: 76,
    borderRadius: radius.full,
    backgroundColor: colors.accents.amber.darkBg,
    borderWidth: 1,
    borderColor: colors.accents.amber.darkBorder,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textSecondary,
    textAlign: "center",
    lineHeight: typography.lineHeight.sm + 4,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    width: "100%",
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    padding: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statItem: {
    width: "46%",
    alignItems: "center",
  },
  statLabel: {
    fontSize: typography.fontSize.xs - 1,
    color: themeColors.textMuted,
  },
  statValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.xs + 2,
    width: "100%",
  },
  flexButton: {
    flex: 1,
  },
});