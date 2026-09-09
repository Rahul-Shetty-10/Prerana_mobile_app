import React, { useState } from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SubjectList } from "./components";
import { useSubjectsList } from "./hooks";
import { SubjectMeta } from "./types";
import { colors, spacing, typography } from "../../shared/theme";
import { Header } from "../../shared/components/Header";
type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface SubjectSelectionScreenProps {
  getToken?: GetToken;
  onSelectSubject?: (subject: SubjectMeta) => void;
}

export function SubjectSelectionScreen({
  getToken,
  onSelectSubject,
}: SubjectSelectionScreenProps) {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);
  const { subjects, isLoading, error, refresh } = useSubjectsList(getToken);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const fromTab = route.params?.fromTab;

  const handleBack = () => {
    if (fromTab) {
      navigation.navigate(fromTab);
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleSelect = (subject: SubjectMeta) => {
    setSelectedId(subject.id);
    onSelectSubject?.(subject);
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <Header
        title="Subject Selection"
        onBackPress={handleBack}
        showBackButton={!!fromTab || navigation.canGoBack()}
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

        {/* Header Block */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Subject Selection</Text>
          <Text style={styles.headerSubtitle}>
            Select a subject to open its complete learning workspace, chapter list, and study resources.
          </Text>
        </View>

        {/* Loading Indicator */}
        {isLoading && subjects.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary.main} size="large" />
            <Text style={styles.loadingText}>Loading Subjects...</Text>
          </View>
        ) : null}

        {/* Error Banner */}
        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: isDark ? "#3B1818" : "#FFF0F0", borderColor: isDark ? "#7A2E2E" : "#FFCDD2" }]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Subjects List */}
        <SubjectList
          onSelectSubject={handleSelect}
          selectedSubjectId={selectedId}
          subjects={subjects}
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
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: 4,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl - 2,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: themeColors.textSecondary,
    lineHeight: typography.lineHeight.md,
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
});