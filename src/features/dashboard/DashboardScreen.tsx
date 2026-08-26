import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import {
  FocusNowSection,
  LatestSignalsSection,
  ResumeQuicklySection,
  StatsSection,
  WelcomeCard,
} from "./components";
import { Header } from "../../shared/components/Header";
import { useDashboardData } from "./hooks";
import { colors, spacing, typography } from "../../shared/theme";
import { getLearningState } from "../../shared/services/learningStateService";

import { fetchProfileData } from "../profile/services/profileService";
import { SubjectProgressTile } from "../profile/components/SubjectProgressTile";
import { SubjectProgressItem } from "../profile/types";
import { mergeSubjectProgressWithLocal, getCalculatedStats } from "../../shared/services/chapterProgressService";
import { AppIcon } from "../../shared/icons";
import { useAuth } from "@clerk/clerk-expo";
import { getActiveLearningSeconds } from "../../shared/hooks/useActiveLearningTracker";
import { getAttemptStats, calculateAccuracy } from "../../shared/services/attemptTracker";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface DashboardScreenProps {
  getToken?: GetToken;
}

export function DashboardScreen({ getToken }: DashboardScreenProps) {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);
  const { data, isLoading, error, refresh } = useDashboardData(getToken);
  const [lastStudiedText, setLastStudiedText] = useState<string>("Pick up where you left off");
  const [profileStats, setProfileStats] = useState<any>(null);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgressItem[]>([]);
  const [localCalculatedStats, setLocalCalculatedStats] = useState<any>(null);
  const [trackerStats, setTrackerStats] = useState({ activeHours: "0.0", accuracy: 0, questionsAttempted: 0 });

  const { userId } = useAuth();

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useEffect(() => {
    const launchTime = (globalThis as any).appLaunchTime;
    if (launchTime) {
      const elapsed = Date.now() - launchTime;
      console.log(`[PERF][NAVIGATION] Dashboard rendered: ${elapsed}ms`);
      console.log(`[PERF][BOOT] TOTAL TIME TO DASHBOARD: ${elapsed}ms`);
    }
  }, []);

  // Sync saved subject and last studied progress from LearningState on mount/focus
  useEffect(() => {
    if (!isFocused) return;

    const loadStateAndStats = async () => {
      const state = await getLearningState();

      if (state.lastSubjectName && state.lastChapterTitle) {
        const match = state.lastChapterTitle.match(/Chapter\s+\d+/i);
        const chapterLabel = match ? match[0] : "Chapter 1";
        setLastStudiedText(`${state.lastSubjectName} • ${chapterLabel}`);
      } else {
        setLastStudiedText("Pick up where you left off");
      }

      const calcStats = await getCalculatedStats();
      setLocalCalculatedStats(calcStats);

      if (userId) {
        const activeSeconds = await getActiveLearningSeconds(userId);
        const attemptStats = await getAttemptStats(userId);
        const acc = calculateAccuracy(attemptStats);
        setTrackerStats({
          activeHours: (activeSeconds / 3600).toFixed(1),
          accuracy: acc,
          questionsAttempted: attemptStats.questionsAttempted,
        });
      }

      const activeGetToken = getTokenRef.current;
      if (activeGetToken) {
        try {
          const res = await fetchProfileData(activeGetToken);
          if (res) {
            if (res.learningStats) {
              setProfileStats(res.learningStats);
            }
            if (res.subjectProgress) {
              const merged = await mergeSubjectProgressWithLocal(res.subjectProgress);
              setSubjectProgress(merged);
            }
          }
        } catch (e) {
          // Ignore
        }
      }
    };

    void loadStateAndStats();
  }, [isFocused, userId]);



  const handleContinueLearning = () => {
    navigation.navigate("SubjectsTab", { screen: "SubjectSelection" });
  };

  const getColorVariant = (hex: string): "coral" | "amber" | "blue" | "emerald" | "purple" => {
    const h = hex.toLowerCase();
    if (h.includes("e76f51") || h.includes("ff7043") || h.includes("coral")) return "coral";
    if (h.includes("ffb74d") || h.includes("amber") || h.includes("f1b82d")) return "amber";
    if (h.includes("29b6f6") || h.includes("blue") || h.includes("4fc3f7")) return "blue";
    if (h.includes("66bb6a") || h.includes("emerald") || h.includes("26a69a")) return "emerald";
    return "purple";
  };

  const mergedAccuracy = trackerStats.questionsAttempted > 0 
    ? trackerStats.accuracy 
    : (localCalculatedStats && localCalculatedStats.overallAccuracy > 0
        ? localCalculatedStats.overallAccuracy
        : (profileStats?.overallAccuracy ?? data.performance.overallAccuracy ?? 0));

  const mergedQuestionsSolved = trackerStats.questionsAttempted > 0 
    ? trackerStats.questionsAttempted 
    : ((profileStats?.questionsSolved ?? 0) + (localCalculatedStats?.questionsSolved ?? 0));

  const mergedCompletedChapters = (profileStats?.completedChapters ?? 0) + (localCalculatedStats?.completedChaptersCount ?? 0);

  const mergedStudyHours = trackerStats.activeHours !== "0.0" 
    ? trackerStats.activeHours 
    : (profileStats?.studyHours ?? "0.0");

  const mergedStats = profileStats || localCalculatedStats || trackerStats.questionsAttempted > 0
    ? [
        {
          title: "Overall Accuracy",
          value: `${mergedAccuracy}%`,
          icon: "analytics-outline" as const,
          variant: "coral" as const,
        },
        {
          title: "Questions Solved",
          value: mergedQuestionsSolved.toString(),
          icon: "checkmark-done-circle-outline" as const,
          variant: "emerald" as const,
        },
        {
          title: "Study Hours",
          value: `${mergedStudyHours} hrs`,
          icon: "time-outline" as const,
          variant: "amber" as const,
        },
        {
          title: "Chapters Completed",
          value: mergedCompletedChapters.toString(),
          icon: "book-outline" as const,
          variant: "purple" as const,
        },
      ]
    : data.stats;

  const mergedSubjectsPerformance = subjectProgress && subjectProgress.length > 0
    ? subjectProgress.map((sp) => {
        const variant = sp.color ? getColorVariant(sp.color) : "coral";
        return {
          subject: sp.subjectName,
          scorePercentage: sp.progressPercent,
          questionsSolved: (sp.completedChapters * 10) + (sp.seenChapters ? sp.seenChapters * 2 : 0),
          colorVariant: variant,
        };
      })
    : data.performance.subjectsPerformance;

  const mergedMasteryLevel = mergedAccuracy >= 85
    ? "Advanced"
    : mergedAccuracy >= 70
    ? "Intermediate"
    : mergedAccuracy >= 50
    ? "Average"
    : "Beginner";

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <Header
        avatarUrl={data?.student?.avatarUrl}
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
        {/* Loading Header Indicator if actively fetching */}
        {isLoading && !data ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary.main} size="large" />
            <Text style={styles.loadingText}>Syncing dashboard payload...</Text>
          </View>
        ) : null}

        {/* Error Notification if API request fails */}
        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: isDark ? "#3B1818" : "#FFF0F0", borderColor: isDark ? "#7A2E2E" : "#FFCDD2" }]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* 1. Welcome Card Component */}
        <WelcomeCard
          lastStudiedText={lastStudiedText}
          onContinueLearning={handleContinueLearning}
          title={data.welcomeCard.title}
        />

        {/* 2. Reusable Stats Section Component */}
        {profileStats || localCalculatedStats ? (
          <StatsSection
            stats={mergedStats}
          />
        ) : (
          <View style={{ alignItems: "center", paddingVertical: spacing.md }}>
            <ActivityIndicator color={colors.primary.main} size="small" />
          </View>
        )}

        {/* 3. Focus Now Section */}
        <FocusNowSection
          libraryStatus={data.focusNow.libraryStatus}
          nextChapter={data.focusNow.nextChapter}
          onOpenLibrary={() => {
            navigation.navigate("LibraryTab");
          }}
          onStartChapter={handleContinueLearning}
        />

        {/* Subject Completion Section */}
        {subjectProgress && subjectProgress.length > 0 ? (
          <View style={styles.subjectCompletionContainer}>
            <View style={styles.sectionHeaderRow}>
              <AppIcon color={themeColors.textMuted} name="book-outline" size={16} />
              <Text style={styles.sectionHeading}>Subject Completion</Text>
            </View>
            {subjectProgress.map((item) => (
              <SubjectProgressTile key={item.id} item={item} />
            ))}
          </View>
        ) : null}

        {/* 5. Latest Signals Section */}
        <LatestSignalsSection
          isLoading={isLoading}
          onSignalPress={() => {}}
          signals={data.signals}
        />

        {/* 6. Resume Quickly Action Cards Section */}
        <ResumeQuicklySection routes={data.quickRoutes} />
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
  subjectCompletionContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    marginBottom: spacing.xs,
  },
  sectionHeading: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});