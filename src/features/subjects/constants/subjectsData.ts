import { SubjectMeta, SubjectWorkspacePayload } from "../types";

export const MOCK_SUBJECTS_LIST: SubjectMeta[] = [
  {
    id: "subj-english",
    name: "English",
    chapterCount: 12,
    partCount: 24,
    iconName: "book-outline",
    colorVariant: "amber",
  },
  {
    id: "subj-science",
    name: "General Science",
    chapterCount: 16,
    partCount: 32,
    iconName: "flask-outline",
    colorVariant: "coral",
  },
  {
    id: "subj-hindi",
    name: "Hindi",
    chapterCount: 10,
    partCount: 20,
    iconName: "book-outline",
    colorVariant: "purple",
  },
  {
    id: "subj-kannada",
    name: "Kannada",
    chapterCount: 14,
    partCount: 28,
    iconName: "language-outline",
    colorVariant: "emerald",
  },
  {
    id: "subj-maths",
    name: "Mathematics",
    chapterCount: 18,
    partCount: 36,
    iconName: "calculator-outline",
    colorVariant: "blue",
  },
  {
    id: "subj-social",
    name: "Social Studies",
    chapterCount: 15,
    partCount: 30,
    iconName: "earth-outline",
    colorVariant: "coral",
  },
];

export const MOCK_SUBJECT_WORKSPACE: SubjectWorkspacePayload = {
  subject: MOCK_SUBJECTS_LIST[1], // General Science
  stats: {
    completedChapters: 6,
    totalChapters: 16,
  },
  chapters: [
    {
      id: "chap-1",
      number: 1,
      partNumber: 1,
      title: "Chemical Reactions & Equations",
      subtitle: "Open this chapter for a focused student view.",
    },
    {
      id: "chap-2",
      number: 2,
      partNumber: 1,
      title: "Acids, Bases & Salts",
      subtitle: "Open this chapter for a focused student view.",
    },
    {
      id: "chap-3",
      number: 3,
      partNumber: 1,
      title: "Metals & Non-metals",
      subtitle: "Open this chapter for a focused student view.",
    },
    {
      id: "chap-4",
      number: 4,
      partNumber: 1,
      title: "Carbon & Its Compounds",
      subtitle: "Open this chapter for a focused student view.",
    },
    {
      id: "chap-5",
      number: 5,
      partNumber: 2,
      title: "Life Processes",
      subtitle: "Open this chapter for a focused student view.",
    },
    {
      id: "chap-6",
      number: 6,
      partNumber: 2,
      title: "Control & Coordination",
      subtitle: "Open this chapter for a focused student view.",
    },
  ],
};
