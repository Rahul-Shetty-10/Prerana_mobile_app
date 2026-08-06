import React from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SubjectItem } from "./types";
import { TrackType } from "../exercise/types";
import { Badge, Button } from "../../shared/components";
import { AppIcon, IconName } from "../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../shared/theme";
import { Header } from "../../shared/components/Header";
export interface SubjectDetailScreenProps {
  subject: SubjectItem;
  onBackPress: () => void;
  onSelectTrack: (trackType: TrackType, trackSlug: string) => void;
}

interface TrackCardItem {
  type: TrackType;
  title: string;
  badgeLabel: string;
  description: string;
  iconName: IconName;
  variant: "coral" | "amber" | "blue" | "purple";
  questionCount: number;
}

const LEARNING_TRACKS: TrackCardItem[] = [
  {
    type: "explorer",
    title: "Explorer Track",
    badgeLabel: "STARTER",
    description: "Fundamental concepts, definitions, and core principles practice.",
    iconName: "compass-outline",
    variant: "coral",
    questionCount: 15,
  },
  {
    type: "investigator",
    title: "Investigator Track",
    badgeLabel: "INTERMEDIATE",
    description: "Deep-dive inquiry, logical reasoning, and analytical problem-solving.",
    iconName: "search-outline",
    variant: "amber",
    questionCount: 20,
  },
  {
    type: "innovator",
    title: "Innovator Track",
    badgeLabel: "ADVANCED",
    description: "Application-based challenges, practical scenarios, and creative synthesis.",
    iconName: "bulb-outline",
    variant: "blue",
    questionCount: 18,
  },
  {
    type: "scientist",
    title: "Scientist Track",
    badgeLabel: "EXPERT",
    description: "High-order evaluation, complex multi-concept synthesis, and exam mastery.",
    iconName: "flask-outline",
    variant: "purple",
    questionCount: 25,
  },
];

export function SubjectDetailScreen({
  subject,
  onBackPress,
  onSelectTrack,
}: SubjectDetailScreenProps) {
  const { theme  } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);
  const accentColors = colors.accents[subject.colorVariant || "coral"] || colors.accents.coral;

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <Header
        title={subject.title}
        onBackPress={onBackPress}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Learning Tracks Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Available Learning Tracks</Text>
          <Text style={styles.sectionSubtitle}>Select a track to start exercise</Text>
        </View>

        {/* 4 Learning Tracks List */}
        <View style={styles.tracksList}>
          {LEARNING_TRACKS.map((track, idx) => {
            const trackAccents = colors.accents[track.variant] || colors.accents.coral;
            // Use backend level at matching index position (levelOrder 1 = explorer card, etc.)
            const backendLevel = subject.tracks?.[idx];
            const resolvedSlug = backendLevel?.slug || track.type;
            const resolvedTitle = backendLevel?.name || track.title;
            const resolvedQuestionCount = backendLevel?.questionCount ?? track.questionCount;
            // Skip rendering if backend has fewer levels than LEARNING_TRACKS has cards
            if (subject.tracks && subject.tracks.length > 0 && !backendLevel) return null;

            return (
              <Pressable
                key={track.type}
                accessibilityRole="button"
                onPress={() => {
                  console.log(`[FUNDAMENTALS] Navigating with subjectSlug="${subject.subjectSlug}", trackSlug="${resolvedSlug}"`);
                  onSelectTrack(track.type, resolvedSlug);
                }}
                style={({ pressed }) => [styles.trackCard, pressed && styles.pressed]}
              >
                <View style={styles.trackTopRow}>
                  <View
                    style={[
                      styles.trackIconShell,
                      {
                        backgroundColor: trackAccents.darkBg,
                        borderColor: trackAccents.darkBorder,
                      },
                    ]}
                  >
                    <AppIcon color={trackAccents.darkText} name={track.iconName} size={20} />
                  </View>

                  <Badge label={track.badgeLabel} variant="primary" />
                </View>

                <Text style={styles.trackTitle}>{resolvedTitle}</Text>
                <Text style={styles.trackDescription}>{track.description}</Text>

                <View style={styles.trackFooterRow}>
                  <Text style={[styles.startTrackText, { color: colors.primary.main }]}>
                    Start Track ({resolvedQuestionCount} Questions)
                  </Text>
                  <AppIcon color={colors.primary.main} name="arrow-forward-outline" size={14} />
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl + 20,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
  },
  headerTitle: {
    fontSize: typography.fontSize.md + 1,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    maxWidth: "60%",
  },
  headerRightSpacer: {
    width: 60,
  },
  pressed: {
    opacity: 0.8,
  },
  overviewCard: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  overviewTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  iconShell: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  subjectTitle: {
    fontSize: typography.fontSize.xxl - 2,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    marginBottom: spacing.xs,
  },
  subjectDescription: {
    fontSize: typography.fontSize.sm + 1,
    color: themeColors.textSecondary,
    lineHeight: typography.lineHeight.md,
    marginBottom: spacing.md,
  },
  statsBar: {
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  statsText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.bold,
    textAlign: "center",
  },
  sectionHeaderRow: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textSecondary,
  },
  tracksList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  trackCard: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.md,
    ...shadows.sm,
    gap: spacing.xs,
  },
  trackTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trackIconShell: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  trackTitle: {
    fontSize: typography.fontSize.md + 1,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  trackDescription: {
    fontSize: typography.fontSize.sm,
    color: themeColors.textSecondary,
    lineHeight: typography.lineHeight.sm + 3,
  },
  trackFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  startTrackText: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.bold,
  },
});