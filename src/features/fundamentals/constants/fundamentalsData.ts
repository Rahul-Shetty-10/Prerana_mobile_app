import { SubjectItem } from "../types";

export const MOCK_FUNDAMENTALS_SUBJECTS: SubjectItem[] = [
  {
    id: "subj-science",
    title: "General Science",
    description: "Master foundational concepts in Physics, Chemistry, and Biology through interactive modules.",
    iconName: "flask-outline",
    previewBadgeText: "CORE SCIENCE",
    trackCount: 12,
    questionCount: 450,
    colorVariant: "coral",
  },
  {
    id: "subj-hindi",
    title: "Hindi",
    description: "Comprehensive grammar, literature, and vocabulary practice for Karnataka Board curriculum.",
    iconName: "book-outline",
    previewBadgeText: "LANGUAGE",
    trackCount: 8,
    questionCount: 280,
    colorVariant: "amber",
  },
  {
    id: "subj-kannada",
    title: "Kannada",
    description: "State curriculum Kannada language, prose, poetry, and grammar tracks.",
    iconName: "language-outline",
    previewBadgeText: "REGIONAL LANG",
    trackCount: 9,
    questionCount: 320,
    colorVariant: "purple",
  },
  {
    id: "subj-maths",
    title: "Mathematics",
    description: "Core arithmetic, algebra, geometry, mensuration, and formula application tracks.",
    iconName: "calculator-outline",
    previewBadgeText: "FOUNDATION",
    trackCount: 15,
    questionCount: 580,
    colorVariant: "blue",
  },
  {
    id: "subj-social",
    title: "Social Studies",
    description: "History, Civics, Geography, and Economics foundational study sets and quizzes.",
    iconName: "earth-outline",
    previewBadgeText: "SOCIAL SCIENCE",
    trackCount: 10,
    questionCount: 390,
    colorVariant: "emerald",
  },
];

export const MOCK_FUNDAMENTALS_HEADER = {
  subjectCount: 5,
  trackCount: 54,
};
