import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { StatCard } from "./StatCard";
import { StatsSectionProps } from "../types";
import { colors, spacing, typography } from "../../../shared/theme";
export function StatsSection({
  sectionTitle = "Overview Statistics",
  stats,
}: StatsSectionProps) {
  const { theme  } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);

  if (!stats || stats.length === 0) {
    return null;
  }

  // Chunk array into rows of 2 for clean mobile grid layout
  const rows: typeof stats[] = [];
  for (let i = 0; i < stats.length; i += 2) {
    rows.push(stats.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      {sectionTitle ? <Text style={styles.sectionTitle}>{sectionTitle}</Text> : null}
      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={`stat-row-${rowIndex}`} style={styles.row}>
            {row.map((stat, cardIndex) => (
              <StatCard key={`stat-card-${rowIndex}-${cardIndex}-${stat.title}`} {...stat} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.xs + 2,
  },
  grid: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});