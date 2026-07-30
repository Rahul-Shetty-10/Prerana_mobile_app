import React, { useState } from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useClerk } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import {
  AccountTile,
  AchievementCard,
  LearningStatsCard,
  PreferenceTile,
  StudentInfoCard,
  SubjectProgressTile,
} from "./components";
import { MOCK_ACCOUNT_OPTIONS } from "./constants";
import { useProfile } from "./hooks";
import { AppIcon } from "../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../shared/theme";
import { Header } from "../../shared/components/Header";
export interface ProfileScreenProps {
  onBackPress?: () => void;
}

export function ProfileScreen({ onBackPress }: ProfileScreenProps) {
  const { signOut } = useClerk();
  const navigation = useNavigation<any>();
  const { theme, toggleTheme  } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);

  const {
    info,
    learningStats,
    arcadeProfile,
    achievements,
    subjectProgress,
    handleSignOut,
  } = useProfile();

  const [dialogInfo, setDialogInfo] = useState<{ title: string; message: string } | null>(null);

  const onLogoutPress = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to sign out of Prerana App?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await handleSignOut(async () => {
              await signOut();
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleAccountOptionPress = (id: string) => {
    if (id === "opt-help") {
      setDialogInfo({
        title: "Help & Support",
        message: "For support, email support@prerana.edu.in or visit smartguru.ai/help",
      });
    } else if (id === "opt-about") {
      setDialogInfo({
        title: "About Prerana App",
        message: "Prerana Student Mobile App v1.0.0. Powered by SmartGuru AI learning technology.",
      });
    } else if (id === "opt-privacy" || id === "opt-terms") {
      setDialogInfo({
        title: "Legal & Policy",
        message: "Terms and privacy details available at smartguru.ai/privacy",
      });
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <Header
        title="Profile"
        onBackPress={onBackPress}
        showProfile={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Student Information */}
        {info ? <StudentInfoCard info={info} /> : null}

        {/* Section 2: Learning Statistics */}
        {learningStats ? <LearningStatsCard stats={learningStats} /> : null}

        {/* Section 3: App Preferences & Games */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>⚙️ Preferences & Games</Text>

          <PreferenceTile
            iconName={theme === "dark" ? "moon-outline" : "sunny-outline"}
            isToggle
            onToggle={toggleTheme}
            subtitle={theme === "dark" ? "Dark Mode active" : "Light Mode active"}
            title="App Theme"
            toggleValue={theme === "dark"}
          />

          <PreferenceTile
            iconName="game-controller-outline"
            onPress={() => navigation.navigate("Games")}
            subtitle="Access the interactive Arcade Games module"
            title="Arcade"
          />

          <PreferenceTile
            iconName="language-outline"
            isComingSoon
            subtitle="English (Default)"
            title="Language"
          />

          <PreferenceTile
            iconName="notifications-outline"
            isComingSoon
            subtitle="Push notifications & study reminders"
            title="Notifications"
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>📚 Subject Completion</Text>
          {subjectProgress.map((item) => (
            <SubjectProgressTile key={item.id} item={item} />
          ))}
        </View>

        {/* Section 4: Arcade Statistics */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>🎮 Arcade Summary</Text>
          <View style={styles.arcadeSummaryCard}>
            <View style={styles.arcadeStatRow}>
              <View style={styles.arcadeStatBox}>
                <AppIcon color={colors.secondary.main} name="flash" size={18} />
                <Text style={styles.arcadeStatVal}>{arcadeProfile.xp} XP</Text>
                <Text style={styles.arcadeStatLbl}>Total XP</Text>
              </View>

              <View style={styles.arcadeStatBox}>
                <AppIcon color={colors.primary.main} name="trophy" size={18} />
                <Text style={styles.arcadeStatVal}>Lvl {arcadeProfile.level}</Text>
                <Text style={styles.arcadeStatLbl}>Level</Text>
              </View>

              <View style={styles.arcadeStatBox}>
                <AppIcon color={colors.secondary.main} name="wallet-outline" size={18} />
                <Text style={styles.arcadeStatVal}>{arcadeProfile.coins}</Text>
                <Text style={styles.arcadeStatLbl}>Coins</Text>
              </View>

              <View style={styles.arcadeStatBox}>
                <AppIcon color={colors.status.warning} name="flame-outline" size={18} />
                <Text style={styles.arcadeStatVal}>{arcadeProfile.dailyStreak}d</Text>
                <Text style={styles.arcadeStatLbl}>Streak</Text>
              </View>
            </View>
          </View>

          <Text style={styles.subHeading}>🏆 Achievements</Text>
          {achievements.map((ach) => (
            <AchievementCard key={ach.id} achievement={ach} />
          ))}
        </View>

        {/* Section 5: Account & Support */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>ℹ️ Account & Legal</Text>
          {MOCK_ACCOUNT_OPTIONS.map((item) => (
            <AccountTile key={item.id} item={item} onPress={handleAccountOptionPress} />
          ))}
        </View>

        {/* Section 6: Logout Button */}
        <Pressable onPress={onLogoutPress} style={styles.logoutButton}>
          <AppIcon color={colors.status.error} name="log-out-outline" size={20} />
          <Text style={styles.logoutText}>Sign Out from App</Text>
        </Pressable>
      </ScrollView>

      {/* Info Dialog Modal */}
      {dialogInfo ? (
        <Modal transparent animationType="fade" visible={!!dialogInfo}>
          <View style={styles.modalOverlay}>
            <View style={styles.dialogCard}>
              <Text style={styles.dialogTitle}>{dialogInfo.title}</Text>
              <Text style={styles.dialogMessage}>{dialogInfo.message}</Text>
              <Pressable onPress={() => setDialogInfo(null)} style={styles.dialogCloseBtn}>
                <Text style={styles.dialogCloseText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl + 20,
  },
  sectionContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    marginBottom: spacing.sm + 2,
  },
  subHeading: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  arcadeSummaryCard: {
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  arcadeStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  arcadeStatBox: {
    flex: 1,
    alignItems: "center",
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
  },
  arcadeStatVal: {
    fontSize: typography.fontSize.xs + 2,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    marginTop: 2,
  },
  arcadeStatLbl: {
    fontSize: typography.fontSize.xs - 2,
    color: themeColors.textMuted,
    marginTop: 1,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.status.error + "1A",
    borderWidth: 1,
    borderColor: colors.status.error + "44",
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  logoutText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    color: colors.status.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  dialogCard: {
    width: "100%",
    backgroundColor: themeColors.surface,
    borderColor: themeColors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.md,
    ...shadows.lg,
  },
  dialogTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  dialogMessage: {
    fontSize: typography.fontSize.sm,
    color: themeColors.textSecondary,
    textAlign: "center",
    lineHeight: typography.lineHeight.md,
  },
  dialogCloseBtn: {
    width: "100%",
    backgroundColor: colors.primary.main,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: "center",
  },
  dialogCloseText: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.contrastText,
  },
});