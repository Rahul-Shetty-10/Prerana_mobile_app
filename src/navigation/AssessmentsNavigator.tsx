import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AssessmentsStackParamList } from "./types";
import {
  AssessmentHistoryScreen,
  QuizLandingScreen,
  QuizzesHomeScreen,
} from "../features/assessments";

const Stack = createNativeStackNavigator<AssessmentsStackParamList>();

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface AssessmentsNavigatorProps {
  getToken?: GetToken;
}

export function AssessmentsNavigator({ getToken }: AssessmentsNavigatorProps) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="QuizzesHome">
        {({ navigation }) => (
          <QuizzesHomeScreen
            getToken={getToken}
            onOpenMySubjects={() => {
              const parent = navigation.getParent();
              if (parent) {
                (parent as any).navigate("SubjectsTab", {
                  screen: "SubjectSelection",
                  params: { fromTab: "AssessmentsTab" },
                });
              }
            }}
            onOpenNextQuiz={() => {
              const parent = navigation.getParent();
              (parent as any)?.navigate("SubjectsTab", {
                screen: "SubjectSelection",
                params: { fromTab: "AssessmentsTab" },
              });
            }}
            onOpenQuiz={(entry) => {
              navigation.navigate("QuizLanding", {
                subjectId: entry.subjectId,
                chapterId: entry.chapterId,
              });
            }}
            onViewHistory={() => {
              navigation.navigate("AssessmentHistory");
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="AssessmentHistory">
        {({ navigation }) => (
          <AssessmentHistoryScreen
            getToken={getToken}
            onOpenAvailableQuiz={() => {
              const parent = navigation.getParent();
              (parent as any)?.navigate("SubjectsTab", {
                screen: "SubjectSelection",
                params: { fromTab: "AssessmentsTab" },
              });
            }}
            onOpenMySubjects={() => {
              const parent = navigation.getParent();
              if (parent) {
                (parent as any).navigate("SubjectsTab", {
                  screen: "SubjectSelection",
                  params: { fromTab: "AssessmentsTab" },
                });
              }
            }}
            onOpenQuiz={(entry) => {
              navigation.navigate("QuizLanding", {
                subjectId: entry.subjectId,
                chapterId: entry.chapterId,
              });
            }}
            onSwitchToQuizzes={() => {
              navigation.navigate("QuizzesHome");
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="QuizLanding">
        {({ route, navigation }) => (
          <QuizLandingScreen
            chapterId={route.params?.chapterId || ""}
            getToken={getToken}
            onBackToChapter={(subjectId) => {
              const parent = navigation.getParent();
              if (parent) {
                (parent as any).navigate("SubjectsTab", {
                  screen: "SubjectSelection",
                  params: { fromTab: "AssessmentsTab", subjectId },
                });
              }
            }}
            onBrowseQuizzes={() => {
              navigation.navigate("QuizzesHome");
            }}
            subjectId={route.params?.subjectId || ""}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
