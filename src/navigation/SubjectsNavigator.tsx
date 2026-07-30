import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SubjectsStackParamList } from "./types";
import {
  ChapterResourceScreen,
  SubjectSelectionScreen,
  SubjectWorkspaceScreen,
} from "../features/subjects";

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
    </Stack.Navigator>
  );
}