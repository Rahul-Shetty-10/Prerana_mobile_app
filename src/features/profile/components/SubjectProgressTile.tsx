import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { SubjectProgressTileProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../shared/theme";

export function SubjectProgressTile({
  item,
}: SubjectProgressTileProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.tileContainer}>
      <View style={styles.topRow}>
        <View style={styles.iconTitleGroup}>
          <View style={[styles.iconBox, { backgroundColor: item.color + "22" }]}>
            <AppIcon color={item.color} name={item.iconName} size={18} />
          </View>
          <Text style={styles.subjectName}>{item.subjectName}</Text>
        </View>

        <Text style={[styles.percentText, { color: item.color }]}>{item.progressPercent}%</Text>
      </View>

      {/* Progress Track & Bar */}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${item.progressPercent}%`, backgroundColor: item.color },
          ]}
        />
      </View>

      <Text style={styles.subText}>
        {item.completedChapters} of {item.totalChapters} chapters completed
      </Text>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  tileContainer: {
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xs + 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs + 2,
  },
  iconTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  subjectName: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
  },
  percentText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
  },
  track: {
    height: 6,
    backgroundColor: themeColors.surfaceHighlighted,
    borderRadius: radius.full,
    overflow: "hidden",
    marginBottom: 4,
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
  },
  subText: {
    fontSize: typography.fontSize.xs - 1,
    color: themeColors.textMuted,
  },
});