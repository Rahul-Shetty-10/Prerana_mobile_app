import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ComboBadgeProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../shared/theme";

export function ComboBadge({ combo }: ComboBadgeProps) {
  if (combo <= 1) return null;

  let multiplierText = "1x";
  if (combo >= 20) multiplierText = "4x MULTIPLIER!";
  else if (combo >= 10) multiplierText = "3x MULTIPLIER!";
  else if (combo >= 5) multiplierText = "2x MULTIPLIER!";
  else multiplierText = `${combo}x STREAK!`;

  return (
    <View style={styles.badgeContainer}>
      <AppIcon color={colors.accents.coral.darkText} name="flame" size={16} />
      <Text style={styles.badgeText}>{multiplierText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs + 2,
    backgroundColor: colors.accents.coral.darkBg,
    borderColor: colors.accents.coral.darkBorder,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: colors.accents.coral.darkText,
  },
});