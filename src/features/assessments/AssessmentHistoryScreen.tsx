import React from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AssessmentHeroCard,
  InformationCard,
  QuizEntryCard,
  SectionHeader,
  StatusCard,
} from "./components";
import { useAssessmentHistoryData } from "./hooks";
import { QuizEntryItem } from "./types";
import { AppIcon } from "../../shared/icons";
import { colors, radius, spacing, typography } from "../../shared/theme";
import { Header } from "../../shared/components/Header";
type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface AssessmentHistoryScreenProps {
  getToken?: GetToken;
  onSwitchToQuizzes?: () => void;
  onOpenMySubjects?: () => void;
  onOpenAvailableQuiz?: () => void;
  onOpenQuiz?: (entry: QuizEntryItem) => void;
}

export function AssessmentHistoryScreen({
  getToken,
  onSwitchToQuizzes,
  onOpenMySubjects,
  onOpenAvailableQuiz,
  onOpenQuiz,
}: AssessmentHistoryScreenProps) {
  const { theme  } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);
  const { data, isLoading, error, refresh } = useAssessmentHistoryData(getToken);

  const handleDefaultOpenQuiz = () => {
    if (data.availableQuizEntries.length > 0) {
      onOpenQuiz?.(data.availableQuizEntries[0]);
    } else {
      onOpenAvailableQuiz?.();
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <Header
        title="Assessment History"
      />
      {/* Top Segment Sub-Navigation Bar */}
      <View style={styles.topSegmentBar}>
        <Pressable onPress={() => onSwitchToQuizzes?.()} style={styles.segmentTab}>
          <AppIcon color={themeColors.textMuted} name="clipboard-outline" size={16} />
          <Text style={styles.segmentTabText}>Quizzes</Text>
        </Pressable>

        <Pressable style={[styles.segmentTab, styles.activeSegmentTab]}>
          <AppIcon color={colors.primary.main} name="time-outline" size={16} />
          <Text style={[styles.segmentTabText, styles.activeSegmentTabText]}>History</Text>
        </Pressable>
      </View>

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
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary.main} size="large" />
            <Text style={styles.loadingText}>Syncing Assessment History...</Text>
          </View>
        ) : null}

        {/* Error Banner */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* 1. History Summary Hero */}
        <AssessmentHeroCard
          onOpenAvailableQuiz={handleDefaultOpenQuiz}
          stats={data.hero.stats}
          subtitle={data.hero.subtitle}
          title={data.hero.title}
          variant="history"
        />

        {/* 2. Information Cards */}
        <SectionHeader
          iconColor={colors.primary.main}
          iconName="information-circle-outline"
          subtitle="Scope parameters and subject shortcuts"
          title="Learning Scope & Actions"
        />
        <InformationCard onOpenMySubjects={onOpenMySubjects} type="continueLearning" />
        <InformationCard scope={data.scope} type="currentScope" />

        {/* 3. Recent Attempts */}
        <SectionHeader
          iconColor={colors.accents.blue.text}
          iconName="time-outline"
          subtitle="Logged past quiz submissions"
          title="Recent Attempts"
        />
        <StatusCard
          buttons={["openAvailableQuiz", "openMySubjects"]}
          onOpenAvailableQuiz={handleDefaultOpenQuiz}
          onOpenMySubjects={onOpenMySubjects}
          section={data.recentAttempts}
        />

        {/* 4. In Progress Attempts */}
        <SectionHeader
          iconColor={colors.accents.amber.text}
          iconName="hourglass-outline"
          subtitle="Ongoing unsubmitted attempts"
          title="In Progress Attempts"
        />
        <StatusCard
          buttons={["openAvailableQuiz", "openMySubjects"]}
          onOpenAvailableQuiz={handleDefaultOpenQuiz}
          onOpenMySubjects={onOpenMySubjects}
          section={data.inProgressAttempts}
        />

        {/* 5. Available Quiz Entries */}
        <SectionHeader
          iconColor={colors.accents.emerald.text}
          iconName="play-circle-outline"
          subtitle="Curriculum chapter quizzes ready for your section"
          title="Available Quiz Entries"
        />
        {data.availableQuizEntries.map((entry) => (
          <QuizEntryCard
            key={entry.id}
            entry={entry}
            onOpenQuiz={(item) => onOpenQuiz?.(item)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  topSegmentBar: {
    flexDirection: "row",
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  segmentTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    gap: spacing.xs,
  },
  activeSegmentTab: {
    backgroundColor: themeColors.surfaceHighlighted,
    borderColor: colors.primary.main,
  },
  segmentTabText: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textMuted,
  },
  activeSegmentTabText: {
    color: colors.primary.main,
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
