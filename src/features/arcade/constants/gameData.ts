import { GameMetaCard } from "../types";

export const MOCK_ARCADE_GAMES: GameMetaCard[] = [
  {
    id: "brainBlitz",
    title: "Brain Blitz",
    subtitle: "Rapid-fire Quiz",
    description:
      "Test your speed and knowledge across Math, Science, English, Social Studies, and General Knowledge.",
    iconName: "flash-outline",
    status: "available",
    difficulty: "Adaptive",
    xpReward: 150,
    bestScore: 120,
    completionPercentage: 80,
    recentlyPlayed: true,
    gradientColors: ["#E86A50", "#C84E35"],
  },
  {
    id: "matchMaster",
    title: "Match Master",
    subtitle: "Educational Pair Matching",
    description:
      "Match elements, chemical formulas, capitals, and key terms in this memory and speed challenge.",
    iconName: "git-network-outline",
    status: "available",
    difficulty: "Easy / Med / Hard",
    xpReward: 200,
    bestScore: 180,
    completionPercentage: 60,
    recentlyPlayed: true,
    gradientColors: ["#7C3AED", "#4C1D95"],
  },
  {
    id: "lightningTap",
    title: "Lightning Tap",
    subtitle: "3-Second Speed Recognition",
    description:
      "Identify prime numbers, mammals, formulas, and synonyms in under 3 seconds per target.",
    iconName: "thunderstorm-outline",
    status: "available",
    difficulty: "Fast-Paced",
    xpReward: 250,
    bestScore: 210,
    completionPercentage: 50,
    recentlyPlayed: true,
    gradientColors: ["#F5B800", "#D49E00"],
  },
  {
    id: "puzzleQuest",
    title: "Puzzle Quest",
    subtitle: "Sequence & Ordering Puzzle",
    description:
      "Arrange photosynthesis steps, food chains, water cycles, and timelines into correct order.",
    iconName: "extension-puzzle-outline",
    status: "available",
    difficulty: "Logic Puzzle",
    xpReward: 300,
    bestScore: 240,
    completionPercentage: 40,
    recentlyPlayed: true,
    gradientColors: ["#059669", "#064E3B"],
  },
];
