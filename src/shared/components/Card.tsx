import React from "react";
import { useTheme } from "../theme/ThemeContext";
import { Pressable, View, ViewStyle } from "react-native";
import { colors, radius, shadows, spacing } from "../theme";
export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  padding?: number;
  marginHorizontal?: number;
  marginVertical?: number;
}

export function Card({
  children,
  style,
  onPress,
  padding = spacing.md,
  marginHorizontal = spacing.md,
  marginVertical = spacing.sm,
}: CardProps) {
  const { theme } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];

  const cardStyle = {
    backgroundColor: themeColors.surface,
    borderColor: themeColors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    padding,
    marginHorizontal,
    marginVertical,
    ...shadows.sm,
  };

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          style,
          pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}