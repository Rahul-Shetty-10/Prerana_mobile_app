import { ChapterResourcesPayload } from "../services/chapterResourcesService";
import {
  MOCK_MINDMAP_ROOT,
  MOCK_PDF_PAGES,
  MOCK_FLASHCARDS,
  MOCK_TABLE_COLUMNS,
  MOCK_TABLE_ROWS,
} from "../constants/viewerData";

export function getMockChapterResources(subjectId: string, chapterId: string): ChapterResourcesPayload {
  // Try to find the subject name to personalize the title
  let subjectName = "Subject";
  if (subjectId.includes("maths")) subjectName = "Mathematics";
  else if (subjectId.includes("physics")) subjectName = "Physics";
  else if (subjectId.includes("chemistry")) subjectName = "Chemistry";
  else if (subjectId.includes("biology")) subjectName = "Biology";
  else if (subjectId.includes("compsci")) subjectName = "Computer Science";
  else if (subjectId.includes("english")) subjectName = "English";
  else if (subjectId.includes("history")) subjectName = "History";
  else if (subjectId.includes("geography")) subjectName = "Geography";

  // Create a customized mindmap root node title
  const customMindmapRoot = {
    ...MOCK_MINDMAP_ROOT,
    label: `${subjectName} - Chapter Concept Map`,
  };

  return {
    subjectId,
    chapterId,
    chapterTitle: `${subjectName} Core Resource Hub`,
    infographicUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600",
    infographicDescription: `A comprehensive visual layout of key definitions, formulas, and conceptual relationships for ${subjectName}.`,
    mindmapRoot: customMindmapRoot,
    slidedeckPages: MOCK_PDF_PAGES,
    textbookPages: MOCK_PDF_PAGES,
    flashcards: MOCK_FLASHCARDS,
    tableTitle: "Key Formulas, Concepts & Structures",
    tableColumns: MOCK_TABLE_COLUMNS,
    tableRows: MOCK_TABLE_ROWS,
    audioTitle: `Essential Revision Audio Summary - ${subjectName}`,
    audioDurationSeconds: 240,
    videoTitle: `Full Topic Masterclass Video - ${subjectName}`,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  };
}
