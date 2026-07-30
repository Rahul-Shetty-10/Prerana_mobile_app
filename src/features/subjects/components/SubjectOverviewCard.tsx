import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { SubjectOverviewCardProps } from "../types";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function SubjectOverviewCard({
  subjectName,
  totalChapters,
  totalParts,
}: SubjectOverviewCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.card}>
      <Text style={styles.subjectNameTitle}>{subjectName}</Text>

      {/* Meta Specs Grid */}
      <View style={styles.specsGrid}>
        <View style={styles.specBox}>
          <Text style={styles.specValue}>{totalChapters}</Text>
          <Text style={styles.specLabel}>Total Chapters</Text>
        </View>

        <View style={styles.specDivider} />

        <View style={styles.specBox}>
          <Text style={styles.specValue}>{totalParts}</Text>
          <Text style={styles.specLabel}>Total Parts</Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    ...shadows.sm,
    gap: spacing.sm,
  },
  subjectNameTitle: {
    fontSize: typography.fontSize.lg + 2,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  specsGrid: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  specBox: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  specDivider: {
    width: 1,
    height: 28,
    backgroundColor: themeColors.border,
  },
  specValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    color: colors.primary.light,
  },
  specLabel: {
    fontSize: typography.fontSize.xs - 1,
    color: themeColors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
});