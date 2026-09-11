import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ResourceContainer, ResourceTabs } from "./components";
import { RESOURCE_TABS_LIST } from "./constants";
import { useChapterResources } from "./hooks";
import { ChapterItem, ResourceTabItem, ResourceTabType } from "./types";
import { colors, spacing, typography, radius, shadows } from "../../shared/theme";
import { Header } from "../../shared/components/Header";
import { ErrorMessageView } from "../../shared/components/ErrorMessageView";
import { AppIcon } from "../../shared/icons";
import { saveLearningState } from "../../shared/services/learningStateService";
import { markMilestoneSeen } from "../../shared/services/chapterProgressService";
import { useActiveLearningTracker } from "../../shared/hooks/useActiveLearningTracker";

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
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);
  const navigation = useNavigation<any>();
  useActiveLearningTracker();

  const handleStartQuiz = () => {
    navigation.navigate("Exercise", {
      trackType: "explorer",
      subjectId: subjectId || chapter.id,
      chapterId: chapter.id,
      title: `${subjectName} - Chapter ${chapter.number} Quiz`,
      chapter,
      subjectName,
    });
  };


  const [activeTab, setActiveTab] = useState<ResourceTabType>(initialTab || "infographic");
  const [slidedeckPageIndex, setSlidedeckPageIndex] = useState(0);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const { resources, isLoading, error, refresh } = useChapterResources(
    subjectId || chapter.id,
    chapter.id,
    getToken
  );

  const navigateToGame = () => {
    if (!resources?.wordGames) return;
    navigation.navigate("ChapterArcade", {
      subjectId: subjectId || chapter.id,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      subjectName,
      wordGames: resources.wordGames,
    });
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (chapter && subjectName) {
      void saveLearningState({
        selectedSubjectId: subjectId || subjectName,
        lastSubjectName: subjectName,
        lastChapterId: chapter.id,
        lastChapterTitle: `Chapter ${chapter.number}: ${chapter.title}`,
        lastResourceTab: activeTab,
      });
    }
  }, [chapter, subjectName, subjectId, activeTab]);

  // Track milestones (Infographic, Slidedeck, Flashcards, Audio, Video seen)
  useEffect(() => {
    if (chapter && subjectId && (activeTab === "infographic" || activeTab === "slidedeck" || activeTab === "flashcards" || activeTab === "audio" || activeTab === "video")) {
      void markMilestoneSeen(chapter.id, subjectId, activeTab as any);
    }
  }, [chapter, subjectId, activeTab]);


  // Show "Coming Soon" after 5 seconds if still loading and no resources have arrived
  useEffect(() => {
    let timer: any;
    if (isLoading) {
      setShowComingSoon(false);
      timer = setTimeout(() => {
        setShowComingSoon(true);
      }, 5000); // 5 seconds
    } else {
      setShowComingSoon(true);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  // Build game tabs dynamically – only include Arcade tab if any game has data
  const dynamicTabs = useMemo((): ResourceTabItem[] => {
    const wg = resources?.wordGames;
    const hasGames = wg && (
      (wg.crosswords && wg.crosswords.length > 0) ||
      (wg.hangman && wg.hangman.length > 0) ||
      (wg.memoryBattle && wg.memoryBattle.length > 0) ||
      (wg.speedSniper && wg.speedSniper.length > 0)
    );
    
    if (hasGames) {
      return [...RESOURCE_TABS_LIST, { id: "arcade" as any, label: "Arcade", iconName: "game-controller-outline" }];
    }
    
    return RESOURCE_TABS_LIST;
  }, [resources?.wordGames]);

  const handleTabSelect = (tab: ResourceTabType) => {
    // Game tabs navigate immediately rather than switching content pane
    if (tab === ("arcade" as any)) {
      navigateToGame();
      return;
    }
    setActiveTab(tab);
  };

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <Header
        title={`Chapter ${chapter.number}: ${chapter.title}`}
        onBackPress={onBackPress}
      />

      {/* Top horizontal scrollable resource tabs (includes game tabs when available) */}
      <ResourceTabs
        activeTab={activeTab}
        onTabSelect={handleTabSelect}
        tabs={dynamicTabs}
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

        {/* Error Banner with Retry */}
        {error ? (
          <ErrorMessageView
            compact
            isRetrying={isLoading}
            message={error}
            onRetry={() => void refresh()}
          />
        ) : null}

        {/* Active Viewer Content */}
        <ResourceContainer
          activeTab={activeTab}
          chapterTitle={chapter.title}
          resources={resources || (!isLoading && !error ? {} as any : undefined)}
          slidedeckPageIndex={slidedeckPageIndex}
          onSlidedeckPageChange={setSlidedeckPageIndex}
          flashcardIndex={flashcardIndex}
          onFlashcardIndexChange={setFlashcardIndex}
        />
      </ScrollView>

      {/* Floating Quiz Button */}
      <Pressable
        accessibilityLabel="Quiz Yourself"
        accessibilityRole="button"
        onPress={handleStartQuiz}
        style={({ pressed }) => [
          styles.floatingQuizBtn,
          pressed && styles.floatingQuizBtnPressed,
        ]}
      >
        <AppIcon color="#FFFFFF" name="clipboard-outline" size={18} />
        <Text style={styles.floatingQuizBtnText}>Quiz Yourself</Text>
      </Pressable>
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
    paddingBottom: spacing.xxl + 48,
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
  floatingQuizBtn: {
    position: "absolute",
    bottom: 24,
    right: 20,
    backgroundColor: colors.primary.main,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm - 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    gap: spacing.xs,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  floatingQuizBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  floatingQuizBtnText: {
    color: "#FFFFFF",
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
  },
});
