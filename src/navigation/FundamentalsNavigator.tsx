import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FundamentalsStackParamList } from "./types";
import { ExerciseResultScreen, ExerciseScreen, ReviewScreen } from "../features/exercise";
import { FundamentalsHomeScreen, SubjectDetailScreen } from "../features/fundamentals";

const Stack = createNativeStackNavigator<FundamentalsStackParamList>();

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface FundamentalsNavigatorProps {
  getToken?: GetToken;
}

export function FundamentalsNavigator({ getToken }: FundamentalsNavigatorProps) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="FundamentalsHome">
        {({ navigation }) => (
          <FundamentalsHomeScreen
            getToken={getToken}
            onOpenMySubjects={() => {
              const parent = navigation.getParent();
              if (parent) {
                (parent as any).navigate("SubjectsTab", {
                  screen: "SubjectSelection",
                });
              }
            }}
            onSelectSubject={(subject) => {
              navigation.navigate("SubjectDetail", { subject });
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="SubjectDetail">
        {({ route, navigation }) => (
          <SubjectDetailScreen
            onBackPress={() => navigation.goBack()}
            onSelectTrack={(trackType) => {
              navigation.navigate("Exercise", {
                trackType,
                subjectId: route.params.subject.id,
                subjectSlug: route.params.subject.subjectSlug,
                trackSlug: trackType,
                title: `${route.params.subject.title} - ${trackType.toUpperCase()} TRACK`,
              });
            }}
            subject={route.params.subject}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Exercise">
        {({ route, navigation }) => (
          <ExerciseScreen
            getToken={getToken}
            onBackPress={() => navigation.goBack()}
            onSubmitSuccess={() => {
              navigation.navigate("ExerciseResult", {
                trackType: route.params.trackType,
                subjectId: route.params.subjectId,
                chapterId: route.params.chapterId,
                subjectSlug: route.params.subjectSlug,
                trackSlug: route.params.trackSlug,
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
              navigation.navigate("FundamentalsHome");
            }}
            onRetryExercise={() => {
              navigation.navigate("Exercise", {
                trackType: route.params.trackType,
                subjectId: route.params.subjectId,
                chapterId: route.params.chapterId,
                subjectSlug: route.params.subjectSlug,
                trackSlug: route.params.trackSlug,
              });
            }}
            onReviewAnswers={() => {
              navigation.navigate("Review", {
                trackType: route.params.trackType,
                subjectId: route.params.subjectId,
                chapterId: route.params.chapterId,
                subjectSlug: route.params.subjectSlug,
                trackSlug: route.params.trackSlug,
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
              });
            }}
            onBackToSubject={() => {
              navigation.navigate("FundamentalsHome");
            }}
            onRetryExercise={() => {
              navigation.navigate("Exercise", {
                trackType: route.params.trackType,
                subjectId: route.params.subjectId,
                chapterId: route.params.chapterId,
                subjectSlug: route.params.subjectSlug,
                trackSlug: route.params.trackSlug,
              });
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}