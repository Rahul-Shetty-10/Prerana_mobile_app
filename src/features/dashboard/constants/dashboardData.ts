import {
  FocusNowProps,
  HeaderProps,
  LatestSignalsProps,
  PerformanceOverviewProps,
  QuickRouteItem,
  StatCardProps,
  WelcomeCardProps,
} from "../types";

export const MOCK_STUDENT: HeaderProps = {
  userName: "Rahul Sharma",
  greeting: "Good morning",
  notificationCount: 3,
};

export const MOCK_WELCOME_DATA: WelcomeCardProps = {
  badgeText: "STUDENT DASHBOARD",
  title: "Welcome Back, Rahul!",
  description:
    "Track your daily study targets, review formula sheets, and continue your active practice sets.",
  subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
  selectedSubject: "Physics",
};

export const MOCK_STATS_DATA: StatCardProps[] = [
  {
    title: "Overall Accuracy",
    value: "0%",
    icon: "analytics-outline",
    variant: "coral",
    changeText: "-",
    changeType: "neutral",
  },
  {
    title: "Questions Solved",
    value: "0",
    icon: "checkmark-done-circle-outline",
    variant: "emerald",
    changeText: "-",
    changeType: "neutral",
  },
  {
    title: "Active Learning Time",
    value: "0h",
    icon: "time-outline",
    variant: "amber",
    changeText: "-",
    changeType: "neutral",
  },
  {
    title: "Chapters Completed",
    value: "0",
    icon: "book-outline",
    variant: "purple",
    changeText: "-",
    changeType: "neutral",
  },
];

export const MOCK_FOCUS_NOW: FocusNowProps = {
  nextChapter: undefined,
  libraryStatus: {
    savedResourcesCount: 0,
    activeLabsCount: 0,
  },
};

export const MOCK_PERFORMANCE: PerformanceOverviewProps = {
  overallAccuracy: 0,
  masteryLevel: "Beginner",
  subjectsPerformance: [],
};

export const MOCK_SIGNALS: LatestSignalsProps["signals"] = [
  {
    id: "sig-1",
    category: "assessments",
    title: "Full Mock Test #4 Completed",
    subtitle: "Score: 248/300 • Accuracy: 86%",
    timestamp: "2 hours ago",
    statusText: "Passed",
    statusVariant: "success",
    iconName: "document-text-outline",
  },
  {
    id: "sig-2",
    category: "assessments",
    title: "Physics Weekly Quiz #12",
    subtitle: "Score: 18/20 • Speed: 1.2 min/q",
    timestamp: "Yesterday",
    statusText: "Top 5%",
    statusVariant: "success",
    iconName: "ribbon-outline",
  },
  {
    id: "sig-3",
    category: "requests",
    title: "Organic Chemistry Reaction Mechanism Notes",
    subtitle: "Requested for Chapter 7 • Status: In Review",
    timestamp: "3 hours ago",
    statusText: "Pending",
    statusVariant: "warning",
    iconName: "git-pull-request-outline",
  },
  {
    id: "sig-4",
    category: "requests",
    title: "Calculus Definite Integrals Solution Key",
    subtitle: "Uploaded by Teacher • Ready to download",
    timestamp: "1 day ago",
    statusText: "Approved",
    statusVariant: "info",
    iconName: "checkmark-circle-outline",
  },
  {
    id: "sig-5",
    category: "library",
    title: "NEET 2025 Physics Formula Sheet",
    subtitle: "Saved to Revision Desk",
    timestamp: "4 hours ago",
    statusText: "Saved",
    statusVariant: "info",
    iconName: "bookmark-outline",
  },
  {
    id: "sig-6",
    category: "library",
    title: "Electrostatics Interactive Simulation Lab",
    subtitle: "Added to Study Lab Collection",
    timestamp: "2 days ago",
    statusText: "Saved",
    statusVariant: "info",
    iconName: "flask-outline",
  },
];

export const MOCK_QUICK_ROUTES: QuickRouteItem[] = [
  {
    id: "qr-1",
    title: "Continue Next Chapter",
    subtitle: "Thermodynamics & Heat Transfer",
    icon: "play-circle-outline",
    badgeText: "Resume",
    variant: "coral",
  },
  {
    id: "qr-2",
    title: "Take Assessment",
    subtitle: "Weekly Physics Speed Quiz",
    icon: "clipboard-outline",
    badgeText: "Quiz",
    variant: "purple",
  },
  {
    id: "qr-3",
    title: "Saved Formula Library",
    subtitle: "14 Formula Sheets & Notes",
    icon: "library-outline",
    badgeText: "Library",
    variant: "blue",
  },
  {
    id: "qr-4",
    title: "Student Profile",
    subtitle: "Target Exams & Study Schedule",
    icon: "person-outline",
    badgeText: "Account",
    variant: "amber",
  },
];
