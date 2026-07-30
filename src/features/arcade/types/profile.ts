export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface ArcadeUserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  coins: number;
  dailyStreak: number;
  gamesPlayed: number;
  totalCorrect: number;
  totalAnswered: number;
  highestAccuracy: number;
  highestCombo: number;
  achievements: AchievementItem[];
}
