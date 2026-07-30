import React from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  AssessmentHeroCard,
  QuickActionCard,
  QuizEntryCard,
  SectionHeader,
  StatusCard,
} from "./components";
import { useQuizzesHomeData } from "./hooks";
import { QuizEntryItem } from "./types";
import { AppIcon } from "../../shared/icons";
import { colors, radius, spacing, typography } from "../../shared/theme";
import { Header } from "../../shared/components/Header";
type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface QuizzesHomeScreenProps {
  getToken?: GetToken;
  onOpenMySubjects?: () => void;
  onOpenNextQuiz?: () => void;
  onViewHistory?: () => void;
  onOpenQuiz?: (entry: QuizEntryItem) => void;
}

export function QuizzesHomeScreen({
  getToken,
  onOpenMySubjects,
  onOpenNextQuiz,
  onViewHistory,
  onOpenQuiz,
}: QuizzesHomeScreenProps) {
  const navigation = useNavigation<any>();
  const { theme  } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);
  const { data, isLoading, error, refresh } = useQuizzesHomeData(getToken);

  const handleQuickAction = (actionType: string) => {
    if (actionType === "openSubjects") {
      onOpenMySubjects?.();
    } else if (actionType === "openNextQuiz") {
      if (data.readyToStart.length > 0) {
        onOpenQuiz?.(data.readyToStart[0]);
      } else {
        onOpenNextQuiz?.();
      }
    } else if (actionType === "viewHistory") {
      onViewHistory?.();
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <Header />
      {/* Top Segment Sub-Navigation Bar */}
      <View style={styles.topSegmentBar}>
        <Pressable style={[styles.segmentTab, styles.activeSegmentTab]}>
          <AppIcon color={colors.primary.main} name="clipboard-outline" size={16} />
          <Text style={[styles.segmentTabText, styles.activeSegmentTabText]}>Quizzes</Text>
        </Pressable>

        <Pressable onPress={() => onViewHistory?.()} style={styles.segmentTab}>
          <AppIcon color={themeColors.textMuted} name="time-outline" size={16} />
          <Text style={styles.segmentTabText}>History</Text>
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
        {isLoading && !data ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary.main} size="large" />
            <Text style={styles.loadingText}>Syncing Quizzes Workspace...</Text>
          </View>
        ) : null}

        {/* Error Banner */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* 1. Hero Card */}
        <AssessmentHeroCard
          onOpenNextQuiz={onOpenNextQuiz}
          onViewHistory={onViewHistory}
          stats={data.hero.stats}
          subtitle={data.hero.subtitle}
          title={data.hero.title}
          variant="quizzes"
        />

        {/* 2. Quick Actions */}
        <SectionHeader
          iconColor={colors.primary.main}
          iconName="flash-outline"
          subtitle="Fast shortcuts for quiz routes and subject learning"
          title="Quick Actions"
        />
        <View style={styles.actionsList}>
          {data.quickActions.map((action) => (
            <QuickActionCard
              action={action}
              key={action.id}
              onPress={handleQuickAction}
            />
          ))}
        </View>

        {/* 3. In Progress */}
        <SectionHeader
          iconColor={colors.accents.amber.text}
          iconName="hourglass-outline"
          subtitle="Diagnostic reviews currently under progress"
          title="In Progress"
        />
        <StatusCard
          buttons={["openNextQuiz", "viewHistory"]}
          onOpenNextQuiz={onOpenNextQuiz}
          onViewHistory={onViewHistory}
          section={data.inProgress}
        />

        {/* 4. Awaiting Review */}
        <SectionHeader
          iconColor={colors.accents.blue.text}
          iconName="checkmark-done-circle-outline"
          subtitle="Finished assessments awaiting review / grading"
          title="Awaiting Review"
        />
        <StatusCard
          buttons={["viewHistory"]}
          onViewHistory={onViewHistory}
          section={data.awaitingReview}
        />

        {/* 5. Ready to Start */}
        <SectionHeader
          iconColor={colors.accents.emerald.text}
          iconName="play-circle-outline"
          subtitle="Curriculum chapter quizzes ready for your section"
          title="Ready to Start"
        />
        {data.readyToStart.map((entry) => (
          <QuizEntryCard
            key={entry.id}
            entry={entry}
            onOpenQuiz={(item) => onOpenQuiz?.(item)}
          />
        ))}

        {/* 6. Recent Completed */}
        <SectionHeader
          iconColor={colors.accents.coral.text}
          iconName="time-outline"
          subtitle="Logged past quiz submissions"
          title="Recent Completed"
        />
        <StatusCard
          buttons={["viewHistory"]}
          onViewHistory={onViewHistory}
          section={data.recentCompleted}
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
  actionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.xs,
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