import { ArcadeUserProfile } from "../types";

export const MOCK_ARCADE_PROFILE: ArcadeUserProfile = {
  id: "user-student-1",
  name: "Prerana Learner",
  xp: 1450,
  level: 4,
  coins: 320,
  dailyStreak: 5,
  gamesPlayed: 18,
  totalCorrect: 142,
  totalAnswered: 160,
  highestAccuracy: 88,
  highestCombo: 8,
  achievements: [
    {
      id: "ach-1",
      title: "First Blitz",
      description: "Complete your first Brain Blitz quiz.",
      iconName: "trophy-outline",
      unlocked: true,
      unlockedAt: "2026-07-15",
    },
    {
      id: "ach-2",
      title: "Sharpshooter",
      description: "Achieve 80%+ accuracy in a 10-question session.",
      iconName: "target-outline",
      unlocked: true,
      unlockedAt: "2026-07-18",
    },
    {
      id: "ach-3",
      title: "Combo Master",
      description: "Reach a 5x answer streak in Brain Blitz.",
      iconName: "flame-outline",
      unlocked: true,
      unlockedAt: "2026-07-19",
    },
    {
      id: "ach-4",
      title: "Grand Scholar",
      description: "Earn 2000 total XP in Arcade games.",
      iconName: "star-outline",
      unlocked: false,
    },
  ],
};
