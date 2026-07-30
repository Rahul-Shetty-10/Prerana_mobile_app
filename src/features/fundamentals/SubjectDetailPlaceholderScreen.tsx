import React from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SubjectItem } from "./types";
import { Badge, Button } from "../../shared/components";
import { AppIcon } from "../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../shared/theme";

export interface SubjectDetailPlaceholderScreenProps {
  subject: SubjectItem;
  onBackPress: () => void;
}

export function SubjectDetailPlaceholderScreen({
  subject,
  onBackPress,
}: SubjectDetailPlaceholderScreenProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const accentColors = colors.accents[subject.colorVariant || "coral"] || colors.accents.coral;

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      {/* Top Back Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Back to Fundamentals"
          accessibilityRole="button"
          onPress={onBackPress}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <AppIcon color={themeColors.textPrimary} name="arrow-back-outline" size={20} />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <Text style={styles.headerTitle}>{subject.title}</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      {/* Main Content Body */}
      <View style={styles.body}>
        <View style={styles.card}>
          <View
            style={[
              styles.iconShell,
              {
                backgroundColor: accentColors.darkBg,
                borderColor: accentColors.darkBorder,
              },
            ]}
          >
            <AppIcon color={accentColors.darkText} name={subject.iconName} size={32} />
          </View>

          <Badge label={subject.previewBadgeText} style={styles.badge} variant="primary" />

          <Text style={styles.subjectTitle}>{subject.title}</Text>
          <Text style={styles.subjectDescription}>{subject.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{subject.trackCount}</Text>
              <Text style={styles.statLabel}>Learning Tracks</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{subject.questionCount}</Text>
              <Text style={styles.statLabel}>Total Questions</Text>
            </View>
          </View>

          <View style={styles.noticeBox}>
            <AppIcon color={colors.primary.light} name="information-circle-outline" size={22} />
            <Text style={styles.noticeText}>
              Subject Detail, Exercises, and Review modules will be built in the next step.
            </Text>
          </View>

          <Button
            iconName="arrow-back-outline"
            onPress={onBackPress}
            style={styles.returnButton}
            title="Return to Fundamentals Home"
            variant="secondary"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: themeColors.background,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: themeColors.surfaceSecondary,
  },
  backButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
  },
  headerTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  headerRightSpacer: {
    width: 60,
  },
  pressed: {
    opacity: 0.8,
  },
  body: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "center",
  },
  card: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.lg,
    alignItems: "center",
    ...shadows.md,
  },
  iconShell: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  badge: {
    marginBottom: spacing.xs,
  },
  subjectTitle: {
    fontSize: typography.fontSize.xxl - 2,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subjectDescription: {
    fontSize: typography.fontSize.sm + 1,
    color: themeColors.textSecondary,
    textAlign: "center",
    lineHeight: typography.lineHeight.md,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: themeColors.border,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.heavy,
    color: colors.primary.light,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: themeColors.surfaceHighlighted,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary.light,
    marginBottom: spacing.lg,
  },
  noticeText: {
    flex: 1,
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textPrimary,
    lineHeight: typography.lineHeight.sm + 2,
  },
  returnButton: {
    width: "100%",
  },
});