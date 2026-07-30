import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { PreferenceTileProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../shared/theme";
export function PreferenceTile({
  title,
  subtitle,
  iconName,
  isToggle,
  toggleValue,
  onToggle,
  isComingSoon,
  onPress,
}: PreferenceTileProps) {
  const { theme  } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);

  const ContainerComponent = onPress ? Pressable : View;

  return (
    <ContainerComponent
      onPress={!isComingSoon ? onPress : undefined}
      style={({ pressed }: any) => [
        styles.tileContainer,
        isComingSoon && styles.disabledTile,
        pressed && onPress && styles.pressed,
      ]}
    >
      <View style={styles.leftGroup}>
        <View style={styles.iconBox}>
          <AppIcon color={colors.primary.main} name={iconName} size={20} />
        </View>
        <View style={styles.textGroup}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {isComingSoon ? (
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            ) : null}
          </View>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      {isToggle && !isComingSoon ? (
        <Switch
          onValueChange={onToggle}
          thumbColor={colors.primary.contrastText}
          trackColor={{
            false: themeColors.surfaceHighlighted,
            true: colors.primary.main,
          }}
          value={toggleValue}
        />
      ) : null}

      {!isToggle && !isComingSoon && onPress ? (
        <AppIcon color={themeColors.textMuted} name="chevron-forward-outline" size={18} />
      ) : null}
    </ContainerComponent>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
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
  disabledTile: {
    opacity: 0.6,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primary.main + "1A",
    alignItems: "center",
    justifyContent: "center",
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
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
  comingSoonBadge: {
    backgroundColor: themeColors.surfaceHighlighted,
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  comingSoonText: {
    fontSize: typography.fontSize.xs - 2,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textMuted,
  },
  pressed: {
    opacity: 0.75,
  },
});