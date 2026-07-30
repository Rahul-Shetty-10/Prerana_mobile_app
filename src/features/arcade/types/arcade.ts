import { IconName } from "../../../shared/icons";
import { BrainBlitzSessionResult } from "./brainBlitz";
import { ArcadeUserProfile } from "./profile";

export type GameId = "brainBlitz" | "matchMaster" | "lightningTap" | "puzzleQuest";
export type GameStatus = "available" | "coming_soon";

export interface GameMetaCard {
  id: GameId;
  title: string;
  subtitle: string;
  description: string;
  iconName: IconName;
  status: GameStatus;
  difficulty: string;
  xpReward: number;
  bestScore: number;
  completionPercentage: number;
  recentlyPlayed: boolean;
  gradientColors: [string, string];
}

export interface ArcadeHomePayload {
  profile: ArcadeUserProfile;
  games: GameMetaCard[];
}

export type GameEngineStatus = "idle" | "playing" | "paused" | "completed" | "game_over";

export interface ArcadeProfileCardProps {
  profile: ArcadeUserProfile;
}

export interface GameCardProps {
  game: GameMetaCard;
  onPlayPress?: (gameId: GameId) => void;
}

export interface GameHeaderProps {
  title: string;
  score: number;
  lives?: number;
  maxLives?: number;
  combo?: number;
  timeLeft?: number;
  totalTime?: number;
  onBackPress: () => void;
}

export interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  category: string;
  difficulty: string;
  questionText: string;
}

export interface AnswerButtonProps {
  optionText: string;
  index: number;
  isSelected: boolean;
  isCorrect?: boolean;
  isAnswered: boolean;
  disabled?: boolean;
  onPress: (index: number) => void;
}

export interface VictoryModalProps {
  visible: boolean;
  result: BrainBlitzSessionResult;
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

export interface DefeatModalProps {
  visible: boolean;
  result: BrainBlitzSessionResult;
  onPlayAgain: () => void;
  onReturnHome: () => void;
}
