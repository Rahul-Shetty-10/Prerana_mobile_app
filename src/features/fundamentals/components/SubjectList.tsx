import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { SubjectCard } from "./SubjectCard";
import { SubjectListProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, spacing, typography } from "../../../shared/theme";

export function SubjectList({
  subjects = [],
  onSelectSubject,
}: SubjectListProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const isEmpty = !subjects || subjects.length === 0;

  return (
    <View style={styles.container}>
      {/* Section Title & Subtitle Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionHeader}>All Fundamentals Subjects</Text>
        <Text style={styles.countText}>{subjects.length} Subjects</Text>
      </View>

      {/* Render Subject Cards */}
      {isEmpty ? (
        <View style={styles.emptyState}>
          <AppIcon color={themeColors.textMuted} name="folder-open-outline" size={32} />
          <Text style={styles.emptyText}>No subjects available at the moment.</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              onPress={onSelectSubject}
              subject={subject}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  countText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.light,
    fontWeight: typography.fontWeight.bold,
  },
  listContainer: {
    paddingBottom: spacing.sm,
  },
  emptyState: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: themeColors.textMuted,
  },
});