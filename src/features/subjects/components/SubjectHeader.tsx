import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Breadcrumb } from "./Breadcrumb";
import { SubjectHeaderProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../shared/theme";

export function SubjectHeader({
  breadcrumbItems,
  subjectName,
  title,
  onBackPress,
}: SubjectHeaderProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  return (
    <View style={styles.container}>
      {/* Top Header Row with Optional Back Button */}
      <View style={styles.topRow}>
        {onBackPress ? (
          <Pressable
            accessibilityLabel="Back to Subjects Selection"
            accessibilityRole="button"
            onPress={onBackPress}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <AppIcon color={themeColors.textPrimary} name="arrow-back-outline" size={18} />
          </Pressable>
        ) : null}

        <View style={styles.breadcrumbBlock}>
          <Breadcrumb items={breadcrumbItems} />
        </View>
      </View>

      {/* Subject Name & Workspace Title */}
      <View style={styles.titleBlock}>
        <Text style={styles.subjectNameText}>{subjectName}</Text>
        <Text style={styles.titleText}>{title}</Text>
      </View>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.xs,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  breadcrumbBlock: {
    flex: 1,
  },
  titleBlock: {
    gap: 2,
    marginTop: 2,
  },
  subjectNameText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: colors.primary.light,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  titleText: {
    fontSize: typography.fontSize.xl - 2,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
});