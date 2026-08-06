import React, { useEffect } from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChapterCard,
  QuickActionsCard,
  SubjectOverviewCard,
  SubjectStatisticsCard,
} from "./components";
import { Header } from "../../shared/components/Header";
import { useSubjectWorkspace } from "./hooks";
import { useNavigation } from "@react-navigation/native";
import { ChapterItem, SubjectMeta } from "./types";
import { colors, spacing, typography } from "../../shared/theme";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface SubjectWorkspaceScreenProps {
  subject: SubjectMeta;
  getToken?: GetToken;
  onBackPress?: () => void;
  onSelectChapter?: (chapter: ChapterItem) => void;
  onOpenFundamentals?: () => void;
}

export function SubjectWorkspaceScreen({
  subject,
  getToken,
  onBackPress,
  onSelectChapter,
  onOpenFundamentals,
}: SubjectWorkspaceScreenProps) {
  const { theme } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);
  const { workspace, isLoading, error, refresh } = useSubjectWorkspace(subject.id, getToken);
  const navigation = useNavigation();

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <Header
        title="Subject Workspace"
        onBackPress={onBackPress}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          getToken ? (
            <RefreshControl
              colors={[colors.primary.main]}
              onRefresh={() => void refresh()}
              refreshing={isLoading}
              tintColor={colors.primary.main}
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Loading Indicator */}
        {isLoading && !workspace ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary.main} size="large" />
            <Text style={styles.loadingText}>Loading Subject Workspace...</Text>
          </View>
        ) : null}

        {/* Error Banner */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {workspace ? (
          <>
            {/* Subject Overview Card */}
            <SubjectOverviewCard
              subjectName={workspace.subject.name || subject.name}
              totalChapters={workspace.subject.chapterCount || subject.chapterCount}
              totalParts={workspace.subject.partCount || subject.partCount}
            />

            {/* Chapter Selection section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Chapter Selection</Text>
              <Text style={styles.sectionSubtitle}>
                Choose a chapter topic below to review concepts or view textbook materials.
              </Text>
            </View>

            <View style={styles.chaptersList}>
              {workspace.chapters.map((chapter) => (
                <ChapterCard
                  chapter={chapter}
                  key={chapter.id}
                  onPress={() => onSelectChapter?.(chapter)}
                />
              ))}
            </View>

            {/* Subject Statistics Card */}
            <SubjectStatisticsCard
              completedChapters={workspace.stats.completedChapters}
              totalChapters={workspace.stats.totalChapters}
            />

            {/* Quick Actions Card */}
            <QuickActionsCard
              onOpenFundamentals={onOpenFundamentals}
              onViewQuizzes={() => {
                (navigation as any).navigate("Games", { screen: "QuizzesHome" });
              }}
            />
          </>
        ) : null}
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
  subjectBanner: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  subjectNameText: {
    fontSize: typography.fontSize.xxl - 2,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  loadingContainer: {
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  loadingText: {
    fontSize: typography.fontSize.xs + 1,
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
  chaptersList: {
    marginTop: spacing.xs,
  },
});