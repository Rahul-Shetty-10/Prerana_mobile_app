import React from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ArcadeProfileCard, GameCard } from "./components";
import { useArcadeProfile } from "./hooks";
import { MOCK_ARCADE_GAMES } from "./constants";
import { GameId } from "./types";
import { AppIcon } from "../../shared/icons";
import { Header } from "../../shared/components/Header";
import { colors, spacing, typography } from "../../shared/theme";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface ArcadeHomeScreenProps {
  getToken?: GetToken;
  onPlayGame?: (gameId: GameId) => void;
}

export function ArcadeHomeScreen({
  getToken,
  onPlayGame,
}: ArcadeHomeScreenProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const { profile, refreshProfile } = useArcadeProfile();
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <Header
        title="Arcade"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            colors={[colors.primary.main]}
            onRefresh={refreshProfile}
            refreshing={false}
            tintColor={colors.primary.main}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Global Arcade Profile Card */}
        <ArcadeProfileCard profile={profile} />

        {/* 2. Games List Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <AppIcon color={colors.accents.amber.text} name="play-circle-outline" size={20} />
            <Text style={styles.sectionTitle}>Arcade Games</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Select a game to start earning XP, coins, and climbing the leaderboard.
          </Text>
        </View>

        {/* 3. Four Game Cards */}
        {MOCK_ARCADE_GAMES.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPlayPress={(id) => onPlayGame?.(id)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl + 20,
    paddingTop: spacing.sm,
  },
  sectionHeader: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
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