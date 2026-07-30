import {
  AssessmentHistoryPayload,
  QuizLandingPayload,
  QuizzesHomePayload,
} from "../types";

export const MOCK_QUIZZES_HOME_DATA: QuizzesHomePayload = {
  hero: {
    title: "Quizzes",
    subtitle: "Resume, review and start quizzes.",
    stats: {
      activeSubjects: 6,
      nextAvailableChapter: "Chapter 1",
      chapterQuizEntries: 16,
      recordedAttempts: 0,
    },
  },
  quickActions: [
    {
      id: "qa-1",
      title: "Start From My Subjects",
      description:
        "Choose a subject workspace to access all chapter resources and available quizzes.",
      buttonText: "Open My Subjects",
      iconName: "grid-outline",
      actionType: "openSubjects",
    },
    {
      id: "qa-2",
      title: "Jump To Next Chapter Quiz",
      description:
        "Quickly access the next available chapter quiz entry in your enrolled science curriculum.",
      buttonText: "Open Next Quiz",
      iconName: "play-outline",
      actionType: "openNextQuiz",
    },
    {
      id: "qa-3",
      title: "Assessment History",
      description:
        "View your past quiz performance, review answer breakdowns, and track attempt status.",
      buttonText: "View History",
      iconName: "time-outline",
      actionType: "viewHistory",
    },
  ],
  inProgress: {
    title: "Reopen In Progress Quiz Routes",
    emptyStateText:
      "No in-progress quiz routes found. Start a new chapter quiz from the ready list below.",
    badgeText: "0 In Progress",
    items: [],
  },
  awaitingReview: {
    title: "Awaiting Review",
    emptyStateText: "No quiz attempts currently awaiting review.",
    badgeText: "0 Pending",
    items: [],
  },
  readyToStart: [
    {
      id: "entry-1",
      chapterId: "chap-1",
      chapterName: "Chemical Reactions & Equations",
      chapterNumber: 1,
      subjectId: "subj-science",
      subjectName: "General Science",
      subtitle: "Chapter 1 • 15 Conceptual Questions",
    },
    {
      id: "entry-2",
      chapterId: "chap-2",
      chapterName: "Acids, Bases & Salts",
      chapterNumber: 2,
      subjectId: "subj-science",
      subjectName: "General Science",
      subtitle: "Chapter 2 • 15 Conceptual Questions",
    },
    {
      id: "entry-3",
      chapterId: "chap-3",
      chapterName: "Metals & Non-metals",
      chapterNumber: 3,
      subjectId: "subj-science",
      subjectName: "General Science",
      subtitle: "Chapter 3 • 15 Conceptual Questions",
    },
    {
      id: "entry-4",
      chapterId: "chap-5",
      chapterName: "Life Processes",
      chapterNumber: 5,
      subjectId: "subj-science",
      subjectName: "General Science",
      subtitle: "Chapter 5 • 20 Conceptual Questions",
    },
  ],
  recentCompleted: {
    title: "Recent Completed Attempts",
    emptyStateText: "No recent completed quiz attempts recorded.",
    badgeText: "0 Completed",
    items: [],
  },
};

export const MOCK_ASSESSMENT_HISTORY_DATA: AssessmentHistoryPayload = {
  hero: {
    title: "Assessment History",
    subtitle: "Attempts and results.",
    stats: {
      activeSubjects: 6,
      quizReadyChapters: 16,
      recordedAttempts: 0,
    },
  },
  scope: {
    enrolledGrade: "Class 10 - Secondary",
    activeSubjectsCount: 6,
    curriculumChaptersCount: 16,
    recordedAttemptsCount: 0,
  },
  recentAttempts: {
    title: "Recent Attempts",
    emptyStateText: "No recent assessment attempts recorded.",
    badgeText: "0 Attempts",
    items: [],
  },
  inProgressAttempts: {
    title: "In Progress Attempts",
    emptyStateText: "No quiz attempts currently in progress.",
    badgeText: "0 Active",
    items: [],
  },
  availableQuizEntries: MOCK_QUIZZES_HOME_DATA.readyToStart,
};

export const MOCK_QUIZ_LANDING_DATA: QuizLandingPayload = {
  chapterNumber: 1,
  chapterTitle: "Chemical Reactions & Equations",
  subjectId: "subj-science",
  subjectName: "General Science",
  heroTitle: "No chapter quiz published",
  heroSubtitle:
    "This chapter does not have a published quiz for your enrolled section yet.",
};
