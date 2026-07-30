import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, View } from "react-native";
import { AppIcon } from "../../../shared/icons";
import { colors, spacing } from "../../../shared/theme";

export interface LivesIndicatorProps {
  lives: number;
  maxLives?: number;
}

export function LivesIndicator({
  lives,
  maxLives = 3,
}: LivesIndicatorProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const hearts = Array.from({ length: maxLives });

  return (
    <View style={styles.container}>
      {hearts.map((_, idx) => {
        const isFilled = idx < lives;
        return (
          <AppIcon
            key={idx}
            color={isFilled ? "#EF4444" : themeColors.border}
            name={isFilled ? "heart" : "heart-outline"}
            size={18}
          />
        );
      })}
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
});