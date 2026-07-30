import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ArcadeStackParamList } from "./types";
import { ArcadeHomeScreen, BrainBlitzScreen, LightningTapScreen, MatchMasterScreen, PuzzleQuestScreen } from "../features/arcade";

const Stack = createNativeStackNavigator<ArcadeStackParamList>();

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface ArcadeNavigatorProps {
  getToken?: GetToken;
}

export function ArcadeNavigator({ getToken }: ArcadeNavigatorProps) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="ArcadeHome">
        {({ navigation }) => (
          <ArcadeHomeScreen
            getToken={getToken}
            onPlayGame={(gameId) => {
              if (gameId === "brainBlitz") {
                navigation.navigate("BrainBlitz");
              } else if (gameId === "matchMaster") {
                navigation.navigate("MatchMaster");
              } else if (gameId === "lightningTap") {
                navigation.navigate("LightningTap");
              } else if (gameId === "puzzleQuest") {
                navigation.navigate("PuzzleQuest");
              }
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="BrainBlitz">
        {({ navigation }) => (
          <BrainBlitzScreen
            onReturnHome={() => {
              navigation.navigate("ArcadeHome");
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="MatchMaster">
        {({ navigation }) => (
          <MatchMasterScreen
            onReturnHome={() => {
              navigation.navigate("ArcadeHome");
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="LightningTap">
        {({ navigation }) => (
          <LightningTapScreen
            onReturnHome={() => {
              navigation.navigate("ArcadeHome");
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="PuzzleQuest">
        {({ navigation }) => (
          <PuzzleQuestScreen
            onReturnHome={() => {
              navigation.navigate("ArcadeHome");
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}