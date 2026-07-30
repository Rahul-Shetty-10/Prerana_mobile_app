import { useCallback, useEffect, useState } from "react";
import { getArcadeProfile, updateArcadeProfileOnGameEnd } from "../services";
import { ArcadeUserProfile } from "../types";

export function useArcadeProfile() {
  const [profile, setProfile] = useState<ArcadeUserProfile>(getArcadeProfile());

  const refreshProfile = useCallback(() => {
    setProfile(getArcadeProfile());
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
    refreshProfile();
  }, [refreshProfile]);

  return {
    profile,
    refreshProfile,
    recordGameResult,
  };
}
