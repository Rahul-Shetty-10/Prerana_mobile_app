import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SubjectsStackParamList } from "./types";
import {
  ChapterResourceScreen,
  SubjectSelectionScreen,
  SubjectWorkspaceScreen,
} from "../features/subjects";
import { ExerciseResultScreen, ExerciseScreen, ReviewScreen } from "../features/exercise";

const Stack = createNativeStackNavigator<SubjectsStackParamList>();

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface SubjectsNavigatorProps {
  getToken?: GetToken;
}

export function SubjectsNavigator({ getToken }: SubjectsNavigatorProps) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="SubjectSelection">
        {({ navigation }) => (
          <SubjectSelectionScreen
            getToken={getToken}
            onSelectSubject={(subject) => {
              navigation.navigate("SubjectWorkspace", { subject });
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="SubjectWorkspace">
        {({ route, navigation }) => (
          <SubjectWorkspaceScreen
            getToken={getToken}
            onBackPress={() => navigation.goBack()}
            onOpenFundamentals={() => {
              const parent = navigation.getParent();
              if (parent) {
                (parent as any).navigate("FundamentalsTab", {
                  screen: "FundamentalsHome",
                });
              }
            }}
            onSelectChapter={(chapter) => {
              navigation.navigate("ChapterResource", {
                chapter,
                subjectName: route.params.subject.name,
                subjectId: route.params.subject.id,
              });
            }}
            subject={route.params.subject}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="ChapterResource">
        {({ route, navigation }) => (
          <ChapterResourceScreen
            chapter={route.params.chapter}
            getToken={getToken}
            initialTab={route.params.initialTab}
            onBackPress={() => navigation.goBack()}
            subjectId={route.params.subjectId}
            subjectName={route.params.subjectName}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Exercise">
        {({ route, navigation }) => (
          <ExerciseScreen
            getToken={getToken}
            onBackPress={() => navigation.goBack()}
            onSubmitSuccess={(resData, revData) => {
              navigation.navigate("ExerciseResult", {
                resultData: resData,
                reviewData: revData,
                trackType: route.params.trackType,
                subjectId: route.params.subjectId,
                chapterId: route.params.chapterId,
                subjectSlug: route.params.subjectSlug,
                trackSlug: route.params.trackSlug,
                chapter: route.params.chapter,
                subjectName: route.params.subjectName,
              });
            }}
            trackType={route.params.trackType}
            subjectId={route.params.subjectId}
            chapterId={route.params.chapterId}
            subjectSlug={route.params.subjectSlug}
            trackSlug={route.params.trackSlug}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="ExerciseResult">
        {({ route, navigation }) => (
          <ExerciseResultScreen
            onBackToSubject={() => {
              if (route.params.chapter && route.params.subjectName) {
                navigation.navigate("ChapterResource", {
                  chapter: route.params.chapter,
                  subjectName: route.params.subjectName,
                  subjectId: route.params.subjectId,
                });
              } else {
                navigation.goBack();
              }
            }}
            onRetryExercise={() => {
              navigation.navigate("Exercise", {
                trackType: route.params.trackType,
                subjectId: route.params.subjectId,
                chapterId: route.params.chapterId,
                subjectSlug: route.params.subjectSlug,
                trackSlug: route.params.trackSlug,
                chapter: route.params.chapter,
                subjectName: route.params.subjectName,
              });
            }}
            onReviewAnswers={() => {
              navigation.navigate("Review", {
                trackType: route.params.trackType,
                subjectId: route.params.subjectId,
                chapterId: route.params.chapterId,
                subjectSlug: route.params.subjectSlug,
                trackSlug: route.params.trackSlug,
                resultData: route.params.resultData,
                reviewData: route.params.reviewData,
                chapter: route.params.chapter,
                subjectName: route.params.subjectName,
              });
            }}
            resultData={route.params.resultData}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Review">
        {({ route, navigation }) => (
          <ReviewScreen
            getToken={getToken}
            onBackToResult={() => {
              navigation.navigate("ExerciseResult", {
                trackType: route.params.trackType,
                subjectId: route.params.subjectId,
                chapterId: route.params.chapterId,
                subjectSlug: route.params.subjectSlug,
                trackSlug: route.params.trackSlug,
                resultData: route.params.resultData,
                reviewData: route.params.reviewData,
                chapter: route.params.chapter,
                subjectName: route.params.subjectName,
              });
            }}
            onBackToSubject={() => {
              if (route.params.chapter && route.params.subjectName) {
                navigation.navigate("ChapterResource", {
                  chapter: route.params.chapter,
                  subjectName: route.params.subjectName,
                  subjectId: route.params.subjectId,
                });
              } else {
                navigation.goBack();
              }
            }}
            onRetryExercise={() => {
              navigation.navigate("Exercise", {
                trackType: route.params.trackType,
                subjectId: route.params.subjectId,
                chapterId: route.params.chapterId,
                subjectSlug: route.params.subjectSlug,
                trackSlug: route.params.trackSlug,
                chapter: route.params.chapter,
                subjectName: route.params.subjectName,
              });
            }}
            reviewData={route.params.reviewData}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}