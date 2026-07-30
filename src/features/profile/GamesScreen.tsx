import React from "react";
import { useTheme } from "../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../shared/components/Header";
import { colors, radius, spacing, typography } from "../../shared/theme";

export function GamesScreen() {
  const { theme  } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <Header title="Arcade" />
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Arcade</Text>
          <Text style={styles.body}>Games module coming soon.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  card: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  body: {
    fontSize: typography.fontSize.md,
    color: themeColors.textSecondary,
    textAlign: "center",
  },
});