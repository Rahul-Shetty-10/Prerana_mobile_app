import React from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ChapterShelfCard,
  FeaturedResourceCard,
  LibraryHeroCard,
  SavedOutputsCard,
} from "./components";
import { useLibraryData } from "./hooks";
import { ChapterShelfItem, FeaturedResourceItem } from "./types";
import { AppIcon } from "../../shared/icons";
import { colors, spacing, typography } from "../../shared/theme";
import { Header } from "../../shared/components/Header";
import { ErrorMessageView } from "../../shared/components/ErrorMessageView";
type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface MyLibraryHomeScreenProps {
  getToken?: GetToken;
  onOpenMySubjects?: () => void;
  onOpenChapterShelf?: (shelf: ChapterShelfItem) => void;
  onOpenFeaturedResource?: (resource: FeaturedResourceItem) => void;
}

export function MyLibraryHomeScreen({
  getToken,
  onOpenMySubjects,
  onOpenChapterShelf,
  onOpenFeaturedResource,
}: MyLibraryHomeScreenProps) {
  const navigation = useNavigation<any>();
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);
  const { data, isLoading, error, refresh } = useLibraryData(getToken);

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <Header />
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
            <Text style={styles.loadingText}>Syncing AI Library...</Text>
          </View>
        ) : null}



        {/* Error Banner - shown above hero content */}
        {error ? (
          <ErrorMessageView
            compact
            isRetrying={isLoading}
            message={error}
            onRetry={() => void refresh()}
          />
        ) : null}

        {/* 1. Hero Card Section */}
        <LibraryHeroCard
          onOpenMySubjects={() => onOpenMySubjects?.()}
          stats={data.hero.stats}
          subtitle={data.hero.subtitle}
          title={data.hero.title}
        />

        {/* 2. Saved AI Outputs Section */}
        <SavedOutputsCard
          badgeText={data.savedOutputs.badgeText}
          description={data.savedOutputs.description}
          placeholderText={data.savedOutputs.placeholderText}
          savedItems={data.savedOutputs.items}
          title={data.savedOutputs.title}
        />

        {/* 3. Chapter Resource Shelves Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <AppIcon color={colors.primary.main} name="folder-open-outline" size={20} />
            <Text style={styles.sectionTitle}>Chapter Resource Shelves</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Browse curated subject shelves with all approved study materials.
          </Text>
        </View>

        {/* Chapter Shelves List */}
        {data.chapterShelves.map((shelf) => (
          <ChapterShelfCard
            key={shelf.id}
            onOpenChapterShelf={(item) => onOpenChapterShelf?.(item)}
            shelf={shelf}
          />
        ))}

        {/* 4. Featured Approved Resources Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <AppIcon color={colors.primary.main} name="star-outline" size={20} />
            <Text style={styles.sectionTitle}>Featured Approved Resources</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Jump directly to high-yield infographics, mindmaps, slidedecks, and flashcards.
          </Text>
        </View>

        {/* Featured Resources List */}
        {data.featuredResources.map((resource) => (
          <FeaturedResourceCard
            key={resource.id}
            onOpenResource={(item) => onOpenFeaturedResource?.(item)}
            resource={resource}
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
  sectionHeader: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textSecondary,
  },
});
