import { useCallback, useEffect, useState } from "react";
import { fetchAchievements, fetchProfileData, performStudentSignOut } from "../services";
import { AchievementItem, LearningStats, StudentInfo, SubjectProgressItem } from "../types";
import { useArcadeProfile } from "../../arcade/hooks";
import { getSavedThemeMode, saveThemeMode, ThemeMode } from "../../../shared/theme";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export function useProfile(getToken?: GetToken) {
  const { profile: arcadeProfile } = useArcadeProfile();
  const [info, setInfo] = useState<StudentInfo | null>(null);
  const [learningStats, setLearningStats] = useState<LearningStats | null>(null);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgressItem[]>([]);
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchProfileData(getToken);
      const achs = await fetchAchievements(getToken);
      const savedTheme = await getSavedThemeMode();

      setInfo(data.info);
      setLearningStats(data.learningStats);
      setSubjectProgress(data.subjectProgress);
      setAchievements(achs);
      setThemeMode(savedTheme);
    } catch (e) {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  const toggleThemeMode = useCallback(async () => {
    const nextMode: ThemeMode = themeMode === "dark" ? "light" : "dark";
    setThemeMode(nextMode);
    await saveThemeMode(nextMode);
  }, [themeMode]);

  const handleSignOut = useCallback(async (clerkSignOut?: () => Promise<void>) => {
    await performStudentSignOut(clerkSignOut);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    info,
    learningStats,
    arcadeProfile,
    achievements,
    subjectProgress,
    themeMode,
    isLoading,
    toggleThemeMode,
    handleSignOut,
    reloadProfile: loadData,
  };
}
