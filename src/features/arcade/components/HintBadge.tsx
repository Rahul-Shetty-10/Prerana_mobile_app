import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { HintBadgeProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../shared/theme";

export function HintBadge({ hintText }: HintBadgeProps) {
  return (
    <View style={styles.container}>
      <AppIcon color={colors.accents.amber.text} name="bulb-outline" size={18} />
      <Text style={styles.hintText}>{hintText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.accents.amber.darkBg,
    borderColor: colors.accents.amber.darkBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  hintText: {
    flex: 1,
    fontSize: typography.fontSize.xs + 1,
    color: colors.accents.amber.darkText,
    lineHeight: typography.lineHeight.xs + 4,
  },
});