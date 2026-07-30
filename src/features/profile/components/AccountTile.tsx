import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AccountTileProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../shared/theme";

export function AccountTile({
  item,
  onPress,
}: AccountTileProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <Pressable onPress={() => onPress?.(item.id)} style={styles.tileContainer}>
      <View style={styles.leftGroup}>
        <View style={styles.iconBox}>
          <AppIcon color={colors.primary.main} name={item.iconName} size={18} />
        </View>
        <View style={styles.textGroup}>
          <Text style={styles.title}>{item.title}</Text>
          {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
        </View>
      </View>

      {item.value ? (
        <Text style={styles.valueText}>{item.value}</Text>
      ) : (
        <AppIcon color={themeColors.textMuted} name="chevron-forward" size={16} />
      )}
    </Pressable>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  tileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xs + 2,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: themeColors.surfaceHighlighted,
    alignItems: "center",
    justifyContent: "center",
  },
  textGroup: {
    flex: 1,
    gap: 1,
  },
  title: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
  },
  subtitle: {
    fontSize: typography.fontSize.xs - 1,
    color: themeColors.textMuted,
  },
  valueText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.light,
  },
});