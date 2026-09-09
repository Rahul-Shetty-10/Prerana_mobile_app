import React, { useEffect, useState } from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import {
  Modal,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useClerk, useAuth } from "@clerk/expo";
import { useNavigation, useIsFocused } from "@react-navigation/native";
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
import { SubjectProgressItem } from "./types";
import { AppIcon } from "../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../shared/theme";
import { Header } from "../../shared/components/Header";
import { getCalculatedStats, mergeSubjectProgressWithLocal } from "../../shared/services/chapterProgressService";
import { getAttemptStats, calculateAccuracy } from "../../shared/services/attemptTracker";
import { getActiveLearningSeconds } from "../../shared/hooks/useActiveLearningTracker";
import { appConfig } from "../../config";

export interface ProfileScreenProps {
  onBackPress?: () => void;
}

export function ProfileScreen({ onBackPress }: ProfileScreenProps) {
  const { signOut } = useClerk();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { theme } = useTheme();
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
  const [localStats, setLocalStats] = useState<any>(null);
  const [mergedProgress, setMergedProgress] = useState<SubjectProgressItem[]>([]);
  const [trackerStats, setTrackerStats] = useState<{ activeHours: string; accuracy: number; questionsAttempted: number } | null>(null);
  const { userId } = useAuth();

  useEffect(() => {
    if (isFocused) {
      (async () => {
        const stats = await getCalculatedStats();
        setLocalStats(stats);

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

        if (subjectProgress && subjectProgress.length > 0) {
          const merged = await mergeSubjectProgressWithLocal(subjectProgress);
          setMergedProgress(merged);
        }
      })();
    }
  }, [isFocused, subjectProgress]);

  const mergedLearningStats = learningStats
    ? {
        ...learningStats,
        overallAccuracy: trackerStats && trackerStats.questionsAttempted > 0
          ? trackerStats.accuracy
          : (localStats && localStats.overallAccuracy > 0
              ? localStats.overallAccuracy
              : learningStats.overallAccuracy),
        questionsSolved: trackerStats && trackerStats.questionsAttempted > 0
          ? trackerStats.questionsAttempted
          : (learningStats.questionsSolved + (localStats?.questionsSolved ?? 0)),
        completedChapters: learningStats.completedChapters + (localStats?.completedChaptersCount ?? 0),
        studyHours: trackerStats && trackerStats.activeHours !== "0.0"
          ? parseFloat(trackerStats.activeHours)
          : learningStats.studyHours,
      }
    : null;

  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

  const onLogoutPress = () => {
    setLogoutConfirmVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutConfirmVisible(false);
    await handleSignOut(async () => {
      await signOut();
    });
  };

  const openExternalPage = async (url: string, failureMessage: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error("URL is not supported");
      await Linking.openURL(url);
    } catch {
      Alert.alert("Unable to open link", failureMessage);
    }
  };

  const handleAccountOptionPress = (id: string) => {
    if (id === "opt-help") {
      setDialogInfo({
        title: "Help & Support",
        message: appConfig.supportEmail
          ? `For support, email ${appConfig.supportEmail}.`
          : "Support contact is not configured for this build.",
      });
    } else if (id === "opt-about") {
      setDialogInfo({
        title: "About Prerana App",
        message: "Prerana Student Mobile App v1.0.0. Powered by SmartGuru AI learning technology.",
      });
    } else if (id === "opt-privacy") {
      void openExternalPage(appConfig.privacyPolicyUrl, "The privacy policy is not configured for this build.");
    } else if (id === "opt-terms") {
      void openExternalPage(appConfig.termsUrl, "The terms page is not configured for this build.");
    } else if (id === "opt-delete") {
      Alert.alert(
        "Delete account and data?",
        `Submit a request to delete your Prerana account and associated data. If your account is managed by a school, your administrator may need to complete the request. You can request deletion online${appConfig.privacyEmail ? ` or email ${appConfig.privacyEmail}` : ""}.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open deletion page",
            style: "destructive",
            onPress: () => void openExternalPage(appConfig.accountDeletionUrl, "Please use the deletion email option instead."),
          },
          {
            text: "Email request",
            onPress: () => void openExternalPage(
              appConfig.privacyEmail ? `mailto:${appConfig.privacyEmail}?subject=Prerana%20account%20deletion%20request` : "",
              "The deletion email address is not configured for this build.",
            ),
          },
        ],
      );
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
        {mergedLearningStats ? <LearningStatsCard stats={mergedLearningStats} /> : null}

        {/* Section 3: App Preferences & Games */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <AppIcon color={themeColors.textPrimary} name="settings-outline" size={18} />
            <Text style={styles.sectionHeading}>Preferences & Games</Text>
          </View>

          <PreferenceTile
            iconName="clipboard-outline"
            onPress={() => navigation.navigate("Games")}
            subtitle="Access the quizzes history and performance assessments"
            title="Assessments"
          />

          <PreferenceTile
            iconName="language-outline"
            onPress={() => {
              setDialogInfo({
                title: "Language Settings",
                message: "Select your preferred learning language:\n\n• English (Active)\n• Hindi\n• Kannada\n\nMore languages will be available in future releases.",
              });
            }}
            subtitle="English (Default)"
            title="Language"
          />

          <PreferenceTile
            iconName="notifications-outline"
            onPress={() => {
              setDialogInfo({
                title: "Notifications Info",
                message: "Manage push notifications, announcements, and study reminder schedules.\n\nAll notification defaults are currently active.",
              });
            }}
            subtitle="Push notifications & study reminders"
            title="Notifications"
          />
        </View>

        {/* Section 4: Arcade Statistics */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <AppIcon color={themeColors.textPrimary} name="game-controller-outline" size={18} />
            <Text style={styles.sectionHeading}>Arcade Summary</Text>
          </View>
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

          <View style={styles.subHeaderRow}>
            <AppIcon color={themeColors.textPrimary} name="trophy-outline" size={18} />
            <Text style={styles.subHeading}>Achievements</Text>
          </View>
          {achievements.length > 0 ? (
            achievements.map((ach) => (
              <AchievementCard key={ach.id} achievement={ach} />
            ))
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 16, gap: 4 }}>
              <AppIcon color={themeColors.textMuted} name="ribbon-outline" size={28} />
              <Text style={{ fontSize: 13, color: themeColors.textMuted, textAlign: "center" }}>
                No achievements yet. Keep playing to unlock them!
              </Text>
            </View>
          )}
        </View>

        {/* Section 5: Account & Support */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <AppIcon color={themeColors.textPrimary} name="information-circle-outline" size={18} />
            <Text style={styles.sectionHeading}>Account & Legal</Text>
          </View>
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

      {/* Logout Confirm Modal */}
      <Modal transparent animationType="fade" visible={logoutConfirmVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.dialogCard}>
            <AppIcon color={colors.status.error} name="log-out-outline" size={28} />
            <Text style={styles.dialogTitle}>Sign Out</Text>
            <Text style={styles.dialogMessage}>Are you sure you want to sign out of the Prerana App?</Text>
            <Pressable onPress={confirmLogout} style={[styles.dialogCloseBtn, { backgroundColor: colors.status.error }]}>
              <Text style={styles.dialogCloseText}>Sign Out</Text>
            </Pressable>
            <Pressable onPress={() => setLogoutConfirmVisible(false)} style={[styles.dialogCloseBtn, { backgroundColor: themeColors.surfaceSecondary }]}>
              <Text style={[styles.dialogCloseText, { color: themeColors.textPrimary }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    marginBottom: spacing.sm + 2,
  },
  sectionHeading: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  subHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  subHeading: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
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
    gap: spacing.sm,
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
