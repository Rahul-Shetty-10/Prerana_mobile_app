import React, { useRef, useState } from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { FundamentalsHero, SubjectList } from "./components";
import { useFundamentalsData } from "./hooks";
import { SubjectDetailPlaceholderScreen } from "./SubjectDetailPlaceholderScreen";
import { SubjectItem } from "./types";
import { colors, spacing, typography } from "../../shared/theme";
import { Header } from "../../shared/components/Header";
import { ErrorMessageView } from "../../shared/components/ErrorMessageView";
type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface FundamentalsHomeScreenProps {
  getToken?: GetToken;
  onSelectSubject?: (subject: SubjectItem) => void;
  onOpenMySubjects?: () => void;
}

export function FundamentalsHomeScreen({
  getToken,
  onSelectSubject,
  onOpenMySubjects,
}: FundamentalsHomeScreenProps) {
  const navigation = useNavigation<any>();
  const { theme  } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);
  const { data, isLoading, error, refresh } = useFundamentalsData(getToken);
  const [localSelectedSubject, setLocalSelectedSubject] = useState<SubjectItem | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSelectSubject = (subject: SubjectItem) => {
    if (onSelectSubject) {
      onSelectSubject(subject);
    } else {
      setLocalSelectedSubject(subject);
    }
  };

  // If a subject card is selected locally without a stack navigator, render the destination screen
  if (!onSelectSubject && localSelectedSubject) {
    return (
      <SubjectDetailPlaceholderScreen
        onBackPress={() => setLocalSelectedSubject(null)}
        subject={localSelectedSubject}
      />
    );
  }

  const handleOpenSubjectsPress = () => {
    if (onOpenMySubjects) {
      onOpenMySubjects();
    } else {
      scrollViewRef.current?.scrollTo({ y: 220, animated: true });
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        ref={scrollViewRef}
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

        {/* 1. Hero Section */}
        <FundamentalsHero
          onOpenSubjectsPress={handleOpenSubjectsPress}
          subjectCount={data.subjectCount}
          trackCount={data.trackCount}
        />

        {/* 2. Subject List Section */}
        <SubjectList
          onSelectSubject={handleSelectSubject}
          subjects={data.subjects}
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
