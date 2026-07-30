import React, { useEffect } from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SubjectItemCardProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
export function SubjectItemCard({ subject, isSelected, onPress }: SubjectItemCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const accentColors = colors.accents[subject.colorVariant || "coral"] || colors.accents.coral;

  return (
    <Pressable
      accessibilityLabel={`Select ${subject.name}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={() => onPress?.(subject)}
      style={({ pressed }) => [
        styles.card,
        isSelected ? styles.selectedCard : styles.unselectedCard,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.iconShell,
          {
            backgroundColor: isSelected ? accentColors.darkBg : themeColors.surfaceSecondary,
            borderColor: isSelected ? accentColors.darkBorder : themeColors.border,
          },
        ]}
      >
        <AppIcon
          color={isSelected ? accentColors.darkText : themeColors.textSecondary}
          name={subject.iconName}
          size={24}
        />
      </View>

      <View style={styles.textBlock}>
        <Text style={[styles.nameText, isSelected && styles.selectedNameText]}>
          {subject.name}
        </Text>
        <Text style={styles.chapterCountText}>{subject.chapterCount} Chapters</Text>
      </View>

      <View style={styles.chevronShell}>
        <AppIcon
          color={isSelected ? colors.primary.main : themeColors.textMuted}
          name="chevron-forward-outline"
          size={18}
        />
      </View>
    </Pressable>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  unselectedCard: {
    backgroundColor: themeColors.surface,
    borderColor: themeColors.border,
  },
  selectedCard: {
    backgroundColor: themeColors.surfaceHighlighted,
    borderColor: colors.primary.light,
  },
  pressed: {
    opacity: 0.82,
  },
  iconShell: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  nameText: {
    fontSize: typography.fontSize.md + 1,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  selectedNameText: {
    color: colors.primary.light,
  },
  chapterCountText: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  chevronShell: {
    marginLeft: spacing.xxs,
  },
});