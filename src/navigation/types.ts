import { SubjectItem } from "../features/fundamentals/types";
import { ExerciseResultData, ReviewPayload, TrackType } from "../features/exercise/types";
import { ChapterItem, ResourceTabType, SubjectMeta } from "../features/subjects/types";

export type RootTabParamList = {
  DashboardTab: undefined;
  FundamentalsTab: undefined;
  SubjectsTab: undefined;
  LibraryTab: undefined;
  AssessmentsTab: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Profile: undefined;
  Games: undefined;
};


export type FundamentalsStackParamList = {
  FundamentalsHome: undefined;
  SubjectDetail: { subject: SubjectItem };
  Exercise: { trackType: TrackType; subjectId?: string; chapterId?: string; subjectSlug?: string; trackSlug?: string; title?: string };
  ExerciseResult: { resultData?: ExerciseResultData; reviewData?: ReviewPayload; trackType: TrackType; subjectId?: string; chapterId?: string; subjectSlug?: string; trackSlug?: string; attemptId?: string };
  Review: { resultData?: ExerciseResultData; reviewData?: ReviewPayload; trackType: TrackType; subjectId?: string; chapterId?: string; subjectSlug?: string; trackSlug?: string; attemptId?: string };
};

export type SubjectsStackParamList = {
  SubjectSelection: undefined;
  SubjectWorkspace: { subject: SubjectMeta };
  ChapterResource: {
    chapter: ChapterItem;
    subjectName: string;
    subjectId?: string;
    initialTab?: ResourceTabType;
  };
  Exercise: {
    trackType: TrackType;
    subjectId?: string;
    chapterId?: string;
    subjectSlug?: string;
    trackSlug?: string;
    title?: string;
    chapter?: ChapterItem;
    subjectName?: string;
  };
  ExerciseResult: {
    resultData?: ExerciseResultData;
    reviewData?: ReviewPayload;
    trackType: TrackType;
    subjectId?: string;
    chapterId?: string;
    subjectSlug?: string;
    trackSlug?: string;
    attemptId?: string;
    chapter?: ChapterItem;
    subjectName?: string;
  };
  Review: {
    resultData?: ExerciseResultData;
    reviewData?: ReviewPayload;
    trackType: TrackType;
    subjectId?: string;
    chapterId?: string;
    subjectSlug?: string;
    trackSlug?: string;
    attemptId?: string;
    chapter?: ChapterItem;
    subjectName?: string;
  };
};

export type LibraryStackParamList = {
  LibraryHome: undefined;
};

export type AssessmentsStackParamList = {
  QuizzesHome: undefined;
  AssessmentHistory: undefined;
  QuizLanding: { subjectId?: string; chapterId?: string };
};

export type ArcadeStackParamList = {
  ArcadeHome: undefined;
  BrainBlitz: undefined;
  MatchMaster: undefined;
  LightningTap: undefined;
  PuzzleQuest: undefined;
};
