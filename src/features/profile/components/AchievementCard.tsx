import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { AchievementCardProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../shared/theme";

export function AchievementCard({
  achievement,
}: AchievementCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const isUnlocked = achievement.unlocked;

  return (
    <View style={[styles.cardContainer, !isUnlocked && styles.lockedCard]}>
      <View
        style={[
          styles.iconCircle,
          isUnlocked ? styles.unlockedIconBg : styles.lockedIconBg,
        ]}
      >
        <AppIcon
          color={isUnlocked ? colors.secondary.main : themeColors.textMuted}
          name={achievement.iconName}
          size={22}
        />
      </View>

      <View style={styles.textDetails}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, !isUnlocked && styles.lockedText]}>
            {achievement.title}
          </Text>
          <View
            style={[
              styles.badge,
              isUnlocked ? styles.unlockedBadge : styles.lockedBadge,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isUnlocked ? styles.unlockedBadgeText : styles.lockedBadgeText,
              ]}
            >
              {isUnlocked ? "Unlocked" : "Locked"}
            </Text>
          </View>
        </View>

        <Text style={styles.description}>{achievement.description}</Text>
      </View>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xs + 2,
  },
  lockedCard: {
    opacity: 0.7,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  unlockedIconBg: {
    backgroundColor: colors.secondary.main + "22",
    borderWidth: 1,
    borderColor: colors.secondary.main + "44",
  },
  lockedIconBg: {
    backgroundColor: themeColors.surfaceHighlighted,
  },
  textDetails: {
    flex: 1,
    gap: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
  },
  lockedText: {
    color: themeColors.textMuted,
  },
  description: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textMuted,
    lineHeight: typography.lineHeight.xs + 2,
  },
  badge: {
    borderRadius: radius.xs,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
  },
  unlockedBadge: {
    backgroundColor: colors.secondary.main + "33",
  },
  lockedBadge: {
    backgroundColor: themeColors.surfaceHighlighted,
  },
  badgeText: {
    fontSize: typography.fontSize.xs - 2,
    fontWeight: typography.fontWeight.bold,
  },
  unlockedBadgeText: {
    color: colors.secondary.main,
  },
  lockedBadgeText: {
    color: themeColors.textMuted,
  },
});