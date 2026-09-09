import { useCallback, useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/expo";
import { fetchAchievements, fetchProfileData, performStudentSignOut } from "../services";
import { AchievementItem, LearningStats, StudentInfo, SubjectProgressItem } from "../types";
import { useArcadeProfile } from "../../arcade/hooks";
import { getSavedThemeMode, saveThemeMode, ThemeMode } from "../../../shared/theme";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export function useProfile(passedGetToken?: GetToken) {
  const { getToken: clerkGetToken, userId } = useAuth();
  const getToken = passedGetToken || clerkGetToken;

  const { profile: arcadeProfile } = useArcadeProfile();
  const [info, setInfo] = useState<StudentInfo | null>(null);
  const [learningStats, setLearningStats] = useState<LearningStats | null>(null);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgressItem[]>([]);
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [isLoading, setIsLoading] = useState(true);

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const loadData = useCallback(async () => {
    const activeGetToken = getTokenRef.current;
    setIsLoading(true);
    const [profileResult, achievementsResult, themeResult] = await Promise.allSettled([
      fetchProfileData(activeGetToken),
      fetchAchievements(activeGetToken),
      getSavedThemeMode(),
    ]);

    if (profileResult.status === "fulfilled") {
      setInfo(profileResult.value.info);
      setLearningStats(profileResult.value.learningStats);
      setSubjectProgress(profileResult.value.subjectProgress);
    } else {
      console.warn("[PROFILE] Profile data could not be loaded:", profileResult.reason);
    }

    if (achievementsResult.status === "fulfilled") {
      setAchievements(achievementsResult.value);
    } else {
      console.warn("[PROFILE] Achievements could not be loaded:", achievementsResult.reason);
      setAchievements([]);
    }

    if (themeResult.status === "fulfilled") {
      setThemeMode(themeResult.value);
    }

    setIsLoading(false);
  }, []);

  const toggleThemeMode = useCallback(async () => {
    const nextMode: ThemeMode = themeMode === "dark" ? "light" : "dark";
    setThemeMode(nextMode);
    await saveThemeMode(nextMode);
  }, [themeMode]);

  const handleSignOut = useCallback(async (clerkSignOut?: () => Promise<void>) => {
    await performStudentSignOut(clerkSignOut, userId);
  }, [userId]);

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
