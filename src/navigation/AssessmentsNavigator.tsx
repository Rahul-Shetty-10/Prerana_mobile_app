import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AssessmentsStackParamList } from "./types";
import {
  AssessmentHistoryScreen,
  QuizLandingScreen,
  QuizzesHomeScreen,
} from "../features/assessments";
import { MOCK_SUBJECTS_LIST } from "../features/subjects/constants/subjectsData";

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
                });
              }
            }}
            onOpenNextQuiz={() => {
              navigation.navigate("QuizLanding", {
                subjectId: "subj-science",
                chapterId: "chap-1",
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
              navigation.navigate("QuizLanding", {
                subjectId: "subj-science",
                chapterId: "chap-1",
              });
            }}
            onOpenMySubjects={() => {
              const parent = navigation.getParent();
              if (parent) {
                (parent as any).navigate("SubjectsTab", {
                  screen: "SubjectSelection",
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
            chapterId={route.params?.chapterId || "chap-1"}
            getToken={getToken}
            onBackToChapter={(subjectId) => {
              const parent = navigation.getParent();
              if (parent) {
                const targetSubject =
                  MOCK_SUBJECTS_LIST.find((s) => s.id === subjectId) || MOCK_SUBJECTS_LIST[1];

                (parent as any).navigate("SubjectsTab", {
                  screen: "SubjectWorkspace",
                  params: {
                    subject: targetSubject,
                  },
                });
              }
            }}
            onBrowseQuizzes={() => {
              navigation.navigate("QuizzesHome");
            }}
            subjectId={route.params?.subjectId || "subj-science"}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}