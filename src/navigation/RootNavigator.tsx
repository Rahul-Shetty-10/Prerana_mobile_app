import React from "react";
import { useTheme } from "../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AssessmentsNavigator } from "./AssessmentsNavigator";
import { FundamentalsNavigator } from "./FundamentalsNavigator";
import { LibraryNavigator } from "./LibraryNavigator";
import { SubjectsNavigator } from "./SubjectsNavigator";
import { ArcadeNavigator } from "./ArcadeNavigator";
import { RootStackParamList, RootTabParamList } from "./types";
import { DashboardScreen } from "../features/dashboard";
import { ProfileScreen } from "../features/profile";
import { AppIcon, IconName } from "../shared/icons";
import { colors, radius, spacing, typography } from "../shared/theme";
const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface RootNavigatorProps {
  getToken?: GetToken;
}

function MainTabs({ getToken }: { getToken?: GetToken }) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: themeColors.textMuted,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: themeColors.surface,
            borderTopColor: themeColors.border,
            height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ color, size }) => {
          let iconName: IconName = "square-outline";

          if (route.name === "DashboardTab") iconName = "speedometer-outline";
          else if (route.name === "FundamentalsTab") iconName = "book-outline";
          else if (route.name === "SubjectsTab") iconName = "grid-outline";
          else if (route.name === "LibraryTab") iconName = "library-outline";
          else if (route.name === "AssessmentsTab") iconName = "game-controller-outline";

          return <AppIcon color={color} name={iconName} size={size || 20} />;
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        options={{ tabBarLabel: "Dashboard" }}
      >
        {() => <DashboardScreen getToken={getToken} />}
      </Tab.Screen>

      <Tab.Screen
        name="FundamentalsTab"
        options={{ tabBarLabel: "Fundamentals" }}
      >
        {() => <FundamentalsNavigator getToken={getToken} />}
      </Tab.Screen>

      <Tab.Screen
        name="SubjectsTab"
        options={{ tabBarLabel: "Subjects" }}
      >
        {() => <SubjectsNavigator getToken={getToken} />}
      </Tab.Screen>

      <Tab.Screen
        listeners={({ navigation }) => ({
          tabPress: () => {
            (navigation as any).navigate("LibraryTab", { screen: "LibraryHome" });
          },
        })}
        name="LibraryTab"
        options={{ tabBarLabel: "My Library" }}
      >
        {() => <LibraryNavigator getToken={getToken} />}
      </Tab.Screen>

      <Tab.Screen
        listeners={({ navigation }) => ({
          tabPress: () => {
            (navigation as any).navigate("AssessmentsTab", { screen: "ArcadeHome" });
          },
        })}
        name="AssessmentsTab"
        options={{ tabBarLabel: "Arcade" }}
      >
        {() => <ArcadeNavigator getToken={getToken} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export function RootNavigator({ getToken }: RootNavigatorProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="MainTabs">
          {() => <MainTabs getToken={getToken} />}
        </Stack.Screen>
        <Stack.Screen name="Profile">
          {({ navigation }) => (
            <ProfileScreen
              onBackPress={() => {
                navigation.goBack();
              }}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Games">
          {() => <AssessmentsNavigator getToken={getToken} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function PlaceholderTabScreen({ title, iconName }: { title: string; iconName: IconName }) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.placeholderSafeArea}>
      <View style={styles.placeholderCard}>
        <View style={styles.placeholderIconShell}>
          <AppIcon color={colors.primary.main} name={iconName} size={32} />
        </View>
        <Text style={styles.placeholderTitle}>{title}</Text>
        <Text style={styles.placeholderSubtitle}>
          This section will be attached in the next development phase.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  tabBar: {
    backgroundColor: themeColors.surface,
    borderTopWidth: 1,
    borderTopColor: themeColors.border,
    minHeight: 60,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  placeholderSafeArea: {
    flex: 1,
    backgroundColor: themeColors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  placeholderCard: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  placeholderIconShell: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  placeholderSubtitle: {
    fontSize: typography.fontSize.sm,
    color: themeColors.textMuted,
    textAlign: "center",
  },
});