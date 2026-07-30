import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MemoryCardProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function MemoryCard({
  card,
  onPress,
  disabled = false,
}: MemoryCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const isShowFace = card.isFlipped || card.isMatched;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || card.isFlipped || card.isMatched}
      onPress={() => onPress(card)}
      style={({ pressed }) => [
        styles.cardBase,
        isShowFace ? styles.faceUpCard : styles.faceDownCard,
        card.isMatched && styles.matchedCard,
        pressed && !isShowFace && styles.pressed,
      ]}
    >
      {isShowFace ? (
        <View style={styles.cardContent}>
          <Text
            numberOfLines={4}
            style={[styles.cardText, card.isMatched && styles.matchedText]}
          >
            {card.text}
          </Text>
          <Text style={styles.categoryBadge}>{card.category}</Text>
          {card.isMatched ? (
            <View style={styles.checkIconShell}>
              <AppIcon color={colors.status.success} name="checkmark-circle" size={16} />
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.faceDownContent}>
          <AppIcon color={colors.primary.main} name="cube-outline" size={26} />
        </View>
      )}
    </Pressable>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  cardBase: {
    width: "30%", // 3 columns
    aspectRatio: 0.82,
    borderRadius: radius.md,
    margin: "1.5%",
    padding: spacing.xs,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  faceDownCard: {
    backgroundColor: themeColors.surfaceSecondary,
    borderColor: themeColors.borderSubtle,
  },
  faceUpCard: {
    backgroundColor: themeColors.surface,
    borderColor: colors.primary.main,
  },
  matchedCard: {
    backgroundColor: "#0D3320",
    borderColor: colors.status.success,
  },
  pressed: {
    backgroundColor: themeColors.surfaceHighlighted,
    borderColor: colors.primary.main,
  },
  cardContent: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  cardText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    textAlign: "center",
    lineHeight: typography.lineHeight.xs + 2,
  },
  matchedText: {
    color: colors.status.success,
  },
  categoryBadge: {
    fontSize: typography.fontSize.xs - 3,
    fontWeight: typography.fontWeight.medium,
    color: themeColors.textMuted,
    textAlign: "center",
  },
  checkIconShell: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  faceDownContent: {
    alignItems: "center",
    justifyContent: "center",
  },
});