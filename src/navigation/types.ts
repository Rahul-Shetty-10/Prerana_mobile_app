import { SubjectItem } from "../features/fundamentals/types";
import { ExerciseResultData, TrackType } from "../features/exercise/types";
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
  Exercise: { trackType: TrackType; subjectId?: string; title?: string };
  ExerciseResult: { resultData?: ExerciseResultData; trackType: TrackType; subjectId?: string };
  Review: { trackType: TrackType; subjectId?: string };
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
