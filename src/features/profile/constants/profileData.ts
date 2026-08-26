import {
  AccountOptionItem,
  AchievementItem,
  LearningStats,
  StudentInfo,
  SubjectProgressItem,
} from "../types";

export const MOCK_STUDENT_INFO: StudentInfo = {
  name: "Prerana Learner",
  email: "student@prerana.edu.in",
  enrollmentId: "PRERANA-2026-8942",
  studentClass: "Class 11 Science",
  board: "CBSE / State Board",
  workspace: "Main Campus - Section A",
};

export const MOCK_LEARNING_STATS: LearningStats = {
  overallAccuracy: 0,
  questionsSolved: 0,
  studyHours: 0,
  completedChapters: 0,
  completedSubjects: 0,
  weeklyProgressPercent: 0,
};

export const MOCK_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: "ach-1",
    title: "First Quiz",
    description: "Completed your first assessment session.",
    iconName: "trophy-outline",
    unlocked: true,
    unlockedAt: "2026-07-10",
    category: "Assessment",
  },
  {
    id: "ach-2",
    title: "100 Questions",
    description: "Solved over 100 questions in Prerana App.",
    iconName: "disc-outline",
    unlocked: true,
    unlockedAt: "2026-07-15",
    category: "Practice",
  },
  {
    id: "ach-3",
    title: "7 Day Streak",
    description: "Studied 7 consecutive days in a row.",
    iconName: "flame-outline",
    unlocked: true,
    unlockedAt: "2026-07-18",
    category: "Streak",
  },
  {
    id: "ach-4",
    title: "Puzzle Master",
    description: "Solved 10 logic puzzles in Puzzle Quest.",
    iconName: "extension-puzzle-outline",
    unlocked: true,
    unlockedAt: "2026-07-19",
    category: "Arcade",
  },
  {
    id: "ach-5",
    title: "Lightning Champion",
    description: "Scored 200+ points in 60s Lightning Tap.",
    iconName: "thunderstorm-outline",
    unlocked: true,
    unlockedAt: "2026-07-20",
    category: "Arcade",
  },
  {
    id: "ach-6",
    title: "Match Master",
    description: "Matched all pairs on Hard difficulty in under 60 seconds.",
    iconName: "git-network-outline",
    unlocked: false,
    category: "Arcade",
  },
];

export const MOCK_SUBJECT_PROGRESS: SubjectProgressItem[] = [];

export const MOCK_ACCOUNT_OPTIONS: AccountOptionItem[] = [
  {
    id: "opt-help",
    title: "Help & Support",
    subtitle: "FAQs, Contact Support, User Guides",
    iconName: "help-circle-outline",
    actionType: "dialog",
  },
  {
    id: "opt-privacy",
    title: "Privacy Policy",
    subtitle: "Data protection and privacy guidelines",
    iconName: "shield-checkmark-outline",
    actionType: "link",
  },
  {
    id: "opt-terms",
    title: "Terms & Conditions",
    subtitle: "Terms of service and student agreement",
    iconName: "document-text-outline",
    actionType: "link",
  },
  {
    id: "opt-about",
    title: "About Prerana App",
    subtitle: "SmartGuru AI powered student mobile learning",
    iconName: "information-circle-outline",
    actionType: "dialog",
  },
  {
    id: "opt-version",
    title: "App Version",
    subtitle: "Current release",
    iconName: "code-working-outline",
    actionType: "version",
    value: "1.0.0 (Production Candidate)",
  },
];
