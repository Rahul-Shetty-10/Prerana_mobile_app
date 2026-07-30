import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { HeaderProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../shared/theme";

export function Header({
  userName = "Student",
  greeting = "Hello",
  notificationCount = 0,
  avatarUrl,
  onNotificationPress,
  onProfilePress,
}: HeaderProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const userInitial = userName.trim() ? userName.trim().charAt(0).toUpperCase() : "S";

  return (
    <View style={styles.container}>
      {/* Left Section: Official Prerana Logo */}
      <View style={styles.leftSection}>
        <Image
          accessibilityLabel="Prerana Logo"
          resizeMode="contain"
          source={isDark ? require("../../../../Logo.webp") : require("../../../../Logo_light.webp")}
          style={styles.brandLogo}
        />
      </View>

      {/* Right Section: Theme Toggle & Profile Avatar */}
      <View style={styles.rightSection}>
        <Pressable
          accessibilityLabel="Toggle Theme"
          accessibilityRole="button"
          onPress={onNotificationPress}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <AppIcon color={colors.secondary.main} name="sunny-outline" size={22} />
        </Pressable>

        <Pressable
          accessibilityLabel="Profile"
          accessibilityRole="button"
          onPress={onProfilePress}
          style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitialText}>{userInitial}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: themeColors.background,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  brandLogo: {
    height: 38,
    width: 140,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.primary.light,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: themeColors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitialText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    color: colors.primary.light,
  },
  pressed: {
    opacity: 0.8,
  },
});