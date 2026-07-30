import React, { useEffect, useState } from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ResourceContainer, ResourceTabs } from "./components";
import { RESOURCE_TABS_LIST } from "./constants";
import { useChapterResources } from "./hooks";
import { ChapterItem, ResourceTabType } from "./types";
import { colors, spacing, typography } from "../../shared/theme";
import { Header } from "../../shared/components/Header";
type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface ChapterResourceScreenProps {
  chapter: ChapterItem;
  subjectName: string;
  subjectId?: string;
  getToken?: GetToken;
  initialTab?: ResourceTabType;
  onBackPress?: () => void;
}

export function ChapterResourceScreen({
  chapter,
  subjectName,
  subjectId,
  getToken,
  initialTab,
  onBackPress,
}: ChapterResourceScreenProps) {
  const { theme  } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);




  const [activeTab, setActiveTab] = useState<ResourceTabType>(initialTab || "infographic");
  const [slidedeckPageIndex, setSlidedeckPageIndex] = useState(0);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const { resources, isLoading, error, refresh } = useChapterResources(
    subjectId || chapter.id,
    chapter.id,
    getToken
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabSelect = (tab: ResourceTabType) => {
    setActiveTab(tab);
  };

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <Header
        title="Chapter Resources"
        onBackPress={onBackPress}
      />

      {/* Top horizontal scrollable resource tabs */}
      <ResourceTabs
        activeTab={activeTab}
        onTabSelect={handleTabSelect}
        tabs={RESOURCE_TABS_LIST}
      />

      {/* Active Viewer Content */}
      <ScrollView
        style={styles.viewerContainer}
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
        {/* Chapter Banner Section */}
        <View style={styles.chapterBanner}>
          <Text style={styles.subjectNameText}>{subjectName} • Chapter {chapter.number}</Text>
          <Text style={styles.chapterTitleText}>{chapter.title}</Text>
        </View>

        {/* Loading Indicator */}
        {isLoading && !resources ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary.main} size="large" />
            <Text style={styles.loadingText}>Fetching Chapter Resources...</Text>
          </View>
        ) : null}

        {/* Error Banner */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <ResourceContainer
          activeTab={activeTab}
          chapterTitle={chapter.title}
          resources={resources}
          slidedeckPageIndex={slidedeckPageIndex}
          onSlidedeckPageChange={setSlidedeckPageIndex}
          flashcardIndex={flashcardIndex}
          onFlashcardIndexChange={setFlashcardIndex}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  viewerContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl + 20,
  },
  chapterBanner: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: 2,
  },
  subjectNameText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: colors.primary.main,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  chapterTitleText: {
    fontSize: typography.fontSize.lg,
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
});
