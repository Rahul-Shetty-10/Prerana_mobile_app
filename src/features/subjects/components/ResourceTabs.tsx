import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, ScrollView, View } from "react-native";
import { ResourceTabButton } from "./ResourceTabButton";
import { ResourceTabsProps } from "../types";
import { colors, spacing } from "../../../shared/theme";
export function ResourceTabs({ tabs = [], activeTab, onTabSelect }: ResourceTabsProps) {
  const { theme } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => (
          <ResourceTabButton
            key={tab.id}
            isActive={tab.id === activeTab}
            onPress={onTabSelect}
            tab={tab}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    paddingVertical: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    flexDirection: "row",
  },
});