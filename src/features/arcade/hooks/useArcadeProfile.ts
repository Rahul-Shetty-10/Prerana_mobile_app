import { useCallback, useEffect, useState } from "react";
import { getArcadeProfile, updateArcadeProfileOnGameEnd, loadArcadeProfileFromStorage } from "../services";
import { ArcadeUserProfile } from "../types";
import { useIsFocused } from "@react-navigation/native";

export function useArcadeProfile() {
  const [profile, setProfile] = useState<ArcadeUserProfile>(getArcadeProfile());
  const isFocused = useIsFocused();

  const refreshProfile = useCallback(async () => {
    const loaded = await loadArcadeProfileFromStorage();
    setProfile(loaded);
  }, []);

  const recordGameResult = useCallback(
    (params: {
      xpEarned: number;
      coinsEarned: number;
      correctAnswers: number;
      totalQuestions: number;
      score: number;
    }) => {
      const updated = updateArcadeProfileOnGameEnd(params);
      setProfile(updated);
      return updated;
    },
    []
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
