import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { DifficultyModalProps, MatchDifficulty } from "../types";
import { AppIcon } from "../../../shared/icons";
import { Button } from "../../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

const DIFFICULTIES: {
  id: MatchDifficulty;
  title: string;
  pairsLabel: string;
  xpLabel: string;
  color: string;
  icon: any;
}[] = [
  {
    id: "Easy",
    title: "Easy Mode",
    pairsLabel: "6 Pairs (12 Cards)",
    xpLabel: "+100 XP Base",
    color: colors.accents.emerald.text,
    icon: "happy-outline",
  },
  {
    id: "Medium",
    title: "Medium Mode",
    pairsLabel: "8 Pairs (16 Cards)",
    xpLabel: "+150 XP Base",
    color: colors.accents.amber.text,
    icon: "flash-outline",
  },
  {
    id: "Hard",
    title: "Hard Mode",
    pairsLabel: "10 Pairs (20 Cards)",
    xpLabel: "+250 XP Base",
    color: colors.status.error,
    icon: "flame-outline",
  },
];

export function DifficultyModal({
  visible,
  onSelectDifficulty,
  onCancel,
}: DifficultyModalProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Select Difficulty</Text>
          <Text style={styles.modalSubtitle}>
            Choose a challenge level for Match Master to start pairing cards.
          </Text>

          <View style={styles.optionsList}>
            {DIFFICULTIES.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => onSelectDifficulty(item.id)}
                style={({ pressed }) => [
                  styles.optionCard,
                  pressed && styles.optionPressed,
                ]}
              >
                <View style={[styles.iconShell, { backgroundColor: item.color + "22" }]}>
                  <AppIcon color={item.color} name={item.icon} size={24} />
                </View>

                <View style={styles.optionTextCol}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                  <Text style={styles.optionPairs}>{item.pairsLabel}</Text>
                </View>

                <View style={styles.xpBadge}>
                  <Text style={[styles.xpText, { color: item.color }]}>{item.xpLabel}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Button
            iconName="close-outline"
            onPress={onCancel}
            style={styles.cancelButton}
            title="Cancel"
            variant="secondary"
          />
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
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    marginBottom: spacing.xxs,
  },
  modalSubtitle: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  optionsList: {
    width: "100%",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  optionPressed: {
    backgroundColor: themeColors.surfaceHighlighted,
    borderColor: colors.primary.main,
  },
  iconShell: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
  },
  optionPairs: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textMuted,
    marginTop: 2,
  },
  xpBadge: {
    backgroundColor: themeColors.surfaceHighlighted,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  xpText: {
    fontSize: typography.fontSize.xs - 1,
    fontWeight: typography.fontWeight.bold,
  },
  cancelButton: {
    width: "100%",
  },
});