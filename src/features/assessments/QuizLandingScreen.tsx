import React from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuizLandingData } from "./hooks";
import { AppIcon } from "../../shared/icons";
import { Badge, Button } from "../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../shared/theme";
import { Header } from "../../shared/components/Header";
type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface QuizLandingScreenProps {
  subjectId?: string;
  chapterId?: string;
  getToken?: GetToken;
  onBackToChapter?: (subjectId: string, chapterId: string) => void;
  onBrowseQuizzes?: () => void;
}

export function QuizLandingScreen({
  subjectId = "subj-science",
  chapterId = "chap-1",
  getToken,
  onBackToChapter,
  onBrowseQuizzes,
}: QuizLandingScreenProps) {
  const { theme  } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);
  const { data, isLoading, error } = useQuizLandingData(subjectId, chapterId, getToken);

  const breadcrumbs = [
    data.subjectName || subjectId || "Selected subject",
    data.chapterNumber ? `Chapter ${data.chapterNumber}` : chapterId || "Selected chapter",
    "Quiz Entry",
  ];

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <Header
        title="Quiz Info"
        onBackPress={() => onBackToChapter?.(subjectId, chapterId)}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Loading Indicator */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary.main} size="large" />
            <Text style={styles.loadingText}>Fetching Quiz Route status...</Text>
          </View>
        ) : null}

        {/* Error Banner */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Breadcrumb Row */}
        <View style={styles.breadcrumbRow}>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb}>
              <Text style={idx === breadcrumbs.length - 1 ? styles.activeCrumb : styles.crumb}>
                {crumb}
              </Text>
              {idx < breadcrumbs.length - 1 ? (
                <Text style={styles.crumbSeparator}>/</Text>
              ) : null}
            </React.Fragment>
          ))}
        </View>

        {/* Landing Hero Box */}
        <View style={styles.heroCard}>
          <View style={styles.badgeRow}>
            <Badge label="CURRICULUM QUIZ" variant="primary" />
            <Badge label="SECTION STATUS" variant="dark" />
          </View>

          <View style={styles.iconShell}>
            <AppIcon color={colors.primary.main} name="alert-circle-outline" size={40} />
          </View>

          <Text style={styles.heroTitle}>{data.heroTitle}</Text>
          <Text style={styles.heroSubtitle}>{data.heroSubtitle}</Text>

          {/* Chapter Meta Pill Box */}
          <View style={styles.metaBox}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Target Chapter</Text>
              <Text style={styles.metaValue}>{data.chapterTitle}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Enrolled Subject</Text>
              <Text style={styles.metaValue}>{data.subjectName}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <Button
              iconName="book-outline"
              onPress={() => onBackToChapter?.(subjectId, chapterId)}
              style={styles.flexButton}
              title="Back To Chapter"
              variant="primary"
            />
            <Button
              iconName="grid-outline"
              onPress={onBrowseQuizzes}
              style={styles.flexButton}
              title="Browse Quizzes"
              variant="secondary"
            />
          </View>
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
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: themeColors.textMuted,
  },
  errorBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    padding: spacing.xs + 2,
    borderRadius: 8,
    backgroundColor: "#3B1818",
    borderWidth: 1,
    borderColor: "#7A2E2E",
  },
  errorText: {
    fontSize: typography.fontSize.xs + 1,
    color: colors.status.error,
    textAlign: "center",
  },
  breadcrumbRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    flexWrap: "wrap",
    gap: 4,
  },
  crumb: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textMuted,
  },
  activeCrumb: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  crumbSeparator: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textMuted,
  },
  heroCard: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    alignItems: "center",
    ...shadows.md,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  iconShell: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primary.main + "1A",
    borderWidth: 1,
    borderColor: colors.primary.main + "33",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: typography.fontSize.sm,
    color: themeColors.textSecondary,
    textAlign: "center",
    lineHeight: typography.lineHeight.md,
    maxWidth: 300,
    marginBottom: spacing.lg,
  },
  metaBox: {
    width: "100%",
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    padding: spacing.md,
    gap: spacing.xs + 2,
    marginBottom: spacing.lg,
  },
  metaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLabel: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textMuted,
  },
  metaValue: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.xs + 2,
    width: "100%",
  },
  flexButton: {
    flex: 1,
  },
});
