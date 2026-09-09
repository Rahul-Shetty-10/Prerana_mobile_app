import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LibraryStackParamList } from "./types";
import { MyLibraryHomeScreen } from "../features/library";

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
                const targetChapter = {
                  id: shelf.chapterId,
                  number: shelf.chapterNumber,
                  partNumber: shelf.partNumber,
                  title: shelf.chapterName,
                  subtitle: "",
                };

                (parent as any).navigate("SubjectsTab", {
                  screen: "ChapterResource",
                  params: {
                    chapter: targetChapter,
                    subjectName: shelf.subjectName || "Subject",
                    subjectId: shelf.subjectId,
                  },
                });
              }
            }}
            onOpenFeaturedResource={(resource) => {
              const parent = navigation.getParent();
              if (parent) {
                const chapterNumberMatch = resource.chapterName.match(/chapter\s+(\d+)/i);
                const targetChapter = {
                  id: resource.chapterId,
                  number: chapterNumberMatch ? Number(chapterNumberMatch[1]) : 1,
                  partNumber: 1,
                  title: resource.chapterName,
                  subtitle: "",
                };

                (parent as any).navigate("SubjectsTab", {
                  screen: "ChapterResource",
                  params: {
                    chapter: targetChapter,
                    subjectName: resource.subjectName || "Subject",
                    subjectId: resource.subjectId,
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
