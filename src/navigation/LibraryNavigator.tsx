import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LibraryStackParamList } from "./types";
import { MyLibraryHomeScreen } from "../features/library";
import { MOCK_SUBJECTS_LIST, MOCK_SUBJECT_WORKSPACE } from "../features/subjects/constants/subjectsData";

const Stack = createNativeStackNavigator<LibraryStackParamList>();

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface LibraryNavigatorProps {
  getToken?: GetToken;
}

export function LibraryNavigator({ getToken }: LibraryNavigatorProps) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="LibraryHome">
        {({ navigation }) => (
          <MyLibraryHomeScreen
            getToken={getToken}
            onOpenChapterShelf={(shelf) => {
              const parent = navigation.getParent();
              if (parent) {
                const targetSubject =
                  MOCK_SUBJECTS_LIST.find((s) => s.id === shelf.subjectId) || MOCK_SUBJECTS_LIST[1];
                const targetChapter =
                  MOCK_SUBJECT_WORKSPACE.chapters.find((c) => c.id === shelf.chapterId) ||
                  MOCK_SUBJECT_WORKSPACE.chapters[0];

                (parent as any).navigate("SubjectsTab", {
                  screen: "ChapterResource",
                  params: {
                    chapter: targetChapter,
                    subjectName: shelf.subjectName || targetSubject.name,
                    subjectId: shelf.subjectId || targetSubject.id,
                  },
                });
              }
            }}
            onOpenFeaturedResource={(resource) => {
              const parent = navigation.getParent();
              if (parent) {
                const targetSubject =
                  MOCK_SUBJECTS_LIST.find((s) => s.id === resource.subjectId) || MOCK_SUBJECTS_LIST[1];
                const targetChapter =
                  MOCK_SUBJECT_WORKSPACE.chapters.find((c) => c.id === resource.chapterId) ||
                  MOCK_SUBJECT_WORKSPACE.chapters[0];

                (parent as any).navigate("SubjectsTab", {
                  screen: "ChapterResource",
                  params: {
                    chapter: targetChapter,
                    subjectName: resource.subjectName || targetSubject.name,
                    subjectId: resource.subjectId || targetSubject.id,
                    initialTab: resource.resourceTab,
                  },
                });
              }
            }}
            onOpenMySubjects={() => {
              const parent = navigation.getParent();
              if (parent) {
                (parent as any).navigate("SubjectsTab", {
                  screen: "SubjectSelection",
                  params: { fromTab: "LibraryTab" },
                });
              }
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}