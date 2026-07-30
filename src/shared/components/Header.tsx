import React from "react";
import { useTheme } from "../theme/ThemeContext";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppIcon } from "../icons";
import { colors, radius, spacing, typography } from "../theme";

export interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showThemeToggle?: boolean;
  showProfile?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
  avatarUrl?: string;
}

export function Header({
  title,
  showBackButton,
  showThemeToggle = true,
  showProfile = true,
  rightComponent,
  onBackPress,
  avatarUrl,
}: HeaderProps) {
  const navigation = useNavigation<any>();
  const { theme, toggleTheme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);
  const canGoBack = navigation.canGoBack();
  const shouldShowBack = showBackButton ?? canGoBack;

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (canGoBack) {
      navigation.goBack();
    }
  };

  const handleProfilePress = () => {
    navigation.navigate("Profile");
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background, borderBottomColor: themeColors.border }]}>
      {/* Left Section: Back Button + Title or Logo */}
      <View style={styles.leftSection}>
        {shouldShowBack ? (
          <Pressable
            accessibilityLabel="Go Back"
            accessibilityRole="button"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={handleBack}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: themeColors.surfaceSecondary, borderColor: themeColors.border },
              pressed && styles.pressedScale,
            ]}
          >
            <AppIcon color={themeColors.textPrimary} name="arrow-back-outline" size={20} />
          </Pressable>
        ) : null}

        {title ? (
          <Text numberOfLines={1} style={[styles.titleText, { color: themeColors.textPrimary }]}>
            {title}
          </Text>
        ) : (
          <Image
            accessibilityLabel="Prerana Logo"
            resizeMode="contain"
            source={isDark ? require("../../../Logo.webp") : require("../../../Logo_light.webp")}
            style={styles.brandLogo}
          />
        )}
      </View>

      {/* Right Section: Theme Toggle, Profile Avatar or Custom Component */}
      <View style={styles.rightSection}>
        {rightComponent}

        {!rightComponent && showThemeToggle ? (
          <Pressable
            accessibilityLabel="Toggle Theme"
            accessibilityRole="button"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={toggleTheme}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: themeColors.surfaceSecondary, borderColor: themeColors.border },
              pressed && styles.pressedScale,
            ]}
          >
            <AppIcon
              color={isDark ? colors.secondary.main : colors.primary.main}
              name={isDark ? "sunny-outline" : "moon-outline"}
              size={20}
            />
          </Pressable>
        ) : null}

        {!rightComponent && showProfile ? (
          <Pressable
            accessibilityLabel="Profile Settings"
            accessibilityRole="button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={handleProfilePress}
            style={({ pressed }) => [
              styles.avatarButton,
              { borderColor: colors.primary.main },
              pressed && styles.pressedScale,
            ]}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: themeColors.surfaceSecondary }]}>
                <Text style={[styles.avatarInitialText, { color: colors.primary.main }]}>S</Text>
              </View>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  titleText: {
    fontSize: typography.fontSize.md + 1,
    fontWeight: typography.fontWeight.heavy,
    maxWidth: "80%",
  },
  brandLogo: {
    height: 30,
    width: 110,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.button,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 2,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitialText: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.heavy,
  },
  pressed: {
    opacity: 0.75,
  },
  pressedScale: {
    transform: [{ scale: 0.94 }],
    opacity: 0.85,
  },
});