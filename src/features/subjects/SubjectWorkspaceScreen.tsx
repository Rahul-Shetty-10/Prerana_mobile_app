import React, { useEffect, useState } from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  QuickActionsCard,
  SubjectStatisticsCard,
} from "./components";
import { Header } from "../../shared/components/Header";
import { ErrorMessageView } from "../../shared/components/ErrorMessageView";
import { useSubjectWorkspace } from "./hooks";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { ChapterItem, SubjectMeta } from "./types";
import { colors, spacing, typography, radius, shadows } from "../../shared/theme";
import { AppIcon } from "../../shared/icons";
import { getCompletedChaptersCount, isChapterCompleted } from "../../shared/services/chapterProgressService";

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
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);
  const { workspace, isLoading, error, refresh } = useSubjectWorkspace(subject.id, getToken);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [searchQuery, setSearchQuery] = useState("");
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [completedChapterIds, setCompletedChapterIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isFocused || !workspace) return;

    const loadChapterStats = async () => {
      const count = await getCompletedChaptersCount(workspace.subject.id || subject.id);
      setCompletedCount(count);

      const completedIds: string[] = [];
      for (const ch of workspace.chapters) {
        const isComp = await isChapterCompleted(ch.id);
        if (isComp) {
          completedIds.push(ch.id);
        }
      }
      setCompletedChapterIds(completedIds);
    };

    void loadChapterStats();
  }, [isFocused, workspace, subject.id]);

  const filteredChapters = workspace
    ? [...workspace.chapters]
        .filter((chapter) =>
          chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          if (searchQuery.trim().length > 0) {
            const indexA = a.title.toLowerCase().indexOf(searchQuery.toLowerCase());
            const indexB = b.title.toLowerCase().indexOf(searchQuery.toLowerCase());
            return indexA - indexB;
          }
          return 0;
        })
    : [];

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

        {/* Error Banner with Retry */}
        {error ? (
          <ErrorMessageView
            compact
            isRetrying={isLoading}
            message={error}
            onRetry={() => void refresh()}
          />
        ) : null}

        {workspace ? (
          <>
            {/* Top Subject Banner */}
            <View style={styles.subjectBanner}>
              <Text style={styles.subjectNameText}>{workspace.subject.name || subject.name}</Text>
            </View>

            {/* Subject Statistics Card (Relocated to the Top) */}
            <SubjectStatisticsCard
              completedChapters={completedCount}
              totalChapters={workspace.subject.chapterCount || workspace.chapters.length || subject.chapterCount}
            />

            {/* Search Input Bar */}
            <View style={styles.searchBarContainer}>
              <AppIcon color={themeColors.textMuted} name="search-outline" size={18} />
              <TextInput
                clearButtonMode="never"
                onChangeText={setSearchQuery}
                placeholder="Search chapters..."
                placeholderTextColor={themeColors.textMuted}
                style={styles.searchInput}
                value={searchQuery}
              />
              {searchQuery.length > 0 ? (
                <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
                  <AppIcon color={themeColors.textMuted} name="close-circle" size={18} />
                </Pressable>
              ) : null}
            </View>

            {/* Chapter Selection section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Chapter Selection</Text>
              <Text style={styles.sectionSubtitle}>
                Choose a chapter topic below to review concepts or view textbook materials.
              </Text>
            </View>

            {/* Space-Efficient Chapter Table List */}
            <View style={styles.tableContainer}>
              {filteredChapters.length === 0 ? (
                <View style={styles.emptySearchContainer}>
                  <Text style={styles.emptySearchText}>No chapters found matching "{searchQuery}"</Text>
                </View>
              ) : (
                filteredChapters.map((chapter) => {
                  const isCompleted = completedChapterIds.includes(chapter.id);
                  return (
                    <Pressable
                      key={chapter.id}
                      onPress={() => onSelectChapter?.(chapter)}
                      style={({ pressed }) => [
                        styles.tableRow,
                        pressed && styles.rowPressed,
                      ]}
                    >
                      <View style={styles.chapterNumBox}>
                        <Text style={styles.chapterNumText}>{chapter.number}</Text>
                      </View>
                      <Text numberOfLines={1} style={styles.chapterTitleText}>
                        {chapter.title}
                      </Text>
                      <View style={styles.rowRightGroup}>
                        {isCompleted ? (
                          <AppIcon color={colors.status.success} name="checkmark-circle" size={16} />
                        ) : null}
                        <AppIcon color={themeColors.textMuted} name="chevron-forward-outline" size={16} />
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>

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
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    height: 40,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: themeColors.textPrimary,
    paddingVertical: 0,
  },
  tableContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    backgroundColor: themeColors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: themeColors.border,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderColor: themeColors.borderSubtle,
    height: 48,
    gap: spacing.sm,
  },
  rowPressed: {
    backgroundColor: themeColors.surfaceSecondary,
    opacity: 0.9,
  },
  chapterNumBox: {
    backgroundColor: themeColors.surfaceSecondary,
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
  },
  chapterNumText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
  },
  chapterTitleText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: themeColors.textPrimary,
  },
  rowRightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  emptySearchContainer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  emptySearchText: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textMuted,
  },
});