import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { WelcomeCardProps } from "../types";
import { Badge, Button, Chip } from "../../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
export function WelcomeCard({
  badgeText = "STUDENT DASHBOARD",
  title = "Welcome Back!",
  description = "Ready to excel in your exams? Pick up where you left off or dive into targeted study modules.",
  subjects = [],
  selectedSubject,
  onSubjectSelect,
  onContinueLearning,
  onStudyResources,
}: WelcomeCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);


  return (
    <View style={styles.card}>
      {/* Top Badge */}
      <Badge label={badgeText} style={styles.badge} variant="primary" />

      {/* Main Content Title & Description */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {/* Subject Chips */}
      {subjects && subjects.length > 0 ? (
        <View style={styles.subjectContainer}>
          <Text style={styles.subjectHeaderLabel}>Active Subjects</Text>
          <ScrollView
            contentContainerStyle={styles.chipScrollContainer}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {subjects.map((subject) => (
              <Chip
                key={subject}
                label={subject}
                onPress={() => onSubjectSelect?.(subject)}
                selected={selectedSubject === subject}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <Button
          iconName="arrow-forward"
          onPress={onContinueLearning}
          style={styles.actionButton}
          title="Continue"
          variant="primary"
        />
        <Button
          iconName="library-outline"
          onPress={onStudyResources}
          style={styles.actionButton}
          title="Library"
          variant="secondary"
        />
      </View>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: themeColors.surfaceHighlighted,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: isDark ? "#5A342E" : "#F9D5CB",
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    ...shadows.md,
  },
  badge: {
    marginBottom: spacing.xs + 2,
    alignSelf: "flex-start",
  },
  title: {
    fontSize: typography.fontSize.xl + 2,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: typography.fontSize.sm + 1,
    color: themeColors.textSecondary,
    lineHeight: typography.lineHeight.md,
    marginBottom: spacing.md,
  },
  subjectContainer: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  subjectHeaderLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textMuted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  chipScrollContainer: {
    flexDirection: "row",
    paddingRight: spacing.md,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    flex: 1,
  },
});