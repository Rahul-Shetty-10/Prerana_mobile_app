import { SubjectWorkspacePayload } from "../types";
import { MOCK_SUBJECTS } from "./mockSubjects";

export function getMockSubjectWorkspace(subjectId: string): SubjectWorkspacePayload {
  const match = MOCK_SUBJECTS.find(
    (s) => s.id === subjectId || s.name.toLowerCase() === subjectId.toLowerCase()
  );

  const subject = match || MOCK_SUBJECTS[0];
  const chapters = subject.chaptersList;

  return {
    subject: {
      id: subject.id,
      name: subject.name,
      chapterCount: chapters.length,
      partCount: subject.partCount,
      iconName: subject.iconName,
      colorVariant: subject.colorVariant,
    },
    stats: {
      completedChapters: Math.floor(chapters.length * (subject.progress / 100)),
      totalChapters: chapters.length,
    },
    chapters: chapters,
  };
}
