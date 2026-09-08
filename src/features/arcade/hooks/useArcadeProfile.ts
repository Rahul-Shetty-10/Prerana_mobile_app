import { useCallback, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/expo";
import { getArcadeProfile, updateArcadeProfileOnGameEnd, loadArcadeProfileFromStorage } from "../services";
import { ArcadeUserProfile } from "../types";
import { useIsFocused } from "@react-navigation/native";

export function useArcadeProfile() {
  const { userId } = useAuth();
  const { user } = useUser();
  const displayName = user?.fullName || user?.firstName || "Student";
  const [profile, setProfile] = useState<ArcadeUserProfile>(() => getArcadeProfile(userId));
  const isFocused = useIsFocused();

  const refreshProfile = useCallback(async () => {
    const loaded = await loadArcadeProfileFromStorage(userId);
    setProfile({ ...loaded, name: loaded.name === "Student" ? displayName : loaded.name });
  }, [displayName, userId]);

  const recordGameResult = useCallback(
    (params: {
      xpEarned: number;
      coinsEarned: number;
      correctAnswers: number;
      totalQuestions: number;
      score: number;
    }) => {
      const updated = updateArcadeProfileOnGameEnd(params, userId);
      setProfile(updated);
      return updated;
    },
    [userId]
  );

  useEffect(() => {
    if (isFocused) {
      void refreshProfile();
    }
  }, [isFocused, refreshProfile]);

  return {
    profile,
    refreshProfile,
    recordGameResult,
  };
}
