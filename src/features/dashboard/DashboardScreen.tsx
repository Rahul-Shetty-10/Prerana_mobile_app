import React, { useEffect, useState } from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  FocusNowSection,
  LatestSignalsSection,
  PerformanceOverviewSection,
  ResumeQuicklySection,
  StatsSection,
  WelcomeCard,
} from "./components";
import { Header } from "../../shared/components/Header";
import { useDashboardData } from "./hooks";
import { colors, spacing, typography } from "../../shared/theme";
import { getLearningState, saveLearningState } from "../../shared/services/learningStateService";
import { MOCK_SUBJECTS_LIST, MOCK_SUBJECT_WORKSPACE } from "../subjects/constants/subjectsData";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface DashboardScreenProps {
  getToken?: GetToken;
}

export function DashboardScreen({ getToken }: DashboardScreenProps) {
  const navigation = useNavigation<any>();
  const { theme  } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);
  const { data, isLoading, error, refresh } = useDashboardData(getToken);
  const [selectedSubject, setSelectedSubject] = useState<string>(
    data.welcomeCard.selectedSubject || data.welcomeCard.subjects?.[0] || "Physics"
  );

  // Sync saved subject from LearningState on mount
  useEffect(() => {
    (async () => {
      const state = await getLearningState();
      if (state.selectedSubjectId) {
        // Match subject name or ID
        const matched = MOCK_SUBJECTS_LIST.find(
          (s) => s.id === state.selectedSubjectId || s.name.toLowerCase() === state.selectedSubjectId.toLowerCase()
        );
        if (matched) {
          setSelectedSubject(matched.name);
        }
      }
    })();
  }, []);

  // Update selectedSubject once backend data is fetched
  useEffect(() => {
    if (data.welcomeCard.selectedSubject) {
      setSelectedSubject(data.welcomeCard.selectedSubject);
    } else if (data.welcomeCard.subjects && data.welcomeCard.subjects.length > 0) {
      setSelectedSubject(data.welcomeCard.subjects[0]);
    }
  }, [data.welcomeCard.selectedSubject, data.welcomeCard.subjects]);

  const handleSubjectSelect = (subjectName: string) => {
    setSelectedSubject(subjectName);
    const matched = MOCK_SUBJECTS_LIST.find(
      (s) => s.name.toLowerCase() === subjectName.toLowerCase()
    );
    void saveLearningState({
      selectedSubjectId: matched ? matched.id : subjectName,
    });
  };

  const handleContinueLearning = async () => {
    const state = await getLearningState();
    const matchedSubject = MOCK_SUBJECTS_LIST.find(
      (s) => s.name.toLowerCase() === selectedSubject.toLowerCase() || s.id === state.selectedSubjectId
    ) || MOCK_SUBJECTS_LIST[1];

    // Find last opened chapter or fallback to 1st chapter
    const targetChapter = MOCK_SUBJECT_WORKSPACE.chapters.find(
      (ch) => ch.id === state.lastChapterId
    ) || MOCK_SUBJECT_WORKSPACE.chapters[0];

    // Navigate to Subjects tab and deep-link into ChapterResource Screen
    navigation.navigate("SubjectsTab", {
      screen: "ChapterResource",
      params: {
        chapter: targetChapter,
        subjectName: matchedSubject.name,
        subjectId: matchedSubject.id,
        initialTab: state.lastResourceTab || "textbook",
      },
    });
  };

  const handleStudyResources = () => {
    const matchedSubject = MOCK_SUBJECTS_LIST.find(
      (s) => s.name.toLowerCase() === selectedSubject.toLowerCase()
    ) || MOCK_SUBJECTS_LIST[1];

    navigation.navigate("SubjectsTab", {
      screen: "SubjectWorkspace",
      params: {
        subject: matchedSubject,
      },
    });
  };

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
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* 1. Welcome Card Component */}
        <WelcomeCard
          badgeText={data.welcomeCard.badgeText}
          description={data.welcomeCard.description}
          onContinueLearning={handleContinueLearning}
          onSubjectSelect={handleSubjectSelect}
          onStudyResources={handleStudyResources}
          selectedSubject={selectedSubject}
          subjects={data.welcomeCard.subjects}
          title={data.welcomeCard.title}
        />

        {/* 2. Reusable Stats Section Component */}
        <StatsSection stats={data.stats} />

        {/* 3. Focus Now Section */}
        <FocusNowSection
          libraryStatus={data.focusNow.libraryStatus}
          nextChapter={data.focusNow.nextChapter}
          onOpenLibrary={() => {
            navigation.navigate("LibraryTab");
          }}
          onStartChapter={handleContinueLearning}
        />

        {/* 4. Subject Performance Overview Section */}
        <PerformanceOverviewSection
          masteryLevel={data.performance.masteryLevel}
          overallAccuracy={data.performance.overallAccuracy}
          subjectsPerformance={data.performance.subjectsPerformance}
        />

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
});